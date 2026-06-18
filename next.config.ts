import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  reactCompiler: process.env.NODE_ENV === "production",
};

export default nextConfig;
