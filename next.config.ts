import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;

module.exports = {
  typescript: {
    // !! KUJDES !!
    // Lejon build-in të përfundojë edhe kur ka gabime tipe
    // !! KUJDES !!
    ignoreBuildErrors: true,
  },
}
