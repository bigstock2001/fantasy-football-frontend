/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Local BFF routes -> App Router API routes
      { source: "/bff/standings",        destination: "/api/mfl/standings" },
      { source: "/bff/matchups",         destination: "/api/mfl/matchups" },
      { source: "/bff/roster",           destination: "/api/mfl/roster" },           // if you have this route
      { source: "/bff/polls/active",     destination: "/api/polls/active" },         // if used
      { source: "/bff/draft/countdown",  destination: "/api/draft/countdown" },      // if used
      { source: "/bff/news/commissioner",destination: "/api/news/commissioner" },    // if used

      // Anything else under /bff falls back to WordPress
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};

module.exports = nextConfig;
