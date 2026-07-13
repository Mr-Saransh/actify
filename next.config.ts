import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_ZmxleGlibGUtcHJpbWF0ZS00LmNsZXJrLmFjY291bnRzLmRldiQ",
  },
};

export default nextConfig;
