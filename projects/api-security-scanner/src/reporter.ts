import { SecurityIssue, ScanResult } from './types';
import { table } from 'table';
import chalk from 'chalk';

export class Reporter {
  static printTable(issues: SecurityIssue[]): void {
    if (issues.length ***REMOVED******REMOVED******REMOVED*** 0) {
      console.log(chalk.green('✓ No security issues found!'));
      return;
    }

    const data ***REMOVED*** [
      [
        chalk.bold('Route'),
        chalk.bold('Issue'),
        chalk.bold('Severity'),
        chalk.bold('File:Line'),
        chalk.bold('Fix')
      ]
    ];

    for (const issue of issues) {
      const severityColor ***REMOVED***
        issue.severity ***REMOVED******REMOVED******REMOVED*** 'critical'
          ? chalk.red
          : issue.severity ***REMOVED******REMOVED******REMOVED*** 'warning'
          ? chalk.yellow
          : chalk.green;

      data.push([
        issue.route,
        issue.issue,
        severityColor(issue.severity.toUpperCase()),
        `${issue.file.split('/').pop()}:${issue.line}`,
        issue.fix
      ]);
    }

    console.log('\n' + table(data));
  }

  static printSummary(result: ScanResult): void {
    console.log('\n' + chalk.bold('Scan Summary'));
    console.log('─'.repeat(50));
    console.log(`Files scanned: ${result.summary.filesScanned}`);
    console.log(`Routes analyzed: ${result.summary.totalRoutes}`);
    console.log('');
    console.log(
      `Critical: ${chalk.red(result.summary.critical.toString())} | ` +
        `Warning: ${chalk.yellow(result.summary.warning.toString())} | ` +
        `Info: ${chalk.green(result.summary.info.toString())}`
    );
    console.log('');
    console.log(`Scan completed: ${result.timestamp}`);
  }

  static generateJson(issues: SecurityIssue[], stats: any): ScanResult {
    return {
      issues,
      summary: {
        critical: stats.criticalIssues,
        warning: stats.warningIssues,
        info: stats.infoIssues,
        totalRoutes: stats.routesScanned,
        filesScanned: stats.filesScanned
      },
      timestamp: new Date().toISOString()
    };
  }

  static getExitCode(issues: SecurityIssue[]): number {
    if (issues.some(i ***REMOVED***> i.severity ***REMOVED******REMOVED******REMOVED*** 'critical')) {
      return 1;
    }
    return 0;
  }
}
