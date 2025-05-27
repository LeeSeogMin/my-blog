import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        // 외부 이미지 도메인 허용
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
        // 이미지 로딩 실패 시 기본 이미지로 fallback
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
    },
    // 개발 환경에서의 로깅 개선
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

export default nextConfig;
