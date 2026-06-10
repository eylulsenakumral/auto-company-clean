/** @type {import('next').NextConfig} */
declare const nextConfig: {
    output: string;
    images: {
        unoptimized: boolean;
    };
    basePath: string;
    assetPrefix: string;
};
export default nextConfig;
