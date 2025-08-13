/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // MFL proxies
      { source: "/bff/standings",       destination: "/api/mfl/standings" },
      { source: "/bff/roster",          destination: "/api/mfl/roster" },
      { source: "/bff/matchups",        destination: "/api/mfl/matchups" },

      // App data
      { source: "/bff/polls/active",    destination: "/api/polls/active" },
      { source: "/bff/draft/countdown", destination: "/api/draft/countdown" },

      // Local JSON fallbacks
      { source: "/bff/news/commissioner", destination: "/api/news/commissioner" },
      { source: "/bff/message-board",     destination: "/api/message-board" },
      { source: "/bff/messages",          destination: "/api/message-board" },

      // Optional fallback to your old backend
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};
module.exports = nextConfig;
