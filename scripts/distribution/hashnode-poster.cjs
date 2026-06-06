#!/usr/bin/env node

/**
 * Hashnode Cross-Post Script
 *
 * Posts articles to Hashnode via GraphQL API
 *
 * Usage:
 *   HASHNODE_TOKEN***REMOVED***xxx HASHNODE_PUBLICATION_ID***REMOVED***yyy node scripts/distribution/hashnode-poster.cjs           # Dry-run (preview)
 *   HASHNODE_TOKEN***REMOVED***xxx HASHNODE_PUBLICATION_ID***REMOVED***yyy node scripts/distribution/hashnode-poster.cjs --execute # Publish
 *
 * Environment:
 *   HASHNODE_TOKEN - Your Hashnode Personal Access Token (https://hashnode.com/settings/developer)
 *   HASHNODE_PUBLICATION_ID - Your publication ID (find in URL or via GraphQL)
 *
 * Article source: docs/marketing/reviewflow-launch/*.md
 */

const fs ***REMOVED*** require('fs');
const path ***REMOVED*** require('path');
const https ***REMOVED*** require('https');

// Resolve paths relative to script location, then to project root
const scriptDir ***REMOVED*** __dirname;
const projectRoot ***REMOVED*** path.resolve(scriptDir, '../..');

const CONFIG ***REMOVED*** {
  graphqlEndpoint: 'https://gql.hashnode.com',
  articleDir: path.join(projectRoot, 'docs/marketing/reviewflow-launch'),
  outputDir: path.join(projectRoot, 'data/distribution/outcome'),
};

/**
 * GraphQL mutation for creating a post
 */
const CREATE_POST_MUTATION ***REMOVED*** `
mutation CreatePublicationPost($input: CreatePostInput!) {
  createPost(input: $input) {
    post {
      id
      slug
      url
      publication {
        username
      }
    }
  }
}
`;

/**
 * Read and parse article markdown
 * Frontmatter format:
 * ---
 * title: Post Title
 * tags: tag1,tag2,tag3
 * cover_image: https://...
 * ---
 */
