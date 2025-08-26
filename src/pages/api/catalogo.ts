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

async function getBasicProductImages(referencia: string, imagen?: string): Promise<string[]> {
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
    
    // Obtener segunda imagen dinámicamente del directorio
    try {
        const authHeader = basicAuthHeader("1037614143", "1037614143");
        const directoryUrl = baseUrl;
        
        const response = await fetch(directoryUrl, {
            method: "GET",
            headers: {
                "Authorization": authHeader,
                "User-Agent": "Mozilla/5.0 (compatible; JewelryCatalog/1.0)",
            },
            signal: AbortSignal.timeout(5000)
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
            
            // Tomar la primera imagen que encuentre para usarla como segunda
            if (imageFiles.length > 0) {
                const segundaImagenUrl = baseUrl + imageFiles[0];
                images.push(segundaImagenUrl);
                console.log(`Segunda imagen encontrada para ${referencia}: ${imageFiles[0]}`);
            }
        }
    } catch (error) {
        console.log(`No se pudo obtener segunda imagen para ${referencia}:`, error);
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
            signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
            const data = await response.json();
            
            let products: Product[] = [];
            
            // La API externa devuelve: { respon: 200, total_registros: 607, detalles: [...] }
            if (data && data.detalles && Array.isArray(data.detalles)) {
                const normalizedProducts = await Promise.all(data.detalles.map(normalizeProduct));
                products = normalizedProducts.filter((p: Product | null) => p !== null);
            } else if (Array.isArray(data)) {
                const normalizedProducts = await Promise.all(data.map(normalizeProduct));
                products = normalizedProducts.filter((p: Product | null) => p !== null);
            } else {
                console.warn("Estructura de datos inesperada:", Object.keys(data));
                products = [];
            }

            // Si se solicita un producto específico
            if (id) {
                const product = products.find(p => p.id === id || p.sku === id);
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