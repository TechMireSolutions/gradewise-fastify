/** @type {import('next').NextConfig} */
const FIREBASE_AUTH_DOMAIN = "grade-wise-ai-v2.firebaseapp.com";

const nextConfig = {
  // output: "standalone"
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005"}/api/:path*`,
      },
      {
        source: "/__/auth",
        destination: `https://${FIREBASE_AUTH_DOMAIN}/__/auth`,
      },
      {
        source: "/__/auth/:path*",
        destination: `https://${FIREBASE_AUTH_DOMAIN}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/init.json",
        destination: `https://${FIREBASE_AUTH_DOMAIN}/__/firebase/init.json`,
      },
    ];
  },
};

export default nextConfig;