function parseArticle(content) {
  const frontmatterRegex ***REMOVED*** /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match ***REMOVED*** content.match(frontmatterRegex);

  if (!match) {
    return {
      raw: content,
      title: content.split('\n')[0].replace(/^#+\s*/, ''),
      contentMarkdown: content,
      tags: [],
      coverImage: null,
    };
  }

  const frontmatter ***REMOVED*** match[1];
  const body ***REMOVED*** match[2];
  const meta ***REMOVED*** {};

  frontmatter.split('\n').forEach(line ***REMOVED***> {
    const [key, ...valueParts] ***REMOVED*** line.split(':');
    if (key && valueParts.length) {
      const value ***REMOVED*** valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      meta[key.trim()] ***REMOVED*** value;
    }
  });

  return {
    title: meta.title || 'Untitled',
    contentMarkdown: body,
    tags: meta.tags ? meta.tags.split(',').map(t ***REMOVED***> t.trim()) : [],
    coverImage: meta.cover_image || meta.coverImage || null,
    raw: content,
  };
}

/**
 * Make HTTPS request to Hashnode GraphQL
 */
function graphqlRequest(query, variables, token) {
  return new Promise((resolve, reject) ***REMOVED***> {
    const url ***REMOVED*** new URL(CONFIG.graphqlEndpoint);
    const payload ***REMOVED*** JSON.stringify({ query, variables });

    const options ***REMOVED*** {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req ***REMOVED*** https.request(options, (res) ***REMOVED***> {
      let body ***REMOVED*** '';
      res.on('data', chunk ***REMOVED***> body +***REMOVED*** chunk);
      res.on('end', () ***REMOVED***> {
        if (res.statusCode >***REMOVED*** 200 && res.statusCode < 300) {
          try {
            const response ***REMOVED*** JSON.parse(body);
            if (response.errors) {
              const errors ***REMOVED*** response.errors.map(e ***REMOVED***> e.message).join(', ');
              reject(new Error(`GraphQL errors: ${errors}`));
            } else {
              resolve(response.data);
            }
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * List all markdown files in article directory
 */
function listArticles() {
  if (!fs.existsSync(CONFIG.articleDir)) {
    return [];
  }
  return fs.readdirSync(CONFIG.articleDir)
    .filter(f ***REMOVED***> f.endsWith('.md'))
    .map(f ***REMOVED***> path.join(CONFIG.articleDir, f));
}

/**
 * Post article to Hashnode
 */
async function publishArticle(article, publicationId, token, isDryRun) {
  const variables ***REMOVED*** {
    input: {
      publicationId: publicationId,
      title: article.title,
      contentMarkdown: article.contentMarkdown,
      tags: article.tags.map(tag ***REMOVED***> ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
      coverImage: article.coverImage,
      publishRevision: true, // Publish immediately
    },
  };

  if (isDryRun) {
    console.log('\n***REMOVED******REMOVED******REMOVED*** DRY RUN PREVIEW ***REMOVED******REMOVED******REMOVED***');
    console.log(`Title: ${article.title}`);
    console.log(`Tags: ${article.tags.join(', ') || 'none'}`);
    console.log(`Cover Image: ${article.coverImage || 'none'}`);
    console.log(`\nGraphQL Variables:`);
    console.log(JSON.stringify(variables, null, 2));
    console.log(`\nQuery:\n${CREATE_POST_MUTATION.trim()}`);
    return { dryRun: true };
  }

  const maxRetries ***REMOVED*** 3;
  let lastError;

  for (let i ***REMOVED*** 0; i < maxRetries; i++) {
    try {
      const response ***REMOVED*** await graphqlRequest(CREATE_POST_MUTATION, variables, token);
      const post ***REMOVED*** response.createPost.post;
      return {
        id: post.id,
        slug: post.slug,
        url: post.url,
        publication: `https://hashnode.com/${post.publication.username}`,
      };
    } catch (err) {
      lastError ***REMOVED*** err;
      console.warn(`Attempt ${i + 1}/${maxRetries} failed: ${err.message}`);
      if (i < maxRetries - 1) {
        await new Promise(r ***REMOVED***> setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Save outcome to file
 */
function saveOutcome(articleName, result) {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const timestamp ***REMOVED*** new Date().toISOString().replace(/[:.]/g, '-');
  const filename ***REMOVED*** `hashnode-${path.basename(articleName, '.md')}-${timestamp}.json`;
  const filepath ***REMOVED*** path.join(CONFIG.outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  return filepath;
}

/**
 * Get user's publications (helper for finding publication ID)
 */
async function listPublications(token) {
  const query ***REMOVED*** `
query {
  me {
    publications {
      id
      username
      title
    }
  }
}
`;
  try {
    const response ***REMOVED*** await graphqlRequest(query, {}, token);
    return response.me.publications;
  } catch (err) {
    console.error('Failed to list publications:', err.message);
    return [];
  }
}

/**
 * Main execution
 */
async function main() {
  const token ***REMOVED*** process.env.HASHNODE_TOKEN;
  if (!token) {
    console.error('Error: HASHNODE_TOKEN environment variable required');
    console.error('Get your token at: https://hashnode.com/settings/developer');
    process.exit(1);
  }

  const publicationId ***REMOVED*** process.env.HASHNODE_PUBLICATION_ID;
  const isExecute ***REMOVED*** process.argv.includes('--execute');
  const isDryRun ***REMOVED*** !isExecute;
  const shouldList ***REMOVED*** process.argv.includes('--list-publications');

  console.log(`Mode: ${isExecute ? 'EXECUTE (will publish)' : 'DRY RUN (preview only)'}`);

  // Handle --list-publications flag
  if (shouldList) {
    console.log('\nFetching your publications...');
    const publications ***REMOVED*** await listPublications(token);
    if (publications.length ***REMOVED******REMOVED******REMOVED*** 0) {
      console.log('No publications found.');
    } else {
      console.log('\nYour publications:');
      publications.forEach(pub ***REMOVED***> {
        console.log(`  - ${pub.title} (@${pub.username})`);
        console.log(`    ID: ${pub.id}`);
        console.log(`    URL: https://hashnode.com/${pub.username}`);
      });
      console.log('\nSet HASHNODE_PUBLICATION_ID to the ID above to publish.');
    }
    return;
  }

  if (!publicationId) {
    console.error('Error: HASHNODE_PUBLICATION_ID environment variable required');
    console.error('Run with --list-publications to see your publications and IDs');
    console.error('Or find it in your publication URL: https://hashnode.com/USERNAME/settings/general');
    process.exit(1);
  }

  const articles ***REMOVED*** listArticles();

  if (articles.length ***REMOVED******REMOVED******REMOVED*** 0) {
    console.log('No articles found in', CONFIG.articleDir);
    return;
  }

  console.log(`Found ${articles.length} article(s)`);
  console.log(`Publication ID: ${publicationId}`);

  for (const articlePath of articles) {
    const content ***REMOVED*** fs.readFileSync(articlePath, 'utf8');
    const article ***REMOVED*** parseArticle(content);
    const basename ***REMOVED*** path.basename(articlePath);

    console.log(`\n--- Processing: ${basename} ---`);

    try {
      const result ***REMOVED*** await publishArticle(article, publicationId, token, isDryRun);

      if (isDryRun) {
        console.log('✓ Preview complete');
      } else {
        console.log('✓ Published!');
        console.log(`  URL: ${result.url}`);
        console.log(`  Slug: ${result.slug}`);
        console.log(`  Post ID: ${result.id}`);
        const outcomeFile ***REMOVED*** saveOutcome(basename, result);
        console.log('  Outcome saved to:', outcomeFile);
      }
    } catch (err) {
      console.error('✗ Failed:', err.message);
      saveOutcome(basename, { error: err.message, article: basename });
    }
  }

  console.log('\n--- Done ---');
}

if (require.main ***REMOVED******REMOVED******REMOVED*** module) {
  main().catch(err ***REMOVED***> {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
