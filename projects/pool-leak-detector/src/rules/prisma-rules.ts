/**
 * Detection rules for Prisma
 */

import type { TSESTree } from '@typescript-eslint/types';
import type { DetectionRule } from './base.js';

/**
 * Check if expression is a Prisma transaction call
 */
function isPrismaTransaction(node: TSESTree.Node): boolean {
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
  if (property.type !***REMOVED******REMOVED*** 'Identifier') {
    return false;
  }

  // Check for $transaction
  if (property.name ***REMOVED******REMOVED******REMOVED*** '$transaction') {
    return true;
  }

  // Check for $transactionAsync
  if (property.name ***REMOVED******REMOVED******REMOVED*** '$transactionAsync') {
    return true;
  }

  return false;
}

/**
 * Check if node is within a transaction callback that doesn't handle errors
 */
function hasTransactionErrorHandling(node: TSESTree.Node): boolean {
  const parent ***REMOVED*** node.parent;
  if (!parent) return false;

  // If wrapped in try-catch, good
  if (parent.type ***REMOVED******REMOVED******REMOVED*** 'TryStatement') {
    return true;
  }

  // If transaction uses .catch(), good
  if (parent.type ***REMOVED******REMOVED******REMOVED*** 'MemberExpression' && parent.property.type ***REMOVED******REMOVED******REMOVED*** 'Identifier') {
    if (parent.property.name ***REMOVED******REMOVED******REMOVED*** 'catch') {
      return true;
    }
  }

  return false;
}

/**
 * Rule: Detect $transaction without error handling
 */
const transactionRule: DetectionRule ***REMOVED*** {
  name: 'prisma-transaction-no-error-handling',
  check(node, context) {
    if (!isPrismaTransaction(node)) {
      return;
    }

    const callExpr ***REMOVED*** node.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? node.argument : node;
    if (callExpr.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    // Check if callback is present and check for error handling
    const callback ***REMOVED*** callExpr.arguments[0];
    if (!callback) {
      return;
    }

    // Check if transaction has error handling
    if (hasTransactionErrorHandling(node)) {
      return;
    }

    // Check if callback function has its own try-catch
    const funcBody ***REMOVED*** callback.type ***REMOVED******REMOVED******REMOVED*** 'ArrowFunctionExpression' || callback.type ***REMOVED******REMOVED******REMOVED*** 'FunctionExpression'
      ? callback.body
      : null;

    const hasInternalTry ***REMOVED*** funcBody?.type ***REMOVED******REMOVED******REMOVED*** 'BlockStatement' &&
      funcBody.body.some(s ***REMOVED***> s.type ***REMOVED******REMOVED******REMOVED*** 'TryStatement');

    if (!hasInternalTry && !context.inTryBlock && node.loc) {
      // This is a potential leak - no error handling
      const callee ***REMOVED*** callExpr.callee as TSESTree.MemberExpression;
      const obj ***REMOVED*** callee.object;
      const varName ***REMOVED*** obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' ? obj.name : 'prisma';

      context.addResource({
        varName,
        line: node.loc.start.line,
        column: node.loc.start.column,
        type: 'transaction',
        released: false,
        scopeId: context.scopeId,
        inLoop: context.inLoop,
        inTryBlock: context.inTryBlock,
      });
    }
  },
};

/**
 * Rule: Detect interactive transaction with potential leak
 */
const interactiveTransactionRule: DetectionRule ***REMOVED*** {
  name: 'prisma-interactive-transaction',
  check(node, context) {
    const callExpr ***REMOVED*** node.type ***REMOVED******REMOVED******REMOVED*** 'AwaitExpression' ? node.argument : node;
    if (callExpr?.type !***REMOVED******REMOVED*** 'CallExpression') {
      return;
    }

    const callee ***REMOVED*** callExpr.callee;
    if (callee?.type !***REMOVED******REMOVED*** 'MemberExpression') {
      return;
    }

    const property ***REMOVED*** callee.property;
    if (property?.type !***REMOVED******REMOVED*** 'Identifier' || property.name !***REMOVED******REMOVED*** '$transaction') {
      return;
    }

    // Check for interactive transaction (second argument is options with maxWait)
    const options ***REMOVED*** callExpr.arguments[1];
    const isInteractive ***REMOVED*** options?.type ***REMOVED******REMOVED******REMOVED*** 'ObjectExpression' &&
      options.properties.some(p ***REMOVED***>
        p.type ***REMOVED******REMOVED******REMOVED*** 'Property' &&
        p.key.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' &&
        p.key.name ***REMOVED******REMOVED******REMOVED*** 'maxWait'
      );

    if (isInteractive && node.loc) {
      const obj ***REMOVED*** callee.object;
      const varName ***REMOVED*** obj.type ***REMOVED******REMOVED******REMOVED*** 'Identifier' ? obj.name : 'prisma';

      context.addResource({
        varName: `${varName}.$transaction`,
        line: node.loc.start.line,
        column: node.loc.start.column,
        type: 'transaction',
        released: false,
        scopeId: context.scopeId,
        inLoop: context.inLoop,
        inTryBlock: context.inTryBlock,
      });
    }
  },
};

/**
 * Rule: Detect sequential operations that could be transaction
 */
const sequentialOperationsRule: DetectionRule ***REMOVED*** {
  name: 'prisma-sequential-writes',
  check(node, context) {
    // Detect multiple writes in sequence without transaction
    // This is more of a pattern suggestion than a leak
    if (node.type !***REMOVED******REMOVED*** 'ExpressionStatement') {
      return;
    }
  },
};

export const prismaRules: DetectionRule[] ***REMOVED*** [
  transactionRule,
  interactiveTransactionRule,
  sequentialOperationsRule,
];
