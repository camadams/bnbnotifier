/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: [
        "@node-rs/argon2",
        "puppeteer",
        "@sparticuz/chromium",
      ],
    },
  };
  
export default nextConfig;
