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

