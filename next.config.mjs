/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dzeiwiyfoakfqbhivovp.supabase.co',
      },
    ],
  },
}
export default nextConfig