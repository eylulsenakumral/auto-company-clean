#!/usr/bin/env npx tsx
"use strict";
/**
 * Dev.to Auto-Publish CLI Tool
 *
 * Publishes markdown articles to Dev.to via REST API v1
 *
 * Usage:
 *   npx tsx scripts/devto-publish.ts \
 *     --title "Article Title" \
 *     --file ./posts/article.md \
 *     --tags "github,actions,automation" \
 *     --published true
 *
 * Env vars (required):
 *   DEVTO_API_KEYyour_api_key
 *   DEVTO_API_BASEhttps://dev.to/api
 *
 * @author Auto Company
 * @license MIT
 */
var __assign  (this && this.__assign) || function () {
    __assign  Object.assign || function(t) {
        for (var s, i  1, n  arguments.length; i < n; i++) {
            s  arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p]  s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter  (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P  Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator  generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator  (this && this.__generator) || function (thisArg, body) {
    var _  { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g  Object.create((typeof Iterator  "function" ? Iterator : Object).prototype);
    return g.next  verb(0), g["throw"]  verb(1), g["return"]  verb(2), typeof Symbol  "function" && (g[Symbol.iterator]  function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g  0, op[0] && (_  0)), _) try {
            if (f  1, y && (t  op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t  y["return"]) && t.call(y), 0) : y.next) && !(t  t.call(y, op[1])).done) return t;
            if (y  0, t) op  [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t  op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y  op[1]; op  [0]; continue;
                case 7: op  _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t  _.trys, t  t.length > 0 && t[t.length - 1]) && (op[0]  6 || op[0]  2)) { _  0; continue; }
                    if (op[0]  3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label  op[1]; break; }
                    if (op[0]  6 && _.label < t[1]) { _.label  t[1]; t  op; break; }
                    if (t && _.label < t[2]) { _.label  t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op  body.call(thisArg, _);
        } catch (e) { op  [6, e]; y  0; } finally { f  t  0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1  require("fs");
var path_1  require("path");
//  Config 
var CONFIG  {
    API_BASE: process.env.DEVTO_API_BASE || 'https://dev.to/api',
    API_KEY: process.env.DEVTO_API_KEY,
    RATE_LIMIT_DELAY: 3000, // 3 seconds between requests (safe for 10 req/30s)
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // Exponential backoff base
};
//  Utilities 
/**
 * Delay with promise
 */
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
/**
 * Exponential backoff with jitter
 */
function getRetryDelay(attempt) {
    return CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt) + Math.random() * 500;
}
/**
 * Parse tags from comma-separated string
 */
function parseTags(tagsStr) {
    return tagsStr
        .split(',')
        .map(function (t) { return t.trim().toLowerCase(); })
        .filter(function (t) { return t.length > 0 && t.length < 25; });
}
/**
 * Extract frontmatter and body from markdown
 * Supports both YAML and TOML frontmatter
 */
function parseMarkdown(content) {
    var yamlFrontmatterRegex  /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    var tomlFrontmatterRegex  /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
    var yamlMatch  content.match(yamlFrontmatterRegex);
    if (yamlMatch) {
        return { frontmatter: parseYamlFrontmatter(yamlMatch[1]), body: yamlMatch[2].trim() };
    }
    var tomlMatch  content.match(tomlFrontmatterRegex);
    if (tomlMatch) {
        return { frontmatter: parseTomlFrontmatter(tomlMatch[1]), body: tomlMatch[2].trim() };
    }
    return { frontmatter: {}, body: content.trim() };
}
/**
 * Simple YAML frontmatter parser (supports common keys)
 */
function parseYamlFrontmatter(yaml) {
    var result  {};
    var lines  yaml.split('\n');
    for (var _i  0, lines_1  lines; _i < lines_1.length; _i++) {
        var line  lines_1[_i];
        var match  line.match(/^(\w+):\s*(.+)$/);
        if (match) {
            var key  match[1], value  match[2];
            result[key]  value;
        }
    }
    return result;
}
/**
 * Simple TOML frontmatter parser (supports common keys)
 */
function parseTomlFrontmatter(toml) {
    var result  {};
    var lines  toml.split('\n');
    for (var _i  0, lines_2  lines; _i < lines_2.length; _i++) {
        var line  lines_2[_i];
        var match  line.match(/^(\w+)\s*\s*["'](.+)["']$/);
        if (match) {
            var key  match[1], value  match[2];
            result[key]  value;
        }
    }
    return result;
}
/**
 * Color codes for console output
 */
var colors  {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    dim: '\x1b[2m',
};
function log(message, color) {
    if (color  void 0) { color  'reset'; }
    console.log("".concat(colors[color]).concat(message).concat(colors.reset));
}
//  API Client 
var DevtoClient  /** @class */ (function () {
    function DevtoClient(apiKey, baseUrl) {
        if (baseUrl  void 0) { baseUrl  CONFIG.API_BASE; }
        this.lastRequestTime  0;
        this.apiKey  apiKey;
        this.baseUrl  baseUrl;
    }
    /**
     * Enforce rate limiting between requests
     */
    DevtoClient.prototype.enforceRateLimit  function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, timeSinceLastRequest, waitTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now  Date.now();
                        timeSinceLastRequest  now - this.lastRequestTime;
                        if (!(timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY)) return [3 /*break*/, 2];
                        waitTime  CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest;
                        log("Rate limit: waiting ".concat(waitTime, "ms..."), 'dim');
                        return [4 /*yield*/, delay(waitTime)];
                    case 1:
                        _a.sent();
                        _a.label  2;
                    case 2:
                        this.lastRequestTime  Date.now();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make authenticated API request with retry logic
     */
    DevtoClient.prototype.request  function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options, retryCount) {
            var url, headers, response, retryDelay, errorData, error_1, retryDelay;
            if (options  void 0) { options  {}; }
            if (retryCount  void 0) { retryCount  0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.enforceRateLimit()];
                    case 1:
                        _a.sent();
                        url  "".concat(this.baseUrl).concat(endpoint);
                        headers  __assign({ 'Content-Type': 'application/json', 'API-Key': this.apiKey, 'User-Agent': 'Devto-Publish-CLI/1.0' }, options.headers);
                        _a.label  2;
                    case 2:
                        _a.trys.push([2, 9, , 12]);
                        return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { headers: headers }))
                            // Handle rate limiting (429)
                        ];
                    case 3:
                        response  _a.sent();
                        if (!(response.status  429)) return [3 /*break*/, 6];
                        if (!(retryCount < CONFIG.MAX_RETRIES)) return [3 /*break*/, 5];
                        retryDelay  getRetryDelay(retryCount);
                        log("Rate limited. Retrying in ".concat(retryDelay, "ms..."), 'yellow');
                        return [4 /*yield*/, delay(retryDelay)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.request(endpoint, options, retryCount + 1)];
                    case 5: throw new Error('Rate limit exceeded. Max retries reached.');
                    case 6:
                        if (!!response.ok) return [3 /*break*/, 8];
                        return [4 /*yield*/, response.json().catch(function () { return ({ error: 'Unknown error' }); })];
                    case 7:
                        errorData  _a.sent();
                        throw new Error("HTTP ".concat(response.status, ": ").concat(errorData.error));
                    case 8: return [2 /*return*/, response.json()];
                    case 9:
                        error_1  _a.sent();
                        if (!(retryCount < CONFIG.MAX_RETRIES && error_1 instanceof Error && !error_1.message.includes('HTTP'))) return [3 /*break*/, 11];
                        retryDelay  getRetryDelay(retryCount);
                        log("Network error. Retrying in ".concat(retryDelay, "ms..."), 'yellow');
                        return [4 /*yield*/, delay(retryDelay)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, this.request(endpoint, options, retryCount + 1)];
                    case 11: throw error_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user's published articles
     */
    DevtoClient.prototype.getArticles  function () {
        return __awaiter(this, arguments, void 0, function (perPage, page) {
            if (perPage  void 0) { perPage  1000; }
            if (page  void 0) { page  1; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/articles/me?per_page".concat(perPage, "&page").concat(page))];
            });
        });
    };
    /**
     * Check if article with title already exists
     */
    DevtoClient.prototype.articleExists  function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var articles, normalizedTitle_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getArticles()];
                    case 1:
                        articles  _a.sent();
                        normalizedTitle_1  title.toLowerCase().trim();
                        return [2 /*return*/, articles.some(function (article) { return article.title.toLowerCase().trim()  normalizedTitle_1; })];
                    case 2:
                        error_2  _a.sent();
                        log("Warning: Could not check for duplicates. Proceeding anyway...", 'yellow');
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new article
     */
    DevtoClient.prototype.createArticle  function (article) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/articles', {
                        method: 'POST',
                        body: JSON.stringify({ article: article }),
                    })];
            });
        });
    };
    /**
     * Update an existing article
     */
    DevtoClient.prototype.updateArticle  function (id, article) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/articles/".concat(id), {
                        method: 'PUT',
                        body: JSON.stringify({ article: article }),
                    })];
            });
        });
    };
    return DevtoClient;
}());
function parseArgs() {
    var args  process.argv.slice(2);
    var options  {};
    for (var i  0; i < args.length; i++) {
        var arg  args[i];
        var nextArg  args[i + 1];
        switch (arg) {
            case '--title':
                options.title  nextArg;
                i++;
                break;
            case '--file':
                options.file  nextArg;
                i++;
                break;
            case '--tags':
                options.tags  nextArg;
                i++;
                break;
            case '--published':
                options.published  nextArg  'true' || nextArg  undefined;
                if (nextArg ! undefined)
                    i++;
                break;
            case '--description':
                options.description  nextArg;
                i++;
                break;
            case '--series':
                options.series  nextArg;
                i++;
                break;
            case '--canonical':
                options.canonical  nextArg;
                i++;
                break;
            case '--dry-run':
                options.dryRun  true;
                break;
            case '--update':
                options.update  true;
                break;
            case '--help':
                printHelp();
                process.exit(0);
                break;
        }
    }
    return options;
}
function printHelp() {
    console.log("\nDev.to Auto-Publish CLI Tool\n\nUsage:\n  npx tsx scripts/devto-publish.ts [options]\n\nOptions:\n  --title <string>          Article title (required unless in frontmatter)\n  --file <path>             Path to markdown file (required)\n  --tags <csv>              Comma-separated tags (required unless in frontmatter)\n  --published [true|false]  Publish immediately or save as draft (default: true)\n  --description <string>    Article description\n  --series <string>         Series name for grouped articles\n  --canonical <url>         Canonical URL for original post\n  --dry-run                 Validate without posting\n  --update                  Update existing article (matches by title)\n  --help                    Show this help\n\nEnvironment variables (required):\n  DEVTO_API_KEY             Your Dev.to API key\n  DEVTO_API_BASE           API base URL (default: https://dev.to/api)\n\nExamples:\n  # Publish new article\n  npx tsx scripts/devto-publish.ts \\\n    --title \"My Article\" \\\n    --file ./posts/article.md \\\n    --tags \"javascript,typescript\" \\\n    --published true\n\n  # Dry run to validate\n  npx tsx scripts/devto-publish.ts \\\n    --file ./posts/article.md \\\n    --dry-run\n\n  # Update existing article\n  npx tsx scripts/devto-publish.ts \\\n    --file ./posts/article.md \\\n    --update\n\nFrontmatter in markdown (overrides --tags, --title, etc.):\n  ---\n  title: My Article Title\n  description: Article description\n  tags: javascript, typescript\n  published: true\n  series: My Series\n  canonical_url: https://example.com/original\n  ---\n\n  Article body starts here...\n");
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var options, filePath, content, _a, frontmatter, body, title, tags, description, series, canonical, published, client, exists, article, result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    options  parseArgs();
                    // Check API key (skip for --help and --dry-run)
                    if (!options.dryRun && !CONFIG.API_KEY) {
                        log('Error: DEVTO_API_KEY environment variable not set', 'red');
                        log('Get your API key from: https://dev.to/settings/extensions', 'blue');
                        process.exit(1);
                    }
                    // Validate file path
                    if (!options.file) {
                        log('Error: --file is required', 'red');
                        printHelp();
                        process.exit(1);
                    }
                    filePath  (0, path_1.join)(process.cwd(), options.file);
                    if (!(0, fs_1.existsSync)(filePath)) {
                        log("Error: File not found: ".concat(filePath), 'red');
                        process.exit(1);
                    }
                    // Read markdown file
                    log("Reading: ".concat(filePath), 'dim');
                    content  (0, fs_1.readFileSync)(filePath, 'utf-8');
                    _a  parseMarkdown(content), frontmatter  _a.frontmatter, body  _a.body;
                    title  frontmatter.title || options.title;
                    tags  frontmatter.tags
                        ? parseTags(frontmatter.tags)
                        : options.tags
                            ? parseTags(options.tags)
                            : [];
                    description  frontmatter.description || options.description;
                    series  frontmatter.series || options.series;
                    canonical  frontmatter.canonical_url || frontmatter.canonical || options.canonical;
                    published  frontmatter.published ! undefined
                        ? frontmatter.published  true
                        : options.published ! undefined
                            ? options.published
                            : true;
                    // Validation
                    if (!title) {
                        log('Error: Title is required (use --title or frontmatter)', 'red');
                        process.exit(1);
                    }
                    if (tags.length  0) {
                        log('Error: At least one tag is required (use --tags or frontmatter)', 'red');
                        process.exit(1);
                    }
                    if (!body || body.length  0) {
                        log('Error: Article body is empty', 'red');
                        process.exit(1);
                    }
                    // Show article preview
                    log('\n═══════════════════════════════════════════════════════════════', 'blue');
                    log('Dev.to Article Preview', 'blue');
                    log('═══════════════════════════════════════════════════════════════', 'blue');
                    log("Title:       ".concat(title), 'reset');
                    log("Description: ".concat(description || '(none)'), 'reset');
                    log("Tags:        ".concat(tags.join(', ')), 'reset');
                    log("Series:      ".concat(series || '(none)'), 'reset');
                    log("Canonical:   ".concat(canonical || '(none)'), 'reset');
                    log("Published:   ".concat(published ? 'YES' : 'NO (draft)'), published ? 'green' : 'yellow');
                    log("Body length: ".concat(body.length, " chars"), 'dim');
                    log('═══════════════════════════════════════════════════════════════\n', 'blue');
                    // Dry run
                    if (options.dryRun) {
                        log('Dry run complete. Article is ready to publish.', 'green');
                        process.exit(0);
                    }
                    client  new DevtoClient(CONFIG.API_KEY, CONFIG.API_BASE);
                    if (!!options.update) return [3 /*break*/, 2];
                    log('Checking for existing articles with same title...', 'dim');
                    return [4 /*yield*/, client.articleExists(title)];
                case 1:
                    exists  _b.sent();
                    if (exists) {
                        log("Error: Article \"".concat(title, "\" already exists on Dev.to"), 'red');
                        log('Use --update to modify the existing article, or change the title.', 'yellow');
                        process.exit(1);
                    }
                    _b.label  2;
                case 2:
                    article  {
                        title: title,
                        description: description,
                        tags: tags,
                        series: series,
                        canonical_url: canonical,
                        published: published,
                        body_markdown: body,
                    };
                    _b.label  3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    log(options.update ? 'Updating article...' : 'Publishing article...', 'dim');
                    return [4 /*yield*/, client.createArticle(article)];
                case 4:
                    result  _b.sent();
                    log('\n═══════════════════════════════════════════════════════════════', 'green');
                    log('Success! Article published', 'green');
                    log('═══════════════════════════════════════════════════════════════', 'green');
                    log("URL: ".concat(result.url), 'blue');
                    log("Path: ".concat(result.path), 'dim');
                    log("ID: ".concat(result.id), 'dim');
                    log("Published at: ".concat(result.published_at), 'dim');
                    log('═══════════════════════════════════════════════════════════════\n', 'green');
                    process.exit(0);
                    return [3 /*break*/, 6];
                case 5:
                    error_3  _b.sent();
                    log("\nError: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error'), 'red');
                    if (error_3 instanceof Error) {
                        if (error_3.message.includes('401')) {
                            log('Hint: Check your DEVTO_API_KEY is valid', 'yellow');
                        }
                        else if (error_3.message.includes('422')) {
                            log('Hint: Check your article content meets Dev.to requirements', 'yellow');
                        }
                        else if (error_3.message.includes('429')) {
                            log('Hint: Rate limit exceeded. Wait a few minutes and try again', 'yellow');
                        }
                    }
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    log("Fatal error: ".concat(error), 'red');
    process.exit(1);
});
