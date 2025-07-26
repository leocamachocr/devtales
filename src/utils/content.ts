/**
 * Utilidades para manejo de contenido del blog
 * Funciones helper para determinar tipos de contenido y generar URLs
 */

import type { CollectionEntry } from "astro:content";

export type ContentItem = CollectionEntry<"tales"> | CollectionEntry<"posts">;

/**
 * Determina el tipo de contenido basado en el slug
 * @param slug - El slug del contenido
 * @param tales - Array de tales para comparar
 * @returns 'tale' o 'post'
 */
export function getContentType(
  slug: string,
  tales: CollectionEntry<"tales">[]
): "tale" | "post" {
  return tales.find((t) => t.slug === slug) ? "tale" : "post";
}

/**
 * Genera la URL correcta para un item de contenido
 * @param item - El item de contenido (tale o post)
 * @param tales - Array de tales para determinar el tipo
 * @returns La URL completa del contenido
 */
export function getContentUrl(
  item: ContentItem,
  tales: CollectionEntry<"tales">[]
): string {
  const type = getContentType(item.slug, tales);
  return type === "tale"
    ? `/devtales/tales/${item.slug}/`
    : `/devtales/posts/${item.slug}/`;
}

/**
 * Combina y ordena contenido por fecha (más reciente primero)
 * @param tales - Array de tales
 * @param posts - Array de posts
 * @param limit - Número máximo de items a retornar (opcional)
 * @returns Array combinado y ordenado
 */
export function combineAndSortContent(
  tales: CollectionEntry<"tales">[],
  posts: CollectionEntry<"posts">[],
  limit?: number
): ContentItem[] {
  const combined = [...tales, ...posts].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return limit ? combined.slice(0, limit) : combined;
}

/**
 * Obtiene los tags más utilizados del contenido
 * @param content - Array de contenido
 * @param limit - Número máximo de tags a retornar
 * @returns Array de tags ordenados por frecuencia
 */
export function getPopularTags(
  content: ContentItem[],
  limit: number = 10
): string[] {
  const tagCount = new Map<string, number>();

  content.forEach((item) => {
    if (item.data.tags) {
      item.data.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, limit);
}

/**
 * Obtiene estadísticas del contenido
 * @param tales - Array de tales
 * @param posts - Array de posts
 * @returns Objeto con estadísticas del contenido
 */
export function getContentStats(
  tales: CollectionEntry<"tales">[],
  posts: CollectionEntry<"posts">[]
) {
  return {
    totalTales: tales.length,
    totalPosts: posts.length,
    totalContent: tales.length + posts.length,
    latestUpdate: Math.max(
      ...tales.map((t) => new Date(t.data.date).getTime()),
      ...posts.map((p) => new Date(p.data.date).getTime())
    ),
  };
}

/**
 * Formatea una fecha de manera legible
 * @param date - La fecha a formatear
 * @param locale - El locale a usar (por defecto 'es-ES')
 * @returns Fecha formateada
 */
export function formatDate(date: Date, locale: string = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Formatea una fecha de manera relativa (ej: "hace 2 días")
 * @param date - La fecha a formatear
 * @param locale - El locale a usar (por defecto 'es-ES')
 * @returns Fecha formateada relativamente
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Obtiene contenido relacionado basado en tags comunes
 * @param currentItem - El item actual
 * @param allContent - Todo el contenido disponible
 * @param limit - Número máximo de items relacionados
 * @returns Array de contenido relacionado
 */
export function getRelatedContent(
  currentItem: ContentItem,
  allContent: ContentItem[],
  limit: number = 3
): ContentItem[] {
  if (!currentItem.data.tags || currentItem.data.tags.length === 0) {
    // Si no hay tags, devolver contenido reciente del mismo tipo
    return allContent
      .filter(
        (item) =>
          item.collection === currentItem.collection &&
          item.slug !== currentItem.slug
      )
      .sort(
        (a, b) =>
          new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      )
      .slice(0, limit);
  }

  // Calcular puntuación de relevancia basada en tags comunes
  const scoredContent = allContent
    .filter((item) => item.slug !== currentItem.slug)
    .map((item) => {
      const commonTags =
        item.data.tags?.filter((tag) => currentItem.data.tags?.includes(tag)) ||
        [];

      return {
        item,
        score: commonTags.length,
        recency: new Date(item.data.date).getTime(),
      };
    })
    .filter((scored) => scored.score > 0)
    .sort((a, b) => {
      // Ordenar primero por score, luego por recencia
      if (b.score !== a.score) return b.score - a.score;
      return b.recency - a.recency;
    });

  return scoredContent.slice(0, limit).map((scored) => scored.item);
}

/**
 * Busca contenido por texto en título, descripción o tags
 * @param query - Texto a buscar
 * @param content - Contenido donde buscar
 * @returns Array de contenido que coincide con la búsqueda
 */
export function searchContent(
  query: string,
  content: ContentItem[]
): ContentItem[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return [];

  return content.filter((item) => {
    const titleMatch = item.data.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.data.description
      ?.toLowerCase()
      .includes(searchTerm);
    const tagMatch = item.data.tags?.some((tag) =>
      tag.toLowerCase().includes(searchTerm)
    );
    const categoryMatch = item.data.category
      ?.toLowerCase()
      .includes(searchTerm);

    return titleMatch || descriptionMatch || tagMatch || categoryMatch;
  });
}

/**
 * Obtiene el tiempo estimado de lectura en minutos
 * @param content - El contenido del artículo
 * @param wordsPerMinute - Palabras por minuto (por defecto 200)
 * @returns Tiempo estimado de lectura en minutos
 */
export function getReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
