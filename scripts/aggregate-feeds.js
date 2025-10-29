/**
 * scripts/aggregate-feeds.js
 *
 * - Fetches configured RSS/Atom feeds
 * - For each new article, creates a markdown file under POSTS_DIR (e.g. posts/)
 * - Updates POSTS_JSON (assets/js/posts.json) with metadata index (for client listing)
 * - Updates sitemap.xml at SITEMAP_PATH
 *
 * Environment variables:
 *  - SITE_URL (required for sitemap; default fallback included)
 *  - POSTS_DIR (default "posts")
 *  - POSTS_JSON (default "assets/js/posts.json")
 *  - SITEMAP_PATH (default "sitemap.xml")
 *
 * Usage: node scripts/aggregate-feeds.js
 */

import fs from 'fs/promises';
import path from 'path';
import RSSParser from 'rss-parser';
import matter from 'gray-matter';
import slugify from 'slugify';

const parser = new RSSParser({
  headers: { 'User-Agent': 'portfolio-feed-aggregator/1.0 (+https://github.com)' }
});

// Configuration: add or remove feeds here.
// Each feed can provide a category tag to attach to imported posts.
// You can expand tags or mapping as you wish.
const FEEDS = [
  // Tech
  { url: 'https://techcrunch.com/feed/', tag: 'tech' },
  { url: 'https://www.wired.com/feed/rss', tag: 'tech' },

  // AI/ML
  { url: 'https://towardsdatascience.com/feed', tag: 'ai' },
  { url: 'https://export.arxiv.org/rss/cs.AI', tag: 'ai' },

  // Cloud
  { url: 'https://aws.amazon.com/blogs/aws/feed/', tag: 'cloud' },
  { url: 'https://cloud.google.com/blog/rss', tag: 'cloud' },
  { url: 'https://azure.microsoft.com/en-us/blog/feed/', tag: 'cloud' },

  // Dev/Programming
  { url: 'https://dev.to/feed', tag: 'dev' },

  // Popular sources (optional)
  { url: 'https://hnrss.org/frontpage', tag: 'news' }
];

const SITE_URL = (process.env.SITE_URL || 'https://yourusername.github.io').replace(/\/$/, '');
const POSTS_DIR = process.env.POSTS_DIR || 'posts';
const POSTS_JSON = process.env.POSTS_JSON || 'assets/js/posts.json';
const SITEMAP_PATH = process.env.SITEMAP_PATH || 'sitemap.xml';

// Limits
const ITEMS_PER_FEED = 5;      // items per feed to consider
const MAX_TOTAL_ADDS = 20;     // avoid huge imports in one run
const EXCERPT_LEN = 320;

(async function main(){
  console.log(`Starting feed aggregator. SITE_URL=${SITE_URL}`);
  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(POSTS_JSON), { recursive: true }).catch(()=>{});

    // Load existing posts metadata (by source_url) to detect duplicates
    const existing = await readExistingPosts(POSTS_DIR);
    console.log(`Existing posts found: ${existing.count}`);

    let added = 0;
    const addedItems = [];

    for (const feedCfg of FEEDS) {
      if (added >= MAX_TOTAL_ADDS) break;
      try {
        const feed = await parser.parseURL(feedCfg.url);
        const items = (feed.items || []).slice(0, ITEMS_PER_FEED);

        for (const item of items) {
          if (added >= MAX_TOTAL_ADDS) break;

          const sourceUrl = (item.link || item.guid || item.id || '').split('#')[0];
          if (!sourceUrl) continue;

          if (existing.urls.has(sourceUrl)) {
            // Already have this article
            continue;
          }

          // Build metadata
          const title = item.title ? item.title.trim() : 'Untitled';
          // Prefer isoDate; fallback to pubDate or now
          const date = (item.isoDate || item.pubDate) ? new Date(item.isoDate || item.pubDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
          const author = item.creator || item.author || feed.title || 'Unknown';
          const categories = (item.categories || []).slice(0,5);
          if (feedCfg.tag && !categories.includes(feedCfg.tag)) categories.unshift(feedCfg.tag);

          // Slug generation: based on title + site-safe; ensure uniqueness
          let baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!?:@]/g }).slice(0, 120) || 'post';
          let slug = baseSlug;
          let idx = 1;
          while (existing.slugs.has(slug) || addedItems.some(a => a.slug === slug)) {
            slug = `${baseSlug}-${idx++}`;
          }

          // Content/excerpt: attempt to extract a short excerpt
          let excerpt = '';
          if (item.contentSnippet) excerpt = item.contentSnippet;
          else if (item.content) excerpt = stripHtml(item.content).slice(0, EXCERPT_LEN);
          else if (item.summary) excerpt = stripHtml(item.summary).slice(0, EXCERPT_LEN);
          excerpt = excerpt.replace(/\s+/g, ' ').trim().slice(0, EXCERPT_LEN);

          // Create markdown content with frontmatter
          const filename = `${date}-${slug}.md`;
          const filepath = path.join(POSTS_DIR, filename);
          const front = {
            title: title,
            date: date,
            author: author,
            tags: categories,
            source: feed.title || 'external',
            source_url: sourceUrl,
            slug: slug
          };

          const contentParts = [];
          if (item.content) contentParts.push(item.content);
          else if (item.summary) contentParts.push(item.summary);
          else if (item.contentSnippet) contentParts.push(item.contentSnippet);
          // Always add a "Read original" footer with link
          contentParts.push(`<p><em>Original article: <a href="${sourceUrl}" target="_blank" rel="noopener">${sourceUrl}</a></em></p>`);

          const md = `---\n${yamlFromObject(front)}\n---\n\n${contentParts.join('\n\n')}\n`;

          await fs.writeFile(filepath, md, 'utf-8');
          console.log(`Wrote post: ${filepath}`);

          // Track
          existing.urls.add(sourceUrl);
          existing.slugs.add(slug);
          addedItems.push({ title, slug, date, excerpt, path: filepath, source_url: sourceUrl, tags: categories });

          added += 1;
        }

      } catch (err) {
        console.warn(`Failed to parse feed ${feedCfg.url}: ${err.message}`);
      }
    } // feeds loop

    console.log(`Added ${added} new posts.`);

    // Rebuild posts index (assets/js/posts.json) from posts directory
    await rebuildPostsJson(POSTS_DIR, POSTS_JSON, SITE_URL);

    // Rebuild sitemap.xml
    await rebuildSitemap(POSTS_DIR, SITEMAP_PATH, SITE_URL);

    console.log('Aggregator finished.');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();

