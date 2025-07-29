import fs from "fs";
import path from "path";

// Post-build script para mover el sitemap.xml a la ubicación correcta
const distDir = "./dist";
const sitemapDir = path.join(distDir, "sitemap.xml");
const sitemapFile = path.join(sitemapDir, "index.html");
const finalSitemap = path.join(distDir, "sitemap.xml");

try {
  // Si existe el directorio sitemap.xml con index.html dentro
  if (fs.existsSync(sitemapFile)) {
    console.log("Moving sitemap to correct location...");

    // Leer el contenido del sitemap
    const sitemapContent = fs.readFileSync(sitemapFile, "utf8");

    // Eliminar el directorio sitemap.xml
    fs.rmSync(sitemapDir, { recursive: true, force: true });

    // Escribir el sitemap.xml en la raíz de dist
    fs.writeFileSync(finalSitemap, sitemapContent);

    console.log("✅ Sitemap moved successfully to /sitemap.xml");
  } else {
    console.log("⚠️ Sitemap directory not found, skipping...");
  }
} catch (error) {
  console.error("❌ Error processing sitemap:", error);
}
