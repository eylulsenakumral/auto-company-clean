// Vulnerable Lambda handler with hardcoded secrets
const AWS_ACCESS_KEY ***REMOVED*** 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_KEY ***REMOVED*** 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

export async function public() {
  return { statusCode: 200, body: 'Hello' };
}

export async function slow() {
  return { statusCode: 200, body: 'Done' };
}
