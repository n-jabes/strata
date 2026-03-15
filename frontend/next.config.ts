import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Node.js-only packages out of the browser bundle.
  // pg uses dns/net/tls which don't exist in the browser runtime.
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "bcryptjs", "@prisma/client"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
