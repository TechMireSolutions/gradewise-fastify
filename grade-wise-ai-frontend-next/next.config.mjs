import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"}/api/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias["react-router-dom"] = path.resolve(__dirname, "src/lib/react-router-dom-mock.js");
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/lib/react-router-dom-mock.js",
    },
  },
};

export default nextConfig;
