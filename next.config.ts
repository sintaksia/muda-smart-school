import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aynuunaurwugqbuhwxbx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "fgfqalcklhqhtilgyapm.supabase.co",
      },
    ],
  },
};

export default nextConfig;
