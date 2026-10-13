import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Lexical ships ESM-only packages (including ones we depend on
  // transitively); transpiling them lets both the Next.js build and
  // next/jest (which reuses this list) process them.
  transpilePackages: ["lexical", "@lexical/.*", "@preact/.*"],
};

export default nextConfig;