/* ------------------- helpers ------------------- */

async function readExistingPosts(postsDir) {
  const result = { urls: new Set(), slugs: new Set(), count: 0 };
  try {
    const files = await fs.readdir(postsDir);
    for (const f of files) {
      if (!f.endsWith('.md') && !f.endsWith('.markdown')) continue;
      const content = await fs.readFile(path.join(postsDir, f), 'utf-8');
      try {
        const fm = matter(content);
        if (fm.data && fm.data.source_url) result.urls.add(fm.data.source_url);
        if (fm.data && fm.data.slug) result.slugs.add(String(fm.data.slug));
        result.count += 1;
      } catch {
        // ignore parse errors
      }
    }
  } catch (e) {
    // empty directory is fine
  }
  return result;
}

async function rebuildPostsJson(postsDir, outPath, siteUrl) {
  const out = [];
  try {
    const files = await fs.readdir(postsDir);
    for (const f of files) {
      if (!f.endsWith('.md') && !f.endsWith('.markdown')) continue;
      const full = path.join(postsDir, f);
      const raw = await fs.readFile(full, 'utf-8');
      const fm = matter(raw);
      const meta = fm.data || {};
      const title = meta.title || f;
      const slug = meta.slug || slugify(title, { lower: true, strict: true });
      const date = meta.date || fsStatDate(full);
      const excerpt = firstPlainText(fm.content || '', 240);
      const readingTime = estimateReadingTime(fm.content || '');
      // client expects: title, slug, date, excerpt, path, tags, readingTime
      out.push({
        title,
        slug,
        date,
        excerpt,
        readingTime,
        path: `${siteUrl}/post.html?slug=${encodeURIComponent(slug)}`,
        tags: meta.tags || (meta.categories || [])
      });
    }
    // sort by date desc
    out.sort((a,b) => (new Date(b.date) - new Date(a.date)));
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8');
    console.log(`Updated posts index: ${outPath} (${out.length} posts)`);
  } catch (err) {
    console.error('Failed to rebuild posts.json:', err);
    throw err;
  }
}

async function rebuildSitemap(postsDir, sitemapPath, siteUrl){
  // Basic sitemap: home, blog, and post.html?slug=...
  const urls = [
    { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/blog.html`, changefreq: 'daily', priority: '0.8' }
  ];
  try {
    const files = await fs.readdir(postsDir);
    for (const f of files) {
      if (!f.endsWith('.md') && !f.endsWith('.markdown')) continue;
      const raw = await fs.readFile(path.join(postsDir, f), 'utf-8');
      const fm = matter(raw);
      const slug = fm.data?.slug || slugify(fm.data?.title || f, { lower: true, strict: true });
      const date = fm.data?.date || fsStatDate(path.join(postsDir, f));
      const loc = `${siteUrl}/post.html?slug=${encodeURIComponent(slug)}`;
      urls.push({ loc, changefreq: 'monthly', priority: '0.6', lastmod: date });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => {
        return `  <url>\n    <loc>${u.loc}</loc>\n    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>\n    ` : ''}<changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
      }).join('\n') +
      `\n</urlset>\n`;

    await fs.writeFile(sitemapPath, xml, 'utf-8');
    console.log(`Wrote sitemap: ${sitemapPath}`);
  } catch (err) {
    console.error('Failed to rebuild sitemap:', err);
    throw err;
  }
}

/* Utility helpers */

function yamlFromObject(obj) {
  // Minimal safe YAML emitter for small frontmatter objects
  // Avoid introducing new dependency just for YAML stringify
  const parts = [];
  for (const [k,v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      const arr = v.map(x => `  - "${String(x).replace(/"/g,'\\"')}"`).join('\n');
      parts.push(`${k}:\n${arr}`);
    } else if (typeof v === 'string') {
      const safe = v.includes('\n') || v.includes('"') || v.includes(':') ? `|\n  ${String(v).replace(/\n/g, '\n  ')}` : `"${String(v).replace(/"/g,'\\"')}"`;
      parts.push(`${k}: ${safe}`);
    } else {
      parts.push(`${k}: ${JSON.stringify(v)}`);
    }
  }
  return parts.join('\n');
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstPlainText(mdContent, maxLen=200){
  const plain = stripHtml(mdContent);
  return plain.slice(0, maxLen).trim();
}

function estimateReadingTime(text) {
  const words = (stripHtml(text) || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

function fsStatDate(filepath){
  try {
    const s = fs.statSync ? require('fs').statSync(filepath) : null;
    if(s && s.mtime) return s.mtime.toISOString().slice(0,10);
  } catch {}
  return new Date().toISOString().slice(0,10);
}
