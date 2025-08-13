/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      // Use the generic MFL proxy at /api/mfl with TYPE=
      { source: "/bff/standings", destination: "/api/mfl?type=standings" },
      { source: "/bff/roster",    destination: "/api/mfl?type=rosters" },

      // Use your dedicated matchups route
      { source: "/bff/matchups",  destination: "/api/mfl/matchups" },

      // Everything else under /bff goes to WordPress (Commissioner News, etc.)
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};

module.exports = nextConfig;
