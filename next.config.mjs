/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tenor.com",
      },

      {
        protocol: "https",
        hostname: "xgdafzttwlbqtklethon.supabase.co",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.externals = config.externals || {};
      config.externals["@stagewise/toolbar-next"] =
        "commonjs @stagewise/toolbar-next";
    }
    return config;
  },
};

export default nextConfig;
