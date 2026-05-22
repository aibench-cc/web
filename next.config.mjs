/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // CF Pages 上 next/image 默认走 image-resizing,
    // SVG/JPG 走 unoptimized 更省 quota
    unoptimized: true,
  },
};

export default nextConfig;
