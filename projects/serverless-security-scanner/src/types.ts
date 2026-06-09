/**
 * Core types for serverless-security-scanner
 */

export type Severity ***REMOVED*** 'critical' | 'warning' | 'info';

export interface SecurityIssue {
  id: string;
  function?: string;
  file?: string;
  line?: number;
  type: IssueType;
  severity: Severity;
  message: string;
  fix: string;
  evidence?: string;
}

export type IssueType ***REMOVED***
  | 'iam-wildcard'
  | 'iam-admin'
  | 'hardcoded-secret'
  | 'public-exposure'
  | 'env-secret'
  | 'excessive-timeout'
  | 'deprecated-runtime'
  | 'vulnerable-dependency'
  | 'permissive-policy'
  | 'missing-auth';

export interface ScanResult {
  project: string;
  scannedAt: Date;
  summary: Summary;
  issues: SecurityIssue[];
}

export interface Summary {
  critical: number;
  warning: number;
  info: number;
  total: number;
}

export interface ScanOptions {
  path?: string;
  severity?: Severity;
  ignore?: string[];
  framework?: 'auto' | 'serverless' | 'sam';
  checkRuntime?: boolean;
  output?: 'table' | 'json';
}

export interface Config {
  severity: Severity;
  ignore: string[];
  framework: 'auto' | 'serverless' | 'sam';
  checkRuntime: boolean;
}

export interface LambdaFunction {
  name: string;
  handler: string;
  runtime?: string;
  timeout?: number;
  memory?: number;
  environment?: Record<string, string>;
  iamRole?: string;
  events?: Event[];
  file?: string;
}

export interface Event {
  type: 'http' | 'scheduled' | 's3' | 'sns' | 'dynamodb' | 'iot' | 'websocket';
  http?: {
    path: string;
    method: string;
    auth?: ApiGatewayAuth;
  };
}

export interface ApiGatewayAuth {
  type: 'aws_iam' | 'cognito_user_pools' | 'api_key' | 'none' | 'custom';
}

export interface ServerlessConfig {
  service: string;
  provider?: {
    name: 'aws';
    runtime?: string;
    iamRoleStatements?: Record<string, any>[];
    environment?: Record<string, string>;
  };
  functions?: Record<string, Omit<LambdaFunction, 'name'>>;
  resources?: {
    Resources?: Record<string, any>;
  };
}

export interface SamConfig {
  Transform?: string;
  Resources: Record<string, {
    Type?: string;
    Properties?: {
      CodeUri?: string;
      Handler?: string;
      Runtime?: string;
      Timeout?: number;
      MemorySize?: number;
      Environment?: { Variables?: Record<string, string> };
      Policies?: any;
      Events?: Record<string, any>;
    };
  }>;
}
