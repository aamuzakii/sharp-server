/** @type {import('next').NextConfig} */
const nextConfig = {};

// next.config.js

module.exports = {
  async headers() {
    return [
      {
        // Enable CORS for all API routes
        source: "/api/:path*", // Adjust this source pattern based on your API route structure
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Change this to specific origins in production
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};
