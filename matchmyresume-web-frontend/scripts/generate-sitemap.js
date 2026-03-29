import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your routes here - add new routes as you create pages
const routes = [
  '/',
  '/about',
  '/contact',
  '/login',
  '/register',
  '/reset-password'
];

// Base URL for your site - change this to your actual domain
const baseUrl = 'https://matchmyresume.com';

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => {
  const url = route === '/' ? baseUrl : `${baseUrl}${route}`;
  const lastmod = new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  // Ensure dist directory exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write sitemap to dist directory
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');

  console.log('✅ Sitemap generated successfully at:', sitemapPath);
}

generateSitemap();