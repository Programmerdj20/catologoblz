import type { APIRoute } from "astro";

const API_URL = import.meta.env.ASTRO_API_URL || "https://belatrizcolombia.com/apirest/public/catalago2";
const API_USER = import.meta.env.ASTRO_API_USER || "a2ya10afP9TJVCL2Geh/8IUoGbfcOiEnzi1q5WQDx7G1sjIBo8OfU19rW4OK";
const API_PASS = import.meta.env.ASTRO_API_PASS || "o2yo12oF6T3Hfv.kPLtJKvO3BQE4esRQT3gB86F7GV6ADJAT55zgaNgTEB3m";


// console.log("Variables de entorno cargadas:");
// console.log("API_URL:", API_URL);
// console.log("API_USER:", API_USER ? "✓ Configurado" : "✗ No encontrado");
// console.log("API_PASS:", API_PASS ? "✓ Configurado" : "✗ No encontrado");

function basicAuthHeader(user: string, pass: string): string {
    return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

// Mapeo de IDs de categoría a nombres legibles
const CATEGORY_MAP: Record<string, string> = {
    "15": "Anillos",
    "16": "Aretes",
    "17": "Cadenas",
    "18": "Pulseras",
    "19": "Collares",
    "20": "Aretes",
    "21": "Topos",
    "22": "Gargantillas",
    "23": "Dijes",
    "24": "Pendientes",
    "25": "Sortijas",
    "26": "Esclavas",
    "27": "Argollas",
    "28": "Chokers",
    "29": "Rosarios",
    "30": "Medallas",
    "31": "Cruces"
};

function getCategoryName(categoryId: string): string {
    return CATEGORY_MAP[categoryId] || `Categoría ${categoryId}`;
}

async function getBasicProductImages(referencia: string, imagen?: string, includeSecondImage: boolean = false): Promise<string[]> {
    const images: string[] = [];
    const baseUrl = `https://belatrizcolombia.com/app/public/template/shop/img/img_productos/${referencia}/`;
    
    // La API trae la primera imagen
    if (imagen) {
        const imageUrl = imagen.startsWith('http') 
            ? imagen 
            : baseUrl + imagen;
        images.push(imageUrl);
    } else {
        // Si no hay imagen de la API, usar placeholder
        images.push('/assets/placeholder.svg');
    }
    
    // Solo obtener segunda imagen si se solicita explícitamente (para páginas de producto)
    if (includeSecondImage) {
        try {
            const authHeader = basicAuthHeader("1037614143", "1037614143");
            const directoryUrl = baseUrl;
            
            const response = await fetch(directoryUrl, {
                method: "GET",
                headers: {
                    "Authorization": authHeader,
                    "User-Agent": "Mozilla/5.0 (compatible; JewelryCatalog/1.0)",
                },
                signal: AbortSignal.timeout(3000)
            });

            if (response.ok) {
                const html = await response.text();
                const imageFiles = [];
                const lines = html.split('\n');
                
                for (const line of lines) {
                    const match = line.match(/<a href="([^"]+\.(jpg|jpeg|png|webp|gif))">/i);
                    if (match) {
                        imageFiles.push(match[1]);
                    }
                }
                
                // Agregar todas las imágenes encontradas (para galería completa)
                if (imageFiles.length > 0) {
                    for (const imageFile of imageFiles) {
                        const imageUrl = baseUrl + imageFile;
                        if (!images.includes(imageUrl)) {
                            images.push(imageUrl);
                        }
                    }
                    console.log(`${imageFiles.length} imágenes adicionales encontradas para ${referencia}`);
                }
            }
        } catch (error) {
            console.log(`No se pudieron obtener imágenes adicionales para ${referencia}:`, error);
        }
    }
    
    return images;
}


interface Product {
    id: string;
    title: string;
    sku: string;
    category: string;
    description: string;
    images: string[];
    material: string;
}

