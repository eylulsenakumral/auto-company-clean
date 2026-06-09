/**
 * Detection rules for pg (node-postgres)
 */

import type { TSESTree } from '@typescript-eslint/types';
import type { DetectionRule, RuleContext } from './base.js';

/**
 * Extract variable name from declaration pattern
 */
function getVarName(node: TSESTree.Node): string | null {
  if (node.type ***REMOVED******REMOVED******REMOVED*** 'Identifier') {
    return node.name;
  }
  if (node.type ***REMOVED******REMOVED******REMOVED*** 'VariableDeclarator' && node.id.type ***REMOVED******REMOVED******REMOVED*** 'Identifier') {
    return node.id.name;
  }
  return null;
}

/**
 * Check if expression is a pool.connect() call
 */
function isPoolConnect(node: TSESTree.Node): boolean {
  if (node.type !***REMOVED******REMOVED*** 'AwaitExpression' && node.type !***REMOVED******REMOVED*** 'CallExpression') {
    return false;
  }

  const callExpr ***REMOVED*** node.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? node.argument : node;
  if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
    return false;
  }

  const callee ***REMOVED*** callExpr.callee;
  if (callee.type !***REMOVED******REMOVED*** 'MemberExpression') {
    return false;
  }

  const property ***REMOVED*** callee.property;
  if (property.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** 'connect') {
    return false;
  }

  // Check if object is a pool-like variable
  const obj ***REMOVED*** callee.object;
  if (obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier') {
    // Common pool names: pool, dbPool, connectionPool, pgPool
    return /pool|db/i.test(obj.name);
  }

  return false;
}

/**
 * Check if statement is a release call
 */
function isReleaseCall(node: TSESTree.Node, varName: string): boolean {
  if (node.type !***REMOVED******REMOVED*** 'ExpressionStatement') {
    return false;
  }

  const expr ***REMOVED*** node.expression;
  if (expr.type !***REMOVED******REMOVED*** 'AwaitExpression' && expr.type !***REMOVED******REMOVED*** 'CallExpression') {
    return false;
  }

  const callExpr ***REMOVED*** expr.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? expr.argument : expr;
  if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
    return false;
  }

  const callee ***REMOVED*** callExpr.callee;
  if (callee.type !***REMOVED******REMOVED*** 'MemberExpression') {
    return false;
  }

  const property ***REMOVED*** callee.property;
  if (property.type !***REMOVED******REMOVED*** 'Identifier') {
    return false;
  }

  // Check for release(), release(), or end()
  if (property.name !***REMOVED******REMOVED*** 'release' && property.name !***REMOVED******REMOVED*** 'end') {
    return false;
  }

  // Check if object matches our variable
  const obj ***REMOVED*** callee.object;
  if (obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' && obj.name ***REMOVED******REMOVED******REMOVED*** varName) {
    return true;
  }

  return false;
}

/**
 * Rule: Detect pool.connect() acquisition
 */
const poolConnectRule: DetectionRule ***REMOVED*** {
  name: 'pg-pool-connect',
  check(node, context) {
    // Check for: const conn ***REMOVED*** await pool.connect()
    if (node.type ***REMOVED******REMOVED******REMOVED*** 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (decl.init && isPoolConnect(decl.init)) {
          const varName ***REMOVED*** getVarName(decl);
          if (varName && decl.loc) {
            context.addResource({
              varName,
              line: decl.loc.start.line,
              column: decl.loc.start.column,
              type: 'connection',
              released: false,
              scopeId: context.scopeId,
              inLoop: context.inLoop,
              inTryBlock: context.inTryBlock,
            });
          }
        }
      }
    }

    // Check for: conn ***REMOVED*** await pool.connect() (reassignment)
    if (node.type ***REMOVED******REMOVED******REMOVED*** 'AssignmentExpression' && isPoolConnect(node.right)) {
      const varName ***REMOVED*** getVarName(node.left);
      if (varName && node.loc) {
        context.addResource({
          varName,
          line: node.loc.start.line,
          column: node.loc.start.column,
          type: 'connection',
          released: false,
          scopeId: context.scopeId,
          inLoop: context.inLoop,
          inTryBlock: context.inTryBlock,
        });
      }
    }
  },
};

/**
 * Rule: Detect client.connect() acquisition (direct client)
 */
const clientConnectRule: DetectionRule ***REMOVED*** {
  name: 'pg-client-connect',
  check(node, context) {
    if (node.type !***REMOVED******REMOVED*** 'CallExpression' && node.type !***REMOVED******REMOVED*** 'AwaitExpression') {
      return;
    }

    const callExpr ***REMOVED*** node.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? node.argument : node;
    if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    const callee ***REMOVED*** callExpr.callee;
    if (callee.type !***REMOVED******REMOVED*** 'MemberExpression') {
      return;
    }

    const property ***REMOVED*** callee.property;
    if (property.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** 'connect') {
      return;
    }

    const obj ***REMOVED*** callee.object;
    const varName ***REMOVED*** obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' ? obj.name : null;
    if (!varName) {
      return;
    }

    // Look for VariableDeclaration parent
    let parent: TSESTree.Node | null ***REMOVED*** node.parent ?? null;
    while (parent) {
      if (parent.type ***REMOVED******REMOVED******REMOVED*** 'VariableDeclarator' && (parent as TSESTree.VariableDeclarator).init ***REMOVED******REMOVED******REMOVED*** node) {
        if (parent.loc) {
          context.addResource({
            varName: getVarName(parent) || varName,
            line: parent.loc.start.line,
            column: parent.loc.start.column,
            type: 'connection',
            released: false,
            scopeId: context.scopeId,
            inLoop: context.inLoop,
            inTryBlock: context.inTryBlock,
          });
        }
        break;
      }
      parent ***REMOVED*** (parent.parent ?? null) as TSESTree.Node | null;
    }
  },
};

/**
 * Rule: Detect release calls
 */
const releaseRule: DetectionRule ***REMOVED*** {
  name: 'pg-release',
  check(node, context) {
    if (node.type !***REMOVED******REMOVED*** 'ExpressionStatement') {
      return;
    }

    // Try to extract the variable name being released
    const expr ***REMOVED*** node.expression;
    if (expr.type !***REMOVED******REMOVED*** 'AwaitExpression' && expr.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    const callExpr ***REMOVED*** expr.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? expr.argument : expr;
    if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    const callee ***REMOVED*** callExpr.callee;
    if (callee.type !***REMOVED******REMOVED*** 'MemberExpression') {
      return;
    }

    const property ***REMOVED*** callee.property;
    if (property.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** 'release') {
      return;
    }

    const obj ***REMOVED*** callee.object;
    if (obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' && node.loc) {
      // Mark the matching resource as released
      context.markReleased(
        obj.name,
        context.scopeId,
        node.loc.start.line,
        node.loc.start.column
      );
    }
  },
};

export const pgRules: DetectionRule[] ***REMOVED*** [
  poolConnectRule,
  clientConnectRule,
  releaseRule,
];
