"""
Tests for cloudflare-deploy.py

Run with: pytest test_cloudflare_deploy.py -v
"""

import pytest
import subprocess
from pathlib import Path
from unittest.mock import Mock, patch, mock_open
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from cloudflare_deploy import CloudflareDeploy, CloudflareDeployError


@pytest.fixture
def temp_project(tmp_path):
    """Create temporary project directory with wrangler.toml"""
    project_dir ***REMOVED*** tmp_path / "test-worker"
    project_dir.mkdir()

    wrangler_toml ***REMOVED*** project_dir / "wrangler.toml"
    wrangler_toml.write_text('''
name ***REMOVED*** "test-worker"
main ***REMOVED*** "src/index.ts"
compatibility_date ***REMOVED*** "2024-01-01"
''')

    return project_dir


@pytest.fixture
def deployer(temp_project):
    """Create CloudflareDeploy instance with temp project"""
    return CloudflareDeploy(
        project_dir***REMOVED***temp_project,
        env***REMOVED***"staging",
        dry_run***REMOVED***False,
        verbose***REMOVED***False
    )


class TestCloudflareDeployInit:
    """Test CloudflareDeploy initialization"""

    def test_init_with_defaults(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***temp_project)
        assert deployer.project_dir ***REMOVED******REMOVED*** temp_project.resolve()
        assert deployer.env is None
        assert deployer.dry_run is False
        assert deployer.verbose is False

    def test_init_with_custom_params(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(
            project_dir***REMOVED***temp_project,
            env***REMOVED***"production",
            dry_run***REMOVED***True,
            verbose***REMOVED***True
        )
        assert deployer.env ***REMOVED******REMOVED*** "production"
        assert deployer.dry_run is True
        assert deployer.verbose is True


class TestValidateProject:
    """Test project validation"""

    def test_validate_existing_project(self, deployer):
        assert deployer.validate_project() is True

    def test_validate_nonexistent_project(self, tmp_path):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***tmp_path / "nonexistent")
        with pytest.raises(CloudflareDeployError, match***REMOVED***"does not exist"):
            deployer.validate_project()

    def test_validate_missing_wrangler_toml(self, tmp_path):
        project_dir ***REMOVED*** tmp_path / "no-toml"
        project_dir.mkdir()
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***project_dir)

        with pytest.raises(CloudflareDeployError, match***REMOVED***"wrangler.toml not found"):
            deployer.validate_project()


class TestCheckWranglerInstalled:
    """Test wrangler CLI detection"""

    @patch('subprocess.run')
    def test_wrangler_installed(self, mock_run, deployer):
        mock_run.return_value ***REMOVED*** Mock(
            returncode***REMOVED***0,
            stdout***REMOVED***"wrangler 3.0.0",
            stderr***REMOVED***""
        )
        assert deployer.check_wrangler_installed() is True

    @patch('subprocess.run')
    def test_wrangler_not_installed(self, mock_run, deployer):
        mock_run.side_effect ***REMOVED*** FileNotFoundError()
        assert deployer.check_wrangler_installed() is False

    @patch('subprocess.run')
    def test_wrangler_command_fails(self, mock_run, deployer):
        mock_run.side_effect ***REMOVED*** subprocess.CalledProcessError(1, "wrangler")
        assert deployer.check_wrangler_installed() is False


class TestGetWorkerName:
    """Test worker name extraction"""

    def test_get_worker_name_success(self, deployer):
        name ***REMOVED*** deployer.get_worker_name()
        assert name ***REMOVED******REMOVED*** "test-worker"

    def test_get_worker_name_no_name(self, tmp_path):
        project_dir ***REMOVED*** tmp_path / "no-name"
        project_dir.mkdir()

        wrangler_toml ***REMOVED*** project_dir / "wrangler.toml"
        wrangler_toml.write_text("main ***REMOVED*** 'index.ts'")

        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***project_dir)
        with pytest.raises(CloudflareDeployError, match***REMOVED***"Worker name not found"):
            deployer.get_worker_name()

    def test_get_worker_name_with_quotes(self, tmp_path):
        project_dir ***REMOVED*** tmp_path / "quoted"
        project_dir.mkdir()

        wrangler_toml ***REMOVED*** project_dir / "wrangler.toml"
        wrangler_toml.write_text('name ***REMOVED*** "my-worker"\n')

        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***project_dir)
        assert deployer.get_worker_name() ***REMOVED******REMOVED*** "my-worker"

    def test_get_worker_name_single_quotes(self, tmp_path):
        project_dir ***REMOVED*** tmp_path / "single-quotes"
        project_dir.mkdir()

        wrangler_toml ***REMOVED*** project_dir / "wrangler.toml"
        wrangler_toml.write_text("name ***REMOVED*** 'my-worker'\n")

        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***project_dir)
        assert deployer.get_worker_name() ***REMOVED******REMOVED*** "my-worker"


