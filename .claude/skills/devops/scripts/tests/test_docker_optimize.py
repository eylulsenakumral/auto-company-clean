"""
Tests for docker-optimize.py

Run with: pytest test_docker_optimize.py -v
"""

import pytest
import json
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from docker_optimize import DockerfileAnalyzer


@pytest.fixture
def temp_dockerfile(tmp_path):
    """Create temporary Dockerfile"""
    dockerfile ***REMOVED*** tmp_path / "Dockerfile"
    return dockerfile


def write_dockerfile(filepath, content):
    """Helper to write Dockerfile content"""
    with open(filepath, 'w') as f:
        f.write(content)


class TestDockerfileAnalyzerInit:
    """Test DockerfileAnalyzer initialization"""

    def test_init(self, temp_dockerfile):
        write_dockerfile(temp_dockerfile, "FROM node:20\n")
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)

        assert analyzer.dockerfile_path ***REMOVED******REMOVED*** temp_dockerfile
        assert analyzer.verbose is False
        assert analyzer.lines ***REMOVED******REMOVED*** []
        assert analyzer.issues ***REMOVED******REMOVED*** []
        assert analyzer.suggestions ***REMOVED******REMOVED*** []


class TestLoadDockerfile:
    """Test Dockerfile loading"""

    def test_load_success(self, temp_dockerfile):
        content ***REMOVED*** "FROM node:20\nWORKDIR /app\n"
        write_dockerfile(temp_dockerfile, content)

        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        result ***REMOVED*** analyzer.load_dockerfile()

        assert result is True
        assert len(analyzer.lines) ***REMOVED******REMOVED*** 2

    def test_load_nonexistent(self, tmp_path):
        analyzer ***REMOVED*** DockerfileAnalyzer(tmp_path / "nonexistent")

        with pytest.raises(FileNotFoundError):
            analyzer.load_dockerfile()


class TestAnalyzeBaseImage:
    """Test base image analysis"""

    def test_latest_tag(self, temp_dockerfile):
        write_dockerfile(temp_dockerfile, "FROM node:latest\n")
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_base_image()

        assert len(analyzer.issues) ***REMOVED******REMOVED*** 1
        assert analyzer.issues[0]['category'] ***REMOVED******REMOVED*** 'base_image'
        assert 'latest' in analyzer.issues[0]['message']

    def test_no_tag(self, temp_dockerfile):
        write_dockerfile(temp_dockerfile, "FROM node\n")
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_base_image()

        assert len(analyzer.issues) ***REMOVED******REMOVED*** 1
        assert 'no tag' in analyzer.issues[0]['message']

    def test_specific_tag(self, temp_dockerfile):
        write_dockerfile(temp_dockerfile, "FROM node:20-alpine\n")
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_base_image()

        # Should have no issues with specific tag
        base_image_issues ***REMOVED*** [i for i in analyzer.issues if i['category'] ***REMOVED******REMOVED*** 'base_image']
        assert len(base_image_issues) ***REMOVED******REMOVED*** 0

    def test_non_alpine_suggestion(self, temp_dockerfile):
        write_dockerfile(temp_dockerfile, "FROM node:20\n")
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_base_image()

        assert len(analyzer.suggestions) >***REMOVED*** 1
        assert any('Alpine' in s['message'] for s in analyzer.suggestions)


