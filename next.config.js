/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/bff/standings",        destination: "/api/standings" },
      { source: "/bff/roster",           destination: "/api/roster" },
      { source: "/bff/matchups",         destination: "/api/matchups" },
      { source: "/bff/polls/active",     destination: "/api/polls/active" },
      { source: "/bff/draft/countdown",  destination: "/api/draft/countdown" },

      // New: stop WP 404s by serving local JSON
      { source: "/bff/news/commissioner", destination: "/api/news/commissioner" },
      { source: "/bff/message-board",     destination: "/api/message-board" },
      { source: "/bff/messages",          destination: "/api/message-board" },

      // Fallback (optional): anything else under /bff goes to the old backend
      { source: "/bff/:path*", destination: "https://backend.footballforeverdynasty.us/:path*" },
    ];
  },
};
module.exports = nextConfig;
