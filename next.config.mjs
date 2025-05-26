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
};

export default nextConfig;