class TestAnalyzeMultiStage:
    """Test multi-stage build analysis"""

    def test_single_stage_with_build_tools(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_multi_stage()

        assert len(analyzer.issues) ***REMOVED******REMOVED*** 1
        assert analyzer.issues[0]['category'] ***REMOVED******REMOVED*** 'optimization'
        assert 'multi-stage' in analyzer.issues[0]['message'].lower()

    def test_multi_stage_no_issues(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20 AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from***REMOVED***build /app/dist ./dist
CMD ["node", "dist/server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_multi_stage()

        multi_stage_issues ***REMOVED*** [i for i in analyzer.issues if i['category'] ***REMOVED******REMOVED*** 'optimization']
        assert len(multi_stage_issues) ***REMOVED******REMOVED*** 0


class TestAnalyzeLayerCaching:
    """Test layer caching analysis"""

    def test_source_before_dependencies(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_layer_caching()

        assert len(analyzer.issues) ***REMOVED******REMOVED*** 1
        assert analyzer.issues[0]['category'] ***REMOVED******REMOVED*** 'caching'

    def test_correct_order(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_layer_caching()

        caching_issues ***REMOVED*** [i for i in analyzer.issues if i['category'] ***REMOVED******REMOVED*** 'caching']
        assert len(caching_issues) ***REMOVED******REMOVED*** 0


class TestAnalyzeSecurity:
    """Test security analysis"""

    def test_no_user_instruction(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_security()

        assert len(analyzer.issues) >***REMOVED*** 1
        security_issues ***REMOVED*** [i for i in analyzer.issues if i['category'] ***REMOVED******REMOVED*** 'security']
        assert any('root' in i['message'] for i in security_issues)

    def test_with_user_instruction(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY . .
USER node
CMD ["node", "server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_security()

        # Should not have root user issue
        root_issues ***REMOVED*** [i for i in analyzer.issues
                      if i['category'] ***REMOVED******REMOVED*** 'security' and 'root' in i['message']]
        assert len(root_issues) ***REMOVED******REMOVED*** 0

    def test_detect_secrets(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
ENV API_KEY***REMOVED***secret123
ENV PASSWORD***REMOVED***mypassword
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_security()

        secret_issues ***REMOVED*** [i for i in analyzer.issues
                        if i['category'] ***REMOVED******REMOVED*** 'security' and 'secret' in i['message'].lower()]
        assert len(secret_issues) >***REMOVED*** 1


class TestAnalyzeAptCache:
    """Test apt cache cleanup analysis"""

    def test_apt_without_cleanup(self, temp_dockerfile):
        content ***REMOVED*** """
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y curl
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_apt_cache()

        assert len(analyzer.suggestions) >***REMOVED*** 1
        assert any('apt cache' in s['message'] for s in analyzer.suggestions)

    def test_apt_with_cleanup(self, temp_dockerfile):
        content ***REMOVED*** """
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_apt_cache()

        apt_suggestions ***REMOVED*** [s for s in analyzer.suggestions if 'apt cache' in s['message']]
        assert len(apt_suggestions) ***REMOVED******REMOVED*** 0


class TestAnalyzeCombineRun:
    """Test RUN command combination analysis"""

    def test_consecutive_runs(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_combine_run()

        assert len(analyzer.suggestions) >***REMOVED*** 1
        assert any('consecutive' in s['message'] for s in analyzer.suggestions)

    def test_non_consecutive_runs(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
RUN apt-get update
COPY package.json .
RUN npm install
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_combine_run()

        consecutive_suggestions ***REMOVED*** [s for s in analyzer.suggestions
                                  if 'consecutive' in s['message']]
        assert len(consecutive_suggestions) ***REMOVED******REMOVED*** 0


class TestAnalyzeWorkdir:
    """Test WORKDIR analysis"""

    def test_no_workdir(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
COPY . /app
CMD ["node", "/app/server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_workdir()

        assert len(analyzer.suggestions) >***REMOVED*** 1
        assert any('WORKDIR' in s['message'] for s in analyzer.suggestions)

    def test_with_workdir(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        analyzer.load_dockerfile()
        analyzer.analyze_workdir()

        workdir_suggestions ***REMOVED*** [s for s in analyzer.suggestions if 'WORKDIR' in s['message']]
        assert len(workdir_suggestions) ***REMOVED******REMOVED*** 0


class TestFullAnalyze:
    """Test complete analysis"""

    def test_analyze_poor_dockerfile(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:latest
COPY . .
RUN npm install
CMD ["node", "server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        results ***REMOVED*** analyzer.analyze()

        assert 'dockerfile' in results
        assert 'total_lines' in results
        assert 'issues' in results
        assert 'suggestions' in results
        assert 'summary' in results

        # Should have multiple issues and suggestions
        assert results['summary']['warnings'] > 0
        assert results['summary']['suggestions'] > 0

    def test_analyze_good_dockerfile(self, temp_dockerfile):
        content ***REMOVED*** """
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm ci --only***REMOVED***production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from***REMOVED***build /app/dist ./dist
COPY --from***REMOVED***build /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
"""
        write_dockerfile(temp_dockerfile, content)
        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        results ***REMOVED*** analyzer.analyze()

        # Should have minimal issues
        assert results['summary']['errors'] ***REMOVED******REMOVED*** 0
        # May have some suggestions, but fewer issues overall


class TestPrintResults:
    """Test results printing"""

    def test_print_results(self, temp_dockerfile, capsys):
        content ***REMOVED*** "FROM node:latest\n"
        write_dockerfile(temp_dockerfile, content)

        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile)
        results ***REMOVED*** analyzer.analyze()
        analyzer.print_results(results)

        captured ***REMOVED*** capsys.readouterr()
        assert "Dockerfile Analysis" in captured.out
        assert "Summary:" in captured.out
        assert "ISSUES:" in captured.out or "SUGGESTIONS:" in captured.out


class TestIntegration:
    """Integration tests"""

    def test_full_analysis_workflow(self, temp_dockerfile):
        content ***REMOVED*** """
FROM python:3.11
COPY . /app
RUN pip install -r /app/requirements.txt
ENV API_KEY***REMOVED***secret
CMD ["python", "/app/app.py"]
"""
        write_dockerfile(temp_dockerfile, content)

        analyzer ***REMOVED*** DockerfileAnalyzer(temp_dockerfile, verbose***REMOVED***True)
        results ***REMOVED*** analyzer.analyze()

        # Verify all expected checks ran
        assert len(analyzer.issues) > 0
        assert len(analyzer.suggestions) > 0

        # Should flag multiple categories
        categories ***REMOVED*** {i['category'] for i in analyzer.issues}
        assert 'security' in categories

        # Verify summary calculations
        total_findings ***REMOVED*** (results['summary']['errors'] +
                         results['summary']['warnings'] +
                         results['summary']['suggestions'])
        assert total_findings > 0


if __name__ ***REMOVED******REMOVED*** "__main__":
    pytest.main([__file__, "-v"])
