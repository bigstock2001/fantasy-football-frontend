// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all backend calls through /bff to avoid CORS issues
        source: "/bff/:path*",
        destination: "https://backend.footballforeverdynasty.us/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
