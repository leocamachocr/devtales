/**
 * Composable para manejar contenido del homepage
 * Encapsula toda la lógica relacionada con la obtención y procesamiento de contenido
 */

import { getCollection } from "astro:content";
import { combineAndSortContent, type ContentItem } from "./content";

export interface HomepageContent {
  allContent: ContentItem[];
  tales: ContentItem[];
  posts: ContentItem[];
  featuredContent: ContentItem[];
  recentTales: ContentItem[];
  recentPosts: ContentItem[];
}

/**
 * Hook para obtener y procesar contenido del homepage
 * @param options - Opciones de configuración
 * @returns Objeto con todo el contenido procesado
 */
export async function useHomepageContent(options?: {
  maxItems?: number;
  maxFeatured?: number;
}): Promise<HomepageContent> {
  const { maxItems = 6, maxFeatured = 3 } = options || {};

  // Obtener contenido de las colecciones
  const tales = await getCollection("tales");
  const posts = await getCollection("posts");

  // Combinar y ordenar por fecha
  const allContent = combineAndSortContent(tales, posts, maxItems);

  // Contenido destacado (más reciente)
  const featuredContent = allContent.slice(0, maxFeatured);

  // Tales y posts recientes por separado
  const recentTales = tales
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )
    .slice(0, 3);

  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )
    .slice(0, 3);

  return {
    allContent,
    tales,
    posts,
    featuredContent,
    recentTales,
    recentPosts,
  };
}
