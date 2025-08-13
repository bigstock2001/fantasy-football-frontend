/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};
module.exports = nextConfig;
