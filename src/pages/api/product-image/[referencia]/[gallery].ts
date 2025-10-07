import type { APIRoute } from "astro";

const PRODUCT_IMAGE_USER = "1037614143";
const PRODUCT_IMAGE_PASS = "1037614143";

function basicAuthHeader(user: string, pass: string): string {
    return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

export const GET: APIRoute = async ({ params }) => {
    const { referencia, gallery } = params;
    
    if (!referencia || !gallery) {
        return new Response("Missing referencia or gallery parameter", { status: 400 });
    }

    try {
        const authHeader = basicAuthHeader(PRODUCT_IMAGE_USER, PRODUCT_IMAGE_PASS);
        const directoryUrl = `https://belatrizcolombia.com/app/public/template/shop/img/img_productos/${referencia}/`;
        
        console.log(`Obteniendo listado de archivos de: ${directoryUrl}`);
        
        // Obtener el listado de archivos del directorio
        const response = await fetch(directoryUrl, {
            method: "GET",
            headers: {
                "Authorization": authHeader,
                "User-Agent": "Mozilla/5.0 (compatible; JewelryCatalog/1.0)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            console.error(`Error obteniendo directorio: ${response.status}`);
            return new Response(null, { 
                status: 302,
                headers: { 
                    "Location": "/assets/placeholder.svg"
                }
            });
        }

        const html = await response.text();
        console.log(`HTML del directorio recibido`);
        
        // Extraer archivos de imagen del HTML del directorio
        const imageFiles = [];
        const lines = html.split('\n');
        
        for (const line of lines) {
            // Buscar líneas que contienen enlaces a archivos de imagen
            const match = line.match(/<a href="([^"]+\.(jpg|jpeg|png|webp|gif))">/i);
            if (match) {
                const filename = match[1];
                imageFiles.push(filename);
            }
        }
        
        console.log(`Archivos de imagen encontrados:`, imageFiles);
        
        // Tomar la primera imagen que encuentre
        if (imageFiles.length > 0) {
            const firstImageFile = imageFiles[0];
            const imageUrl = directoryUrl + firstImageFile;
            
            console.log(`Obteniendo segunda imagen: ${imageUrl}`);
            
            // Obtener la imagen
            const imageResponse = await fetch(imageUrl, {
                method: "GET",
                headers: {
                    "Authorization": authHeader,
                    "User-Agent": "Mozilla/5.0 (compatible; JewelryCatalog/1.0)",
                },
                signal: AbortSignal.timeout(15000)
            });
            
            if (imageResponse.ok) {
                const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
                const imageBuffer = await imageResponse.arrayBuffer();
                
                return new Response(imageBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=3600',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                });
            }
        }
        
        console.log(`No se encontró imagen adicional para referencia ${referencia}`);
        console.log(`Total de archivos en directorio: ${imageFiles.length}`);
        
        return new Response(null, { 
            status: 302,
            headers: { 
                "Location": "/assets/placeholder.svg"
            }
        });

    } catch (error) {
        console.error(`Error fetching product image ${referencia}:`, error);
        
        return new Response(null, { 
            status: 302,
            headers: { 
                "Location": "/assets/placeholder.svg"
            }
        });
    }
};