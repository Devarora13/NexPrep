/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["quickjs-emscripten"],
    images:{
        domains: ['lh3.googleusercontent.com', 'ui-avatars.com'],
    }
};

export default nextConfig;
