#!/usr/bin/env python3
"""
Cloudflare Worker Deployment Utility

Automates Cloudflare Worker deployments with wrangler.toml configuration handling,
multi-environment support, and comprehensive error handling.

Usage:
    python cloudflare-deploy.py --env production --dry-run
    python cloudflare-deploy.py --project ./my-worker --env staging
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class CloudflareDeployError(Exception):
    """Custom exception for Cloudflare deployment errors."""
    pass


class CloudflareDeploy:
    """Handle Cloudflare Worker deployments with wrangler CLI."""

    def __init__(self, project_dir: Path, env: Optional[str] ***REMOVED*** None,
                 dry_run: bool ***REMOVED*** False, verbose: bool ***REMOVED*** False):
        """
        Initialize CloudflareDeploy.

        Args:
            project_dir: Path to Worker project directory
            env: Environment name (production, staging, dev)
            dry_run: Preview deployment without actually deploying
            verbose: Enable verbose output
        """
        self.project_dir ***REMOVED*** Path(project_dir).resolve()
        self.env ***REMOVED*** env
        self.dry_run ***REMOVED*** dry_run
        self.verbose ***REMOVED*** verbose
        self.wrangler_toml ***REMOVED*** self.project_dir / "wrangler.toml"

    def validate_project(self) -> bool:
        """
        Validate project directory and wrangler.toml existence.

        Returns:
            True if valid, False otherwise

        Raises:
            CloudflareDeployError: If validation fails
        """
        if not self.project_dir.exists():
            raise CloudflareDeployError(
                f"Project directory does not exist: {self.project_dir}"
            )

        if not self.wrangler_toml.exists():
            raise CloudflareDeployError(
                f"wrangler.toml not found in: {self.project_dir}"
            )

        return True

    def check_wrangler_installed(self) -> bool:
        """
        Check if wrangler CLI is installed.

        Returns:
            True if installed, False otherwise
        """
        try:
            result ***REMOVED*** subprocess.run(
                ["wrangler", "--version"],
                capture_output***REMOVED***True,
                text***REMOVED***True,
                check***REMOVED***True
            )
            if self.verbose:
                print(f"Wrangler version: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def run_command(self, cmd: List[str], check: bool ***REMOVED*** True) -> Tuple[int, str, str]:
        """
        Run shell command and capture output.

        Args:
            cmd: Command and arguments as list
            check: Raise exception on non-zero exit code

        Returns:
            Tuple of (exit_code, stdout, stderr)

        Raises:
            CloudflareDeployError: If command fails and check***REMOVED***True
        """
        if self.verbose:
            print(f"Running: {' '.join(cmd)}")

        try:
            result ***REMOVED*** subprocess.run(
                cmd,
                capture_output***REMOVED***True,
                text***REMOVED***True,
                cwd***REMOVED***self.project_dir,
                check***REMOVED***check
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.CalledProcessError as e:
            if check:
                raise CloudflareDeployError(
                    f"Command failed: {' '.join(cmd)}\n{e.stderr}"
                )
            return e.returncode, e.stdout, e.stderr

    def get_worker_name(self) -> str:
        """
        Extract worker name from wrangler.toml.

        Returns:
            Worker name

        Raises:
            CloudflareDeployError: If name cannot be extracted
        """
        try:
            with open(self.wrangler_toml, 'r') as f:
                for line in f:
                    if line.strip().startswith('name'):
                        # Parse: name ***REMOVED*** "worker-name"
                        return line.split('***REMOVED***')[1].strip().strip('"\'')
        except Exception as e:
            raise CloudflareDeployError(f"Failed to read worker name: {e}")

        raise CloudflareDeployError("Worker name not found in wrangler.toml")

    def build_deploy_command(self) -> List[str]:
        """
        Build wrangler deploy command with appropriate flags.

        Returns:
            Command as list of strings
        """
        cmd ***REMOVED*** ["wrangler", "deploy"]

        if self.env:
            cmd.extend(["--env", self.env])

        if self.dry_run:
            cmd.append("--dry-run")

        return cmd

    def deploy(self) -> bool:
        """
        Execute deployment.

        Returns:
            True if successful

        Raises:
            CloudflareDeployError: If deployment fails
        """
        # Validate
        self.validate_project()

        if not self.check_wrangler_installed():
            raise CloudflareDeployError(
                "wrangler CLI not installed. Install: npm install -g wrangler"
            )

        worker_name ***REMOVED*** self.get_worker_name()
        env_suffix ***REMOVED*** f" ({self.env})" if self.env else ""
        mode ***REMOVED*** "DRY RUN" if self.dry_run else "DEPLOY"

        print(f"\n{mode}: {worker_name}{env_suffix}")
        print(f"Project: {self.project_dir}\n")

        # Build and run command
        cmd ***REMOVED*** self.build_deploy_command()
        exit_code, stdout, stderr ***REMOVED*** self.run_command(cmd)

        # Output results
        if stdout:
            print(stdout)
        if stderr:
            print(stderr, file***REMOVED***sys.stderr)

        if exit_code ***REMOVED******REMOVED*** 0:
            status ***REMOVED*** "would be deployed" if self.dry_run else "deployed successfully"
            print(f"\n✓ Worker {status}")
            return True
        else:
            raise CloudflareDeployError("Deployment failed")


def main():
    """CLI entry point."""
    parser ***REMOVED*** argparse.ArgumentParser(
        description***REMOVED***"Deploy Cloudflare Worker with wrangler",
        formatter_class***REMOVED***argparse.RawDescriptionHelpFormatter,
        epilog***REMOVED***"""
Examples:
  python cloudflare-deploy.py
  python cloudflare-deploy.py --env production
  python cloudflare-deploy.py --project ./my-worker --env staging
  python cloudflare-deploy.py --dry-run
  python cloudflare-deploy.py --env prod --verbose
        """
    )

    parser.add_argument(
        "--project",
        type***REMOVED***str,
        default***REMOVED***".",
        help***REMOVED***"Path to Worker project directory (default: current directory)"
    )

    parser.add_argument(
        "--env",
        type***REMOVED***str,
        choices***REMOVED***["production", "staging", "dev"],
        help***REMOVED***"Environment to deploy to (production, staging, dev)"
    )

    parser.add_argument(
        "--dry-run",
        action***REMOVED***"store_true",
        help***REMOVED***"Preview deployment without actually deploying"
    )

    parser.add_argument(
        "--verbose",
        "-v",
        action***REMOVED***"store_true",
        help***REMOVED***"Enable verbose output"
    )

    args ***REMOVED*** parser.parse_args()

    try:
        deployer ***REMOVED*** CloudflareDeploy(
            project_dir***REMOVED***args.project,
            env***REMOVED***args.env,
            dry_run***REMOVED***args.dry_run,
            verbose***REMOVED***args.verbose
        )

        success ***REMOVED*** deployer.deploy()
        sys.exit(0 if success else 1)

    except CloudflareDeployError as e:
        print(f"Error: {e}", file***REMOVED***sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nDeployment cancelled by user", file***REMOVED***sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Unexpected error: {e}", file***REMOVED***sys.stderr)
        sys.exit(1)


if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
