import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
    integrations: [
        tailwind({
            // Permitir que Tailwind procese archivos CSS personalizados
            applyBaseStyles: false,
        })
    ],
    output: "server",
    adapter: vercel(),
    server: {
        port: 4321,
        host: true,
    },
    // Optimizaciones de build
    build: {
        inlineStylesheets: 'auto',
    },
    // Configuración de imágenes
    image: {
        domains: ["localhost", "belatrizcolombia.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.belatrizcolombia.com",
            },
            {
                protocol: "https",
                hostname: "belatrizcolombia.com",
            },
        ],
    },
    // Configuración de desarrollo
    devToolbar: {
        enabled: false
    }
});
