import { parseBundle } from './analyzer.js';
/**
 * Analyze which npm packages contribute most to bundle size
 * For MVP, we simulate package attribution based on common dependencies
 */
export function analyzeBlame(bundlePath) {
    const bundle ***REMOVED*** parseBundle(bundlePath);
    const totalSize ***REMOVED*** bundle.totalSize;
    // Simulate npm package attribution for MVP
    // Production version would analyze node_modules and import paths
    const packageAttribution ***REMOVED*** [
        {
            packageName: 'react',
            size: Math.floor(totalSize * 0.25),
            percentage: 25,
            modules: ['react', 'react-dom'],
        },
        {
            packageName: 'lodash',
            size: Math.floor(totalSize * 0.15),
            percentage: 15,
            modules: ['lodash', 'lodash-es'],
        },
        {
            packageName: 'axios',
            size: Math.floor(totalSize * 0.10),
            percentage: 10,
            modules: ['axios'],
        },
        {
            packageName: '@mui/material',
            size: Math.floor(totalSize * 0.20),
            percentage: 20,
            modules: ['@mui/material', '@mui/icons-material'],
        },
        {
            packageName: 'date-fns',
            size: Math.floor(totalSize * 0.08),
            percentage: 8,
            modules: ['date-fns'],
        },
        {
            packageName: 'application-code',
            size: Math.floor(totalSize * 0.22),
            percentage: 22,
            modules: ['components', 'utils', 'hooks'],
        },
    ];
    return packageAttribution.sort((a, b) ***REMOVED***> b.size - a.size);
}
