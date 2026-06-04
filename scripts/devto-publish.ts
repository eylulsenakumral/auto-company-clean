#!/usr/bin/env npx tsx
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
 *   DEVTO_API_KEY***REMOVED***your_api_key
 *   DEVTO_API_BASE***REMOVED***https://dev.to/api
 *
 * @author Auto Company
 * @license MIT
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** Types ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

interface DevtoArticle {
  title: string
  description?: string
  cover_image?: string
  canonical_url?: string
  tags: string[]
  series?: string
  organization_id?: number
  published: boolean
  body_markdown: string
  main_image?: string
}

interface DevtoArticleResponse {
  type_of: string
  id: number
  title: string
  description: string
  cover_image: string | null
  readable_publish_date: string
  social_image: string | null
  slug: string
  path: string
  url: string
  canonical_url: string
  comments_count: number
  positive_reactions_count: number
  public_reactions_count: number
  user: {
    name: string
    username: string
    twitter_username: string | null
    github_username: string | null
    website_url: string | null
    profile_image: string
    profile_image_90: string
  }
  organization: {
    name: string
    slug: string
    profile_image: string
    profile_image_90: string
  } | null
  flare_tag: {
    name: string
    bg_color_hex: string
    text_color_hex: string
  } | null
  published_at: string
  last_comment_at: string
  published_timestamp: string
  reading_time_minutes: number
  tag_list: string[]
  tags: string
  body_html: string
  body_markdown: string
  url: string
}

interface DevtoErrorResponse {
  error: string
  status?: number
}

interface DevtoArticleListItem {
  type_of: string
  id: number
  title: string
  description: string
  url: string
  cover_image: string | null
  readable_publish_date: string
  slug: string
  path: string
  published_at: string | null
  created_at: string
  edited_at: string | null
  tag_list: string[]
  tags: string
  user: {
    name: string
    username: string
    profile_image: string
  }
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** Config ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

const CONFIG ***REMOVED*** {
  API_BASE: process.env.DEVTO_API_BASE || 'https://dev.to/api',
  API_KEY: process.env.DEVTO_API_KEY,
  RATE_LIMIT_DELAY: 3000, // 3 seconds between requests (safe for 10 req/30s)
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // Exponential backoff base
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** Utilities ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

/**
 * Delay with promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve ***REMOVED***> setTimeout(resolve, ms))
}

/**
 * Exponential backoff with jitter
 */
function getRetryDelay(attempt: number): number {
  return CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt) + Math.random() * 500
}

/**
 * Parse tags from comma-separated string
 */
function parseTags(tagsStr: string): string[] {
  return tagsStr
    .split(',')
    .map(t ***REMOVED***> t.trim().toLowerCase())
    .filter(t ***REMOVED***> t.length > 0 && t.length <***REMOVED*** 25)
}

/**
 * Extract frontmatter and body from markdown
 * Supports both YAML and TOML frontmatter
 */
function parseMarkdown(content: string): { frontmatter: Record<string, any>, body: string } {
  const yamlFrontmatterRegex ***REMOVED*** /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const tomlFrontmatterRegex ***REMOVED*** /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/

  const yamlMatch ***REMOVED*** content.match(yamlFrontmatterRegex)
  if (yamlMatch) {
    return { frontmatter: parseYamlFrontmatter(yamlMatch[1]), body: yamlMatch[2].trim() }
  }

  const tomlMatch ***REMOVED*** content.match(tomlFrontmatterRegex)
  if (tomlMatch) {
    return { frontmatter: parseTomlFrontmatter(tomlMatch[1]), body: tomlMatch[2].trim() }
  }

  return { frontmatter: {}, body: content.trim() }
}

/**
 * Simple YAML frontmatter parser (supports common keys)
 */
function parseYamlFrontmatter(yaml: string): Record<string, any> {
  const result: Record<string, any> ***REMOVED*** {}
  const lines ***REMOVED*** yaml.split('\n')

  for (const line of lines) {
    const match ***REMOVED*** line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      const [, key, value] ***REMOVED*** match
      result[key] ***REMOVED*** value
    }
  }

  return result
}

/**
 * Simple TOML frontmatter parser (supports common keys)
 */