class TestBuildDeployCommand:
    """Test deploy command construction"""

    def test_basic_command(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***temp_project)
        cmd ***REMOVED*** deployer.build_deploy_command()
        assert cmd ***REMOVED******REMOVED*** ["wrangler", "deploy"]

    def test_command_with_env(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***temp_project, env***REMOVED***"production")
        cmd ***REMOVED*** deployer.build_deploy_command()
        assert cmd ***REMOVED******REMOVED*** ["wrangler", "deploy", "--env", "production"]

    def test_command_with_dry_run(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***temp_project, dry_run***REMOVED***True)
        cmd ***REMOVED*** deployer.build_deploy_command()
        assert cmd ***REMOVED******REMOVED*** ["wrangler", "deploy", "--dry-run"]

    def test_command_with_env_and_dry_run(self, temp_project):
        deployer ***REMOVED*** CloudflareDeploy(
            project_dir***REMOVED***temp_project,
            env***REMOVED***"staging",
            dry_run***REMOVED***True
        )
        cmd ***REMOVED*** deployer.build_deploy_command()
        assert cmd ***REMOVED******REMOVED*** ["wrangler", "deploy", "--env", "staging", "--dry-run"]


class TestRunCommand:
    """Test command execution"""

    @patch('subprocess.run')
    def test_run_command_success(self, mock_run, deployer):
        mock_run.return_value ***REMOVED*** Mock(
            returncode***REMOVED***0,
            stdout***REMOVED***"Success",
            stderr***REMOVED***""
        )

        exit_code, stdout, stderr ***REMOVED*** deployer.run_command(["echo", "test"])

        assert exit_code ***REMOVED******REMOVED*** 0
        assert stdout ***REMOVED******REMOVED*** "Success"
        assert stderr ***REMOVED******REMOVED*** ""
        mock_run.assert_called_once()

    @patch('subprocess.run')
    def test_run_command_failure_with_check(self, mock_run, deployer):
        mock_run.side_effect ***REMOVED*** subprocess.CalledProcessError(
            1, "cmd", stderr***REMOVED***"Error"
        )

        with pytest.raises(CloudflareDeployError, match***REMOVED***"Command failed"):
            deployer.run_command(["false"], check***REMOVED***True)

    @patch('subprocess.run')
    def test_run_command_failure_no_check(self, mock_run, deployer):
        mock_run.side_effect ***REMOVED*** subprocess.CalledProcessError(
            1, "cmd", output***REMOVED***"", stderr***REMOVED***"Error"
        )

        exit_code, stdout, stderr ***REMOVED*** deployer.run_command(["false"], check***REMOVED***False)

        assert exit_code ***REMOVED******REMOVED*** 1


class TestDeploy:
    """Test full deployment flow"""

    @patch.object(CloudflareDeploy, 'check_wrangler_installed')
    @patch.object(CloudflareDeploy, 'run_command')
    def test_deploy_success(self, mock_run_cmd, mock_check_wrangler, deployer):
        mock_check_wrangler.return_value ***REMOVED*** True
        mock_run_cmd.return_value ***REMOVED*** (0, "Deployed successfully", "")

        result ***REMOVED*** deployer.deploy()

        assert result is True
        mock_check_wrangler.assert_called_once()
        mock_run_cmd.assert_called_once()

    @patch.object(CloudflareDeploy, 'check_wrangler_installed')
    def test_deploy_wrangler_not_installed(self, mock_check_wrangler, deployer):
        mock_check_wrangler.return_value ***REMOVED*** False

        with pytest.raises(CloudflareDeployError, match***REMOVED***"wrangler CLI not installed"):
            deployer.deploy()

    @patch.object(CloudflareDeploy, 'check_wrangler_installed')
    @patch.object(CloudflareDeploy, 'run_command')
    def test_deploy_command_fails(self, mock_run_cmd, mock_check_wrangler, deployer):
        mock_check_wrangler.return_value ***REMOVED*** True
        mock_run_cmd.side_effect ***REMOVED*** CloudflareDeployError("Deploy failed")

        with pytest.raises(CloudflareDeployError, match***REMOVED***"Deploy failed"):
            deployer.deploy()

    def test_deploy_invalid_project(self, tmp_path):
        deployer ***REMOVED*** CloudflareDeploy(project_dir***REMOVED***tmp_path / "nonexistent")

        with pytest.raises(CloudflareDeployError):
            deployer.deploy()


class TestIntegration:
    """Integration tests"""

    @patch.object(CloudflareDeploy, 'check_wrangler_installed')
    @patch.object(CloudflareDeploy, 'run_command')
    def test_full_deployment_flow(self, mock_run_cmd, mock_check_wrangler, temp_project):
        mock_check_wrangler.return_value ***REMOVED*** True
        mock_run_cmd.return_value ***REMOVED*** (0, "Success", "")

        deployer ***REMOVED*** CloudflareDeploy(
            project_dir***REMOVED***temp_project,
            env***REMOVED***"production",
            dry_run***REMOVED***False,
            verbose***REMOVED***True
        )

        result ***REMOVED*** deployer.deploy()

        assert result is True
        assert mock_run_cmd.call_count ***REMOVED******REMOVED*** 1

        # Verify correct command was built
        call_args ***REMOVED*** mock_run_cmd.call_args[0][0]
        assert "wrangler" in call_args
        assert "deploy" in call_args
        assert "--env" in call_args
        assert "production" in call_args


if __name__ ***REMOVED******REMOVED*** "__main__":
    pytest.main([__file__, "-v"])
