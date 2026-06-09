/**
 * Base types for detection rules
 */

import type { TSESTree } from '@typescript-eslint/types';

export interface RuleContext {
  source: string;
  scopeId: string;
  inLoop: boolean;
  inTryBlock: boolean;
  addResource: (resource: import('../types.js').AcquiredResource) ***REMOVED***> void;
  markReleased: (varName: string, scopeId: string, line: number, column: number) ***REMOVED***> void;
}

export interface DetectionRule {
  name: string;
  check: (node: TSESTree.Node, context: RuleContext) ***REMOVED***> void;
}
