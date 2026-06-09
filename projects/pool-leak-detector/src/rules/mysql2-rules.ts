/**
 * Detection rules for mysql2
 */

import type { TSESTree } from '@typescript-eslint/types';
import type { DetectionRule } from './base.js';

/**
 * Check if expression is a pool.getConnection() call
 */
function isPoolGetConnection(node: TSESTree.Node): boolean {
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
  if (property.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** 'getConnection') {
    return false;
  }

  const obj ***REMOVED*** callee.object;
  if (obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier') {
    return /pool|db/i.test(obj.name);
  }

  return false;
}

/**
 * Rule: Detect pool.getConnection() acquisition
 */
const poolGetConnectionRule: DetectionRule ***REMOVED*** {
  name: 'mysql2-pool-get-connection',
  check(node, context) {
    if (node.type ***REMOVED******REMOVED******REMOVED*** 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (decl.init && isPoolGetConnection(decl.init)) {
          const varName ***REMOVED*** decl.id.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' ? decl.id.name : null;
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

    if (node.type ***REMOVED******REMOVED******REMOVED*** 'AssignmentExpression' && isPoolGetConnection(node.right)) {
      const varName ***REMOVED*** node.left.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' ? node.left.name : null;
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
 * Rule: Detect connection.release() calls
 */
const releaseRule: DetectionRule ***REMOVED*** {
  name: 'mysql2-release',
  check(node, context) {
    if (node.type !***REMOVED******REMOVED*** 'ExpressionStatement') {
      return;
    }

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
    if (property.type !***REMOVED******REMOVED*** 'Identifier' || (property.name !***REMOVED******REMOVED*** 'release' && property.name !***REMOVED******REMOVED*** 'end')) {
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

/**
 * Rule: Detect callback-style pool usage (leak-prone)
 */
const callbackStyleRule: DetectionRule ***REMOVED*** {
  name: 'mysql2-callback-style',
  check(node, context) {
    // Check for: pool.getConnection((err, conn) ***REMOVED***> { ... })
    const callExpr ***REMOVED*** node.type ***REMOVED******REMOVED******REMOVED*** 'ExpressionStatement' ? node.expression : node;
    if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    const callee ***REMOVED*** callExpr.callee;
    if (callee.type !***REMOVED******REMOVED*** 'MemberExpression') {
      return;
    }

    const property ***REMOVED*** callee.property;
    if (property.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** 'getConnection') {
      return;
    }

    // Check if callback has error handling
    const callback ***REMOVED*** callExpr.arguments[0];
    if (callback?.type ***REMOVED******REMOVED******REMOVED*** 'ArrowFunctionExpression' || callback?.type ***REMOVED******REMOVED******REMOVED*** 'FunctionExpression') {
      const body ***REMOVED*** callback.body;
      const hasErrorHandling ***REMOVED*** body.type ***REMOVED******REMOVED******REMOVED*** 'BlockStatement' &&
        body.body.some(stmt ***REMOVED***>
          stmt.type ***REMOVED******REMOVED******REMOVED*** 'IfStatement' &&
          stmt.test.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' &&
          stmt.test.name ***REMOVED******REMOVED******REMOVED*** 'err'
        );

      if (!hasErrorHandling && node.loc) {
        // This is a potential leak - no error handling in callback
      }
    }
  },
};

export const mysql2Rules: DetectionRule[] ***REMOVED*** [
  poolGetConnectionRule,
  releaseRule,
  callbackStyleRule,
];
