/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      // Allow images served from a local dev server (e.g. http://localhost/...)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      // Allow images served from GitHub Pages for static assets
      {
        protocol: 'https',
        hostname: 'bjorn-leon-henry.github.io',
        port: '',
        pathname: '/**',
      },
            {
        protocol: 'https',
        hostname: 'bjornleonhenry.online',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blh.ink',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'blh.ink',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dev.blh.ink',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'astro-bento.vercel.app',
        port: '',
        pathname: '/**',
      },
            {
        protocol: 'https',
        hostname: 'dev.bjornleonhenry.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'dev.bjornleonhenry.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    return config;
  },
};

export default nextConfig;
