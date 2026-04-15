import withPWA from "next-pwa";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: true,
})(nextConfig);