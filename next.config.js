/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  image: {
    domains: ["i.redd.it"],
  },
};

module.exports = nextConfig;