function parseTomlFrontmatter(toml: string): Record<string, any> {
  const result: Record<string, any> ***REMOVED*** {}
  const lines ***REMOVED*** toml.split('\n')

  for (const line of lines) {
    const match ***REMOVED*** line.match(/^(\w+)\s****REMOVED***\s*["'](.+)["']$/)
    if (match) {
      const [, key, value] ***REMOVED*** match
      result[key] ***REMOVED*** value
    }
  }

  return result
}

/**
 * Color codes for console output
 */
const colors ***REMOVED*** {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
}

function log(message: string, color: keyof typeof colors ***REMOVED*** 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** API Client ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

class DevtoClient {
  private baseUrl: string
  private apiKey: string
  private lastRequestTime: number ***REMOVED*** 0

  constructor(apiKey: string, baseUrl: string ***REMOVED*** CONFIG.API_BASE) {
    this.apiKey ***REMOVED*** apiKey
    this.baseUrl ***REMOVED*** baseUrl
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now ***REMOVED*** Date.now()
    const timeSinceLastRequest ***REMOVED*** now - this.lastRequestTime

    if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
      const waitTime ***REMOVED*** CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest
      log(`Rate limit: waiting ${waitTime}ms...`, 'dim')
      await delay(waitTime)
    }

    this.lastRequestTime ***REMOVED*** Date.now()
  }

  /**
   * Make authenticated API request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit ***REMOVED*** {},
    retryCount: number ***REMOVED*** 0
  ): Promise<T> {
    await this.enforceRateLimit()

    const url ***REMOVED*** `${this.baseUrl}${endpoint}`
    const headers ***REMOVED*** {
      'Content-Type': 'application/json',
      'API-Key': this.apiKey,
      'User-Agent': 'Devto-Publish-CLI/1.0',
      ...options.headers,
    }

    try {
      const response ***REMOVED*** await fetch(url, { ...options, headers })

      // Handle rate limiting (429)
      if (response.status ***REMOVED******REMOVED******REMOVED*** 429) {
        if (retryCount < CONFIG.MAX_RETRIES) {
          const retryDelay ***REMOVED*** getRetryDelay(retryCount)
          log(`Rate limited. Retrying in ${retryDelay}ms...`, 'yellow')
          await delay(retryDelay)
          return this.request<T>(endpoint, options, retryCount + 1)
        }
        throw new Error('Rate limit exceeded. Max retries reached.')
      }

      // Handle client errors
      if (!response.ok) {
        const errorData: DevtoErrorResponse ***REMOVED*** await response.json().catch(() ***REMOVED***> ({ error: 'Unknown error' }))
        throw new Error(`HTTP ${response.status}: ${errorData.error}`)
      }

      return response.json()
    } catch (error) {
      // Retry on network errors
      if (retryCount < CONFIG.MAX_RETRIES && error instanceof Error && !error.message.includes('HTTP')) {
        const retryDelay ***REMOVED*** getRetryDelay(retryCount)
        log(`Network error. Retrying in ${retryDelay}ms...`, 'yellow')
        await delay(retryDelay)
        return this.request<T>(endpoint, options, retryCount + 1)
      }
      throw error
    }
  }

  /**
   * Get user's published articles
   */
  async getArticles(perPage: number ***REMOVED*** 1000, page: number ***REMOVED*** 1): Promise<DevtoArticleListItem[]> {
    return this.request<DevtoArticleListItem[]>(`/articles/me?per_page***REMOVED***${perPage}&page***REMOVED***${page}`)
  }

  /**
   * Check if article with title already exists
   */
  async articleExists(title: string): Promise<boolean> {
    try {
      const articles ***REMOVED*** await this.getArticles()
      const normalizedTitle ***REMOVED*** title.toLowerCase().trim()
      return articles.some(
        article ***REMOVED***> article.title.toLowerCase().trim() ***REMOVED******REMOVED******REMOVED*** normalizedTitle
      )
    } catch (error) {
      log(`Warning: Could not check for duplicates. Proceeding anyway...`, 'yellow')
      return false
    }
  }

  /**
   * Create a new article
   */
  async createArticle(article: DevtoArticle): Promise<DevtoArticleResponse> {
    return this.request<DevtoArticleResponse>('/articles', {
      method: 'POST',
      body: JSON.stringify({ article }),
    })
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: number, article: DevtoArticle): Promise<DevtoArticleResponse> {
    return this.request<DevtoArticleResponse>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ article }),
    })
  }
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** CLI ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

