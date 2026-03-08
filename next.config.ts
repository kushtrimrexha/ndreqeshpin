/*import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
//  reactCompiler: true,
//}; 

/*
const nextConfig = {
  typescript: {
    // KUJDES: Kjo lejon build-in edhe nëse ka gabime TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Kjo lejon build-in edhe nëse ka gabime ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hiqe fare pjesën e eslint këtu nëse ekziston
};

export default nextConfig;