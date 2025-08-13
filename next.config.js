/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Map /bff calls to your app/api/mfl routes
      { source: "/bff/standings", destination: "/api/mfl/standings" },
      { source: "/bff/matchups",  destination: "/api/mfl/matchups" },
      { source: "/bff/roster",    destination: "/api/mfl/roster" },

      // Other local APIs
      { source: "/bff/polls/active",    destination: "/api/polls/active" },
      { source: "/bff/draft/countdown", destination: "/api/draft/countdown" },
      { source: "/bff/news/commissioner", destination: "/api/news/commissioner" },
      { source: "/bff/message-board",     destination: "/api/message-board" },
      { source: "/bff/messages",          destination: "/api/message-board" },

      // Fallback to the legacy backend — keep LAST
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};

module.exports = nextConfig;
