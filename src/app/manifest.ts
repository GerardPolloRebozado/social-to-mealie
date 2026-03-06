import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: 'gerardPolloRebozado/social-to-mealie',
        name: 'Social to Mealie',
        categories: ['utilities', 'food-and-drink', 'recipe manager'],
        short_name: 'Social to Mealie',
        description: 'A web application that allows users to share recipes from social media platforms to Mealie.',
        start_url: '/',
        lang: 'en',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
            {
                src: '/favicon-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            }
        ],
        "share_target": {
            "action": "/",
            "method": "GET",
            "params": {
                "title": "shared_title",
                "text": "shared_text",
                "url": "shared_url"
            }
        }
    }
}