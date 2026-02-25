/**
 * Groups raw content by exact music_id match.
 */

interface ContentMusic {
  id: string;
  music_id: string | null;
  music_name: string | null;
  music_author: string | null;
}

interface MusicGroup {
  musicId: string;
  musicName: string;
  musicAuthor: string | null;
  contentIds: string[];
}

export function groupByMusic(items: ContentMusic[]): MusicGroup[] {
  const groups = new Map<string, { musicName: string; musicAuthor: string | null; contentIds: string[] }>();

  for (const item of items) {
    if (!item.music_id) continue;

    const existing = groups.get(item.music_id);
    if (existing) {
      existing.contentIds.push(item.id);
      // Keep the first non-null music_author we find
      if (!existing.musicAuthor && item.music_author) {
        existing.musicAuthor = item.music_author;
      }
    } else {
      groups.set(item.music_id, {
        musicName: item.music_name || "Unknown Audio",
        musicAuthor: item.music_author || null,
        contentIds: [item.id],
      });
    }
  }

  // Only return groups with 2+ posts
  return [...groups.entries()]
    .filter(([, group]) => group.contentIds.length >= 2)
    .map(([musicId, group]) => ({
      musicId,
      musicName: group.musicName,
      musicAuthor: group.musicAuthor,
      contentIds: group.contentIds,
    }));
}
