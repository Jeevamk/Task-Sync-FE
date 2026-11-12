/**
 * Static site: `npm run build` writes plain HTML/CSS/JS to ./out, which any static host can serve
 * (Vercel, Netlify, Cloudflare Pages, S3, nginx). No server needed, hosted separately from the API.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