interface CliOptions {
  title?: string
  file?: string
  tags?: string
  published?: boolean
  description?: string
  series?: string
  canonical?: string
  dryRun?: boolean
  update?: boolean
}

function parseArgs(): CliOptions {
  const args ***REMOVED*** process.argv.slice(2)
  const options: CliOptions ***REMOVED*** {}

  for (let i ***REMOVED*** 0; i < args.length; i++) {
    const arg ***REMOVED*** args[i]
    const nextArg ***REMOVED*** args[i + 1]

    switch (arg) {
      case '--title':
        options.title ***REMOVED*** nextArg
        i++
        break
      case '--file':
        options.file ***REMOVED*** nextArg
        i++
        break
      case '--tags':
        options.tags ***REMOVED*** nextArg
        i++
        break
      case '--published':
        options.published ***REMOVED*** nextArg ***REMOVED******REMOVED******REMOVED*** 'true' || nextArg ***REMOVED******REMOVED******REMOVED*** undefined
        if (nextArg !***REMOVED******REMOVED*** undefined) i++
        break
      case '--description':
        options.description ***REMOVED*** nextArg
        i++
        break
      case '--series':
        options.series ***REMOVED*** nextArg
        i++
        break
      case '--canonical':
        options.canonical ***REMOVED*** nextArg
        i++
        break
      case '--dry-run':
        options.dryRun ***REMOVED*** true
        break
      case '--update':
        options.update ***REMOVED*** true
        break
      case '--help':
        printHelp()
        process.exit(0)
        break
    }
  }

  return options
}

function printHelp() {
  console.log(`
Dev.to Auto-Publish CLI Tool

Usage:
  npx tsx scripts/devto-publish.ts [options]

Options:
  --title <string>          Article title (required unless in frontmatter)
  --file <path>             Path to markdown file (required)
  --tags <csv>              Comma-separated tags (required unless in frontmatter)
  --published [true|false]  Publish immediately or save as draft (default: true)
  --description <string>    Article description
  --series <string>         Series name for grouped articles
  --canonical <url>         Canonical URL for original post
  --dry-run                 Validate without posting
  --update                  Update existing article (matches by title)
  --help                    Show this help

Environment variables (required):
  DEVTO_API_KEY             Your Dev.to API key
  DEVTO_API_BASE           API base URL (default: https://dev.to/api)

Examples:
  # Publish new article
  npx tsx scripts/devto-publish.ts \\
    --title "My Article" \\
    --file ./posts/article.md \\
    --tags "javascript,typescript" \\
    --published true

  # Dry run to validate
  npx tsx scripts/devto-publish.ts \\
    --file ./posts/article.md \\
    --dry-run

  # Update existing article
  npx tsx scripts/devto-publish.ts \\
    --file ./posts/article.md \\
    --update

Frontmatter in markdown (overrides --tags, --title, etc.):
  ---
  title: My Article Title
  description: Article description
  tags: javascript, typescript
  published: true
  series: My Series
  canonical_url: https://example.com/original
  ---

  Article body starts here...
`)
}

async function main() {
  const options ***REMOVED*** parseArgs()

  // Check API key (skip for --help and --dry-run)
  if (!options.dryRun && !CONFIG.API_KEY) {
    log('Error: DEVTO_API_KEY environment variable not set', 'red')
    log('Get your API key from: https://dev.to/settings/extensions', 'blue')
    process.exit(1)
  }

  // Validate file path
  if (!options.file) {
    log('Error: --file is required', 'red')
    printHelp()
    process.exit(1)
  }

  const filePath ***REMOVED*** join(process.cwd(), options.file)

  if (!existsSync(filePath)) {
    log(`Error: File not found: ${filePath}`, 'red')
    process.exit(1)
  }

  // Read markdown file
  log(`Reading: ${filePath}`, 'dim')
  const content ***REMOVED*** readFileSync(filePath, 'utf-8')
  const { frontmatter, body } ***REMOVED*** parseMarkdown(content)

  // Merge options with frontmatter (frontmatter takes precedence)
  const title ***REMOVED*** frontmatter.title || options.title
  const tags ***REMOVED*** frontmatter.tags
    ? parseTags(frontmatter.tags as string)
    : options.tags
      ? parseTags(options.tags)
      : []
  const description ***REMOVED*** frontmatter.description || options.description
  const series ***REMOVED*** frontmatter.series || options.series
  const canonical ***REMOVED*** frontmatter.canonical_url || frontmatter.canonical || options.canonical
  const published ***REMOVED*** frontmatter.published !***REMOVED******REMOVED*** undefined
    ? frontmatter.published ***REMOVED******REMOVED******REMOVED*** true
    : options.published !***REMOVED******REMOVED*** undefined
      ? options.published
      : true

  // Validation
  if (!title) {
    log('Error: Title is required (use --title or frontmatter)', 'red')
    process.exit(1)
  }

  if (tags.length ***REMOVED******REMOVED******REMOVED*** 0) {
    log('Error: At least one tag is required (use --tags or frontmatter)', 'red')
    process.exit(1)
  }

  if (!body || body.length ***REMOVED******REMOVED******REMOVED*** 0) {
    log('Error: Article body is empty', 'red')
    process.exit(1)
  }

  // Show article preview
  log('\n═══════════════════════════════════════════════════════════════', 'blue')
  log('Dev.to Article Preview', 'blue')
  log('═══════════════════════════════════════════════════════════════', 'blue')
  log(`Title:       ${title}`, 'reset')
  log(`Description: ${description || '(none)'}`, 'reset')
  log(`Tags:        ${tags.join(', ')}`, 'reset')
  log(`Series:      ${series || '(none)'}`, 'reset')
  log(`Canonical:   ${canonical || '(none)'}`, 'reset')
  log(`Published:   ${published ? 'YES' : 'NO (draft)'}`, published ? 'green' : 'yellow')
  log(`Body length: ${body.length} chars`, 'dim')
  log('═══════════════════════════════════════════════════════════════\n', 'blue')

  // Dry run
  if (options.dryRun) {
    log('Dry run complete. Article is ready to publish.', 'green')
    process.exit(0)
  }

  // Initialize client
  const client ***REMOVED*** new DevtoClient(CONFIG.API_KEY, CONFIG.API_BASE)

  // Check for existing article
  if (!options.update) {
    log('Checking for existing articles with same title...', 'dim')
    const exists ***REMOVED*** await client.articleExists(title)

    if (exists) {
      log(`Error: Article "${title}" already exists on Dev.to`, 'red')
      log('Use --update to modify the existing article, or change the title.', 'yellow')
      process.exit(1)
    }
  }

  // Create article payload
  const article: DevtoArticle ***REMOVED*** {
    title,
    description,
    tags,
    series,
    canonical_url: canonical,
    published,
    body_markdown: body,
  }

  // Publish
  try {
    log(options.update ? 'Updating article...' : 'Publishing article...', 'dim')
    const result ***REMOVED*** await client.createArticle(article)

    log('\n═══════════════════════════════════════════════════════════════', 'green')
    log('Success! Article published', 'green')
    log('═══════════════════════════════════════════════════════════════', 'green')
    log(`URL: ${result.url}`, 'blue')
    log(`Path: ${result.path}`, 'dim')
    log(`ID: ${result.id}`, 'dim')
    log(`Published at: ${result.published_at}`, 'dim')
    log('═══════════════════════════════════════════════════════════════\n', 'green')

    process.exit(0)
  } catch (error) {
    log(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red')

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        log('Hint: Check your DEVTO_API_KEY is valid', 'yellow')
      } else if (error.message.includes('422')) {
        log('Hint: Check your article content meets Dev.to requirements', 'yellow')
      } else if (error.message.includes('429')) {
        log('Hint: Rate limit exceeded. Wait a few minutes and try again', 'yellow')
      }
    }

    process.exit(1)
  }
}

main().catch(error ***REMOVED***> {
  log(`Fatal error: ${error}`, 'red')
  process.exit(1)
})
