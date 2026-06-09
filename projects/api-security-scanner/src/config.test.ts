import { loadConfig, generateConfigTemplate } from './config';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('Config', () ***REMOVED***> {
  let testDir: string;

  beforeEach(() ***REMOVED***> {
    testDir ***REMOVED*** join(__dirname, '../test-config-fixtures');
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() ***REMOVED***> {
    try {
      rmdirSync(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('generateConfigTemplate', () ***REMOVED***> {
    it('should generate valid JSON config', () ***REMOVED***> {
      const template ***REMOVED*** generateConfigTemplate();
      const config ***REMOVED*** JSON.parse(template);

      expect(config).toHaveProperty('severity');
      expect(config).toHaveProperty('ignore');
      expect(config).toHaveProperty('framework');
    });

    it('should include default values', () ***REMOVED***> {
      const template ***REMOVED*** generateConfigTemplate();
      const config ***REMOVED*** JSON.parse(template);

      expect(config.severity).toBe('warning');
      expect(config.ignore).toContain('node_modules');
      expect(config.framework).toBe('auto');
    });
  });

  describe('loadConfig', () ***REMOVED***> {
    it('should return default config when file does not exist', () ***REMOVED***> {
      const config ***REMOVED*** loadConfig('/nonexistent/path');

      expect(config.severity).toBe('warning');
      expect(config.ignore).toContain('node_modules');
    });

    it('should load config from .api-securityrc file', () ***REMOVED***> {
      const configPath ***REMOVED*** join(testDir, '.api-securityrc');
      writeFileSync(configPath, JSON.stringify({ severity: 'critical', ignore: ['test'] }));

      const config ***REMOVED*** loadConfig(testDir);

      expect(config.severity).toBe('critical');
    });

    it('should merge with defaults', () ***REMOVED***> {
      const configPath ***REMOVED*** join(testDir, '.api-securityrc');
      writeFileSync(configPath, JSON.stringify({ severity: 'critical' }));

      const config ***REMOVED*** loadConfig(testDir);

      expect(config.severity).toBe('critical');
      expect(config.ignore).toBeDefined(); // Should have default ignore
    });

    it('should handle malformed config gracefully', () ***REMOVED***> {
      const configPath ***REMOVED*** join(testDir, '.api-securityrc');
      writeFileSync(configPath, '{invalid json}');

      const config ***REMOVED*** loadConfig(testDir);

      // Should return defaults
      expect(config.severity).toBe('warning');
    });
  });
});
