import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    output: "standalone",
    outputFileTracingIncludes: {
        "/api/get-url": [
            `./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/${process.arch}/**/*`,
            `./node_modules/.pnpm/@img+sharp-linux-${process.arch}@*/node_modules/@img/sharp-linux-${process.arch}/**/*`,
            `./node_modules/.pnpm/@img+sharp-libvips-linux-${process.arch}@*/node_modules/@img/sharp-libvips-linux-${process.arch}/**/*`,
        ],
    },
};

export default nextConfig;
