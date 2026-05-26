/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
  async redirects() {
    return [
      { source: "/savameta/activity",   destination: "/activity",   permanent: true },
      { source: "/savameta/engagement", destination: "/engagement", permanent: true },
      { source: "/savameta/lifecycle",  destination: "/lifecycle",  permanent: true },
      { source: "/savameta/triggers",   destination: "/triggers",   permanent: true },
    ];
  },
};

export default nextConfig;
