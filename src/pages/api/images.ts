import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
    const searchParams = url.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
        return new Response(JSON.stringify({ error: "productId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // URL base de la carpeta de imágenes del producto
        const baseUrl = `https://belatrizcolombia.com/app/public/template/shop/img/img_productos/${productId}/`;
        
        // Lista de nombres de archivos comunes que intentaremos buscar
        const commonImageNames = [
            'PERFIL.webp', 
            'PERFIL_3.webp',
            'PERFIL_4.webp',
            'PERFIL_5.webp',
            'LATERAL.webp',
            'LATERAL_2.webp',
            'FRONTAL.webp',
            'FRONTAL_2.webp',
            'TRASERA.webp',
            'DETALLE.webp',
            'DETALLE_2.webp',
            'DETALLE_3.webp',
            'CONJUNTO.webp',
            'AMBIENTE.webp',
            'MODELO.webp',
            // También intentar con extensiones .jpg y .png
            'PERFIL.jpg',
            'PERFIL_2.jpg',
            'PERFIL_3.jpg',
            'LATERAL.jpg',
            'FRONTAL.jpg',
            'DETALLE.jpg',
            'PERFIL.png',
            'PERFIL_2.png',
            'LATERAL.png',
            'FRONTAL.png'
        ];

        const existingImages: string[] = [];

        // Función para verificar si una imagen existe
        const checkImageExists = async (imageUrl: string): Promise<boolean> => {
            try {
                const response = await fetch(imageUrl, { 
                    method: 'HEAD',
                    signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
                });
                return response.ok;
            } catch {
                return false;
            }
        };

        // Verificar cada imagen potencial
        const imageChecks = commonImageNames.map(async (imageName) => {
            const fullUrl = baseUrl + imageName;
            const exists = await checkImageExists(fullUrl);
            if (exists) {
                existingImages.push(fullUrl);
            }
        });

        // Ejecutar todas las verificaciones en paralelo
        await Promise.all(imageChecks);

        // La segunda imagen ya se maneja en catalogo.ts

        // Ordenar las imágenes para que PERFIL.webp aparezca primero
        existingImages.sort((a, b) => {
            const aIsPerfil = a.includes('PERFIL.webp');
            const bIsPerfil = b.includes('PERFIL.webp');
            
            if (aIsPerfil && !bIsPerfil) return -1;
            if (!aIsPerfil && bIsPerfil) return 1;
            
            // Ordenar por nombre de archivo
            const aName = a.split('/').pop() || '';
            const bName = b.split('/').pop() || '';
            return aName.localeCompare(bName);
        });

        // Si no encontramos imágenes, devolver la imagen placeholder
        if (existingImages.length === 0) {
            existingImages.push('/assets/placeholder.svg');
        }

        return new Response(JSON.stringify({
            productId,
            images: existingImages,
            count: existingImages.length
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error(`Error buscando imágenes para producto ${productId}:`, error);
        
        return new Response(JSON.stringify({
            productId,
            images: ['/assets/placeholder.svg'],
            count: 1,
            error: "Error al buscar imágenes"
        }), {
            status: 200, // Devolver 200 para no romper la aplicación
            headers: { "Content-Type": "application/json" },
        });
    }
};