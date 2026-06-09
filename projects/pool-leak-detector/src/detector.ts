/**
 * Core AST-based leak detector
 */

import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/types';
import type { AcquiredResource, DetectionResult, LeakIssue } from './types.js';
import { pgRules } from './rules/pg-rules.js';
import { mysql2Rules } from './rules/mysql2-rules.js';
import { prismaRules } from './rules/prisma-rules.js';

/**
 * Main detector class
 */
export class LeakDetector {
  private resources: Map<string, AcquiredResource[]> ***REMOVED*** new Map();

  /**
   * Analyze a TypeScript/JavaScript file for pool leaks
   */
  analyze(filePath: string, sourceCode: string): DetectionResult {
    const startTime ***REMOVED*** performance.now();
    const issues: LeakIssue[] ***REMOVED*** [];

    try {
      const ast ***REMOVED*** parse(sourceCode, {
        loc: true,
        range: true,
        comment: false,
        tokens: false,
        jsx: false,
      });

      this.resources.clear();
      this.scanAST(ast, filePath, sourceCode);

      // Generate issues from unfreed resources and deduplicate
      const seen ***REMOVED*** new Set<string>();
      for (const [scopeId, resources] of this.resources) {
        for (const resource of resources) {
          if (!resource.released) {
            const key ***REMOVED*** `${resource.line}:${resource.column}:${resource.varName}`;
            if (!seen.has(key)) {
              seen.add(key);
              issues.push(this.createIssue(resource, filePath, sourceCode));
            }
          }
        }
      }
    } catch (error) {
      // Parse error - skip file but log
      console.warn(`Warning: Could not parse ${filePath}: ${(error as Error).message}`);
    }

    return {
      file: filePath,
      issues,
      duration: performance.now() - startTime,
    };
  }

  /**
   * Scan AST for resource acquisition patterns
   */
  private scanAST(ast: TSESTree.Program, filePath: string, source: string): void {
    const scopeStack: string[] ***REMOVED*** ['global'];
    const loopStack: boolean[] ***REMOVED*** [];
    const tryStack: boolean[] ***REMOVED*** [];

    // First pass: add parent references
    const addParentRefs ***REMOVED*** (node: TSESTree.Node, parent: TSESTree.Node | null ***REMOVED*** null) ***REMOVED***> {
      (node as any).parent ***REMOVED*** parent;
      for (const key of Object.keys(node)) {
        if (key ***REMOVED******REMOVED******REMOVED*** 'parent' || key ***REMOVED******REMOVED******REMOVED*** 'loc' || key ***REMOVED******REMOVED******REMOVED*** 'range') continue;
        const value ***REMOVED*** node[key as keyof TSESTree.Node];
        if (Array.isArray(value)) {
          for (const child of value) {
            if (child && typeof child ***REMOVED******REMOVED******REMOVED*** 'object' && 'type' in child) {
              addParentRefs(child as TSESTree.Node, node);
            }
          }
        } else if (value && typeof value ***REMOVED******REMOVED******REMOVED*** 'object' && 'type' in value) {
          addParentRefs(value as TSESTree.Node, node);
        }
      }
    };
    addParentRefs(ast);

    // Second pass: visit and check patterns
    const visit ***REMOVED*** (node: TSESTree.Node) ***REMOVED***> {
      // Track scopes
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'BlockStatement') {
        const scopeId ***REMOVED*** `${node.loc?.start.line}-${node.loc?.start.column}`;
        scopeStack.push(scopeId);
      }

      // Track loops
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'ForStatement' || node.type ***REMOVED******REMOVED******REMOVED*** 'ForInStatement' ||
          node.type ***REMOVED******REMOVED******REMOVED*** 'ForOfStatement' || node.type ***REMOVED******REMOVED******REMOVED*** 'WhileStatement' ||
          node.type ***REMOVED******REMOVED******REMOVED*** 'DoWhileStatement') {
        loopStack.push(true);
      }

      // Track try-catch
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'TryStatement') {
        tryStack.push(true);
      }

      const context ***REMOVED*** {
        source,
        scopeId: scopeStack[scopeStack.length - 1],
        inLoop: loopStack.length > 0,
        inTryBlock: tryStack.length > 0,
        addResource: this.addResource.bind(this),
        markReleased: this.markReleased.bind(this),
      };

      // Check for pg patterns
      pgRules.forEach(rule ***REMOVED***> {
        try {
          rule.check(node, context);
        } catch (e) {
          // Rule error - skip
        }
      });

      // Check for mysql2 patterns
      mysql2Rules.forEach(rule ***REMOVED***> {
        try {
          rule.check(node, context);
        } catch (e) {
          // Rule error - skip
        }
      });

      // Check for Prisma patterns
      prismaRules.forEach(rule ***REMOVED***> {
        try {
          rule.check(node, context);
        } catch (e) {
          // Rule error - skip
        }
      });

      // Recursively visit all children
      for (const key of Object.keys(node)) {
        if (key ***REMOVED******REMOVED******REMOVED*** 'parent' || key ***REMOVED******REMOVED******REMOVED*** 'loc' || key ***REMOVED******REMOVED******REMOVED*** 'range') continue;
        const value ***REMOVED*** node[key as keyof TSESTree.Node];
        if (Array.isArray(value)) {
          for (const child of value) {
            if (child && typeof child ***REMOVED******REMOVED******REMOVED*** 'object' && 'type' in child) {
              visit(child as TSESTree.Node);
            }
          }
        } else if (value && typeof value ***REMOVED******REMOVED******REMOVED*** 'object' && 'type' in value) {
          visit(value as TSESTree.Node);
        }
      }

      // Pop from stacks
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'BlockStatement') {
        scopeStack.pop();
      }
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'ForStatement' || node.type ***REMOVED******REMOVED******REMOVED*** 'ForInStatement' ||
          node.type ***REMOVED******REMOVED******REMOVED*** 'ForOfStatement' || node.type ***REMOVED******REMOVED******REMOVED*** 'WhileStatement' ||
          node.type ***REMOVED******REMOVED******REMOVED*** 'DoWhileStatement') {
        loopStack.pop();
      }
      if (node.type ***REMOVED******REMOVED******REMOVED*** 'TryStatement') {
        tryStack.pop();
      }
    };

    visit(ast);
  }

  /**
   * Add a tracked resource
   */
  private addResource(resource: AcquiredResource): void {
    if (!this.resources.has(resource.scopeId)) {
      this.resources.set(resource.scopeId, []);
    }
    this.resources.get(resource.scopeId)!.push(resource);
  }

  /**
   * Mark a resource as released
   * Searches current scope and parent scopes for matching unreleased resources
   */
  private markReleased(varName: string, scopeId: string, line: number, column: number): void {
    // Try current scope first
    const scopeResources ***REMOVED*** this.resources.get(scopeId);
    if (scopeResources) {
      for (let i ***REMOVED*** scopeResources.length - 1; i >***REMOVED*** 0; i--) {
        const resource ***REMOVED*** scopeResources[i];
        if (resource.varName ***REMOVED******REMOVED******REMOVED*** varName && !resource.released) {
          resource.released ***REMOVED*** true;
          resource.releaseLocation ***REMOVED*** { line, column };
          return;
        }
      }
    }

    // If not found in current scope, search all scopes (handles try-finally case)
    // Search in reverse scope order (most recent first) to handle nested scopes
    const scopeIds ***REMOVED*** Array.from(this.resources.keys()).reverse();
    for (const sid of scopeIds) {
      const resources ***REMOVED*** this.resources.get(sid)!;
      for (let i ***REMOVED*** resources.length - 1; i >***REMOVED*** 0; i--) {
        const resource ***REMOVED*** resources[i];
        if (resource.varName ***REMOVED******REMOVED******REMOVED*** varName && !resource.released) {
          resource.released ***REMOVED*** true;
          resource.releaseLocation ***REMOVED*** { line, column };
          return;
        }
      }
    }
  }

  /**
   * Create a LeakIssue from an unreleased resource
   */
  private createIssue(resource: AcquiredResource, file: string, source: string): LeakIssue {
    const lines ***REMOVED*** source.split('\n');
    const codeLine ***REMOVED*** lines[resource.line - 1] || '';

    let type: LeakIssue['type'] ***REMOVED*** 'missing-release';
    let message ***REMOVED*** `Potential pool leak: '${resource.varName}' acquired but never released`;

    if (resource.inLoop) {
      type ***REMOVED*** 'loop-leak';
      message ***REMOVED*** `Loop leak: '${resource.varName}' acquired in loop without release - connection may exhaust`;
    } else if (!resource.inTryBlock) {
      type ***REMOVED*** 'exception-path';
      message ***REMOVED*** `Exception path leak: '${resource.varName}' not protected by try-catch - exceptions will leak`;
    }

    return {
      file,
      line: resource.line,
      column: resource.column,
      severity: resource.inLoop ? 'error' : 'warning',
      type,
      library: 'unknown',
      message,
      code: codeLine.trim(),
      suggestion: this.getSuggestion(resource, type),
    };
  }

  /**
   * Get fix suggestion for a leak
   */
  private getSuggestion(resource: AcquiredResource, type: LeakIssue['type']): string {
    if (type ***REMOVED******REMOVED******REMOVED*** 'loop-leak') {
      return `Move connection acquisition outside the loop, or ensure each iteration releases with: await ${resource.varName}.release()`;
    }
    if (type ***REMOVED******REMOVED******REMOVED*** 'exception-path') {
      return `Wrap in try-catch-finally: finally { await ${resource.varName}.release() }`;
    }
    return `Release the resource after use: await ${resource.varName}.release()`;
  }
}