async function normalizeProduct(p: any): Promise<Product | null> {
    // console.log("Normalizando producto:", p.referencia, p.descripción);

    const id = p.referencia || p.id || p.ID || p.ref || String(Math.random());
    const title = p.descripción || p.descripcion || p.title || p.nombre || p.name || "Sin título";
    const sku = p.referencia || p.sku || p.ref || p.codigo || id;
    const categoryId = p.categoría || p.categoria || p.category || p.linea || p.tipo || "Sin categoría";
    const category = getCategoryName(categoryId.toString());
    const description = p.descripción || p.descripcion || p.description || p.descripcionLarga || title;

    // Usar el nuevo servicio de imágenes para obtener todas las imágenes disponibles
    let images: string[] = [];
    
    if (p.referencia) {
        // Temporalmente usando método simple para evitar timeouts
        images = await getBasicProductImages(p.referencia, p.imagen);
        console.log(`Producto ${p.referencia}: usando ${images.length} imágenes básicas`);
    }
    
    // Si no se pudieron obtener imágenes del servicio, usar el método anterior como fallback
    if (images.length === 0 && p.imagen && p.referencia) {
        const imageUrl = p.imagen.startsWith('http') 
            ? p.imagen 
            : `https://belatrizcolombia.com/app/public/template/shop/img/img_productos/${p.referencia}/${p.imagen}`;
        images = [imageUrl];
        
        // No agregar segunda imagen en fallback - ya se maneja en getBasicProductImages
        
        console.log(`Producto ${p.referencia}: usando método fallback - imagen -> ${imageUrl}`);
    }
    
    // Asegurar que siempre haya al menos una imagen placeholder
    if (images.length === 0) {
        images = ["/assets/placeholder.svg"];
    }

    const material = p.material || p.Material || p.tipo_material || "Oro Laminado 18K";

    return {
        id,
        title,
        sku,
        category,
        description,
        images,
        material,
    };
}

export const GET: APIRoute = async ({ url }) => {
    const searchParams = url.searchParams;
    const id = searchParams.get("id");

    try {
        const authHeader = basicAuthHeader(API_USER, API_PASS);
        
        const headers: Record<string, string> = {
            "Accept": "application/json",
            "Authorization": authHeader,
            "User-Agent": "Mozilla/5.0 (compatible; JewelryCatalog/1.0)",
        };

        const response = await fetch(API_URL, {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
            const data = await response.json();
            
            let products: Product[] = [];
            
            // La API externa devuelve: { respon: 200, total_registros: 607, detalles: [...] }
            if (data && data.detalles && Array.isArray(data.detalles)) {
                // Procesar en lotes más grandes para mayor velocidad
                const batchSize = 50;
                const batches = [];
                for (let i = 0; i < data.detalles.length; i += batchSize) {
                    batches.push(data.detalles.slice(i, i + batchSize));
                }
                
                const normalizedProducts = [];
                for (const batch of batches) {
                    const batchResults = await Promise.all(batch.map(normalizeProduct));
                    normalizedProducts.push(...batchResults);
                }
                products = normalizedProducts.filter((p: Product | null) => p !== null);
            } else if (Array.isArray(data)) {
                // Procesar en lotes más grandes para mayor velocidad
                const batchSize = 50;
                const batches = [];
                for (let i = 0; i < data.length; i += batchSize) {
                    batches.push(data.slice(i, i + batchSize));
                }
                
                const normalizedProducts = [];
                for (const batch of batches) {
                    const batchResults = await Promise.all(batch.map(normalizeProduct));
                    normalizedProducts.push(...batchResults);
                }
                products = normalizedProducts.filter((p: Product | null) => p !== null);
            } else {
                console.warn("Estructura de datos inesperada:", Object.keys(data));
                products = [];
            }

            // Si se solicita un producto específico
            if (id) {
                const product = products.find(p => p.id === id || p.sku === id);
                if (product) {
                    // Para producto específico, buscar todas las imágenes
                    product.images = await getBasicProductImages(product.sku, product.images[0]?.split('/').pop(), true);
                }
                return new Response(JSON.stringify(product ? [product] : []), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // console.log(`Devolviendo ${products.length} productos`);
            return new Response(JSON.stringify(products), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            const errorText = await response.text();
            console.error(`API externa falló con status ${response.status}`);
            console.error("Error response:", errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error("Error conectando con API externa:", error);
        
        // En caso de error, devolver array vacío
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
};