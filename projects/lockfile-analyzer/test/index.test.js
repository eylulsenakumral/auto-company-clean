// Basic tests

import { analyzeLockfileDiff } from '../src/analyzers/diff-analyzer.js';
import { analyzeLockfile } from '../src/analyzers/explain-analyzer.js';
import { generatePRComment } from '../src/analyzers/comment-generator.js';
import fs from 'fs';

console.log('Testing lockfile-analyzer...\n');

// Create test lockfiles
const testBaseLock ***REMOVED*** {
  name: 'test-project',
  version: '1.0.0',
  lockfileVersion: 3,
  packages: {
    '': {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.21', axios: '^1.4.0' }
    },
    'node_modules/lodash': {
      name: 'lodash',
      version: '4.17.21',
      resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
      integrity: 'sha1-...'
    },
    'node_modules/axios': {
      name: 'axios',
      version: '1.4.0',
      resolved: 'https://registry.npmjs.org/axios/-/axios-1.4.0.tgz',
      integrity: 'sha1-...'
    }
  }
};

const testHeadLock ***REMOVED*** {
  name: 'test-project',
  version: '1.0.0',
  lockfileVersion: 3,
  packages: {
    '': {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.21', react: '^18.3.0' }
    },
    'node_modules/lodash': {
      name: 'lodash',
      version: '4.17.22',
      resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.22.tgz',
      integrity: 'sha1-...'
    },
    'node_modules/react': {
      name: 'react',
      version: '18.3.0',
      resolved: 'https://registry.npmjs.org/react/-/react-18.3.0.tgz',
      integrity: 'sha1-...'
    }
  }
};

fs.writeFileSync('/tmp/test-base-lock.json', JSON.stringify(testBaseLock, null, 2));
fs.writeFileSync('/tmp/test-head-lock.json', JSON.stringify(testHeadLock, null, 2));

let passed ***REMOVED*** 0;
let failed ***REMOVED*** 0;

// Test 1: Diff analysis
try {
  const diffResult ***REMOVED*** analyzeLockfileDiff('/tmp/test-base-lock.json', '/tmp/test-head-lock.json');

  if (diffResult.summary.changed ***REMOVED******REMOVED******REMOVED*** 1 &&
      diffResult.summary.added ***REMOVED******REMOVED******REMOVED*** 1 &&
      diffResult.summary.removed ***REMOVED******REMOVED******REMOVED*** 1) {
    console.log('✓ Test 1 passed: Diff analysis');
    passed++;
  } else {
    console.log('✗ Test 1 failed: Diff analysis counts wrong');
    failed++;
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message);
  failed++;
}

// Test 2: Changed version detection
try {
  const diffResult ***REMOVED*** analyzeLockfileDiff('/tmp/test-base-lock.json', '/tmp/test-head-lock.json');
  const lodashChanged ***REMOVED*** diffResult.changes.changed.find(c ***REMOVED***> c.name ***REMOVED******REMOVED******REMOVED*** 'lodash');

  if (lodashChanged && lodashChanged.oldVersion ***REMOVED******REMOVED******REMOVED*** '4.17.21' && lodashChanged.newVersion ***REMOVED******REMOVED******REMOVED*** '4.17.22') {
    console.log('✓ Test 2 passed: Version change detected');
    passed++;
  } else {
    console.log('✗ Test 2 failed: Version change not detected correctly');
    failed++;
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message);
  failed++;
}

// Test 3: Added/Removed detection
try {
  const diffResult ***REMOVED*** analyzeLockfileDiff('/tmp/test-base-lock.json', '/tmp/test-head-lock.json');

  const reactAdded ***REMOVED*** diffResult.changes.added.find(c ***REMOVED***> c.name ***REMOVED******REMOVED******REMOVED*** 'react');
  const axiosRemoved ***REMOVED*** diffResult.changes.removed.find(c ***REMOVED***> c.name ***REMOVED******REMOVED******REMOVED*** 'axios');

  if (reactAdded && axiosRemoved) {
    console.log('✓ Test 3 passed: Added/removed dependencies detected');
    passed++;
  } else {
    console.log('✗ Test 3 failed: Added/removed not detected');
    failed++;
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message);
  failed++;
}

// Test 4: Explain analysis
try {
  const explainResult ***REMOVED*** analyzeLockfile('/tmp/test-head-lock.json');

  if (explainResult.stats.total ***REMOVED******REMOVED******REMOVED*** 2 && explainResult.stats.direct ***REMOVED******REMOVED******REMOVED*** 2) {
    console.log('✓ Test 4 passed: Explain analysis');
    passed++;
  } else {
    console.log('✗ Test 4 failed: Explain counts wrong');
    failed++;
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message);
  failed++;
}

// Test 5: PR comment generation
try {
  const markdown ***REMOVED*** generatePRComment('/tmp/test-base-lock.json', '/tmp/test-head-lock.json');

  if (markdown.includes('Lockfile Changes') && markdown.includes('lodash') && markdown.includes('react')) {
    console.log('✓ Test 5 passed: PR comment generation');
    passed++;
  } else {
    console.log('✗ Test 5 failed: PR comment missing content');
    failed++;
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message);
  failed++;
}

// Cleanup
fs.unlinkSync('/tmp/test-base-lock.json');
fs.unlinkSync('/tmp/test-head-lock.json');

console.log(`\n${passed} passed, ${failed} failed`);

process.exit(failed > 0 ? 1 : 0);
