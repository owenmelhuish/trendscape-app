/**
 * Groups raw content by hashtag similarity using Jaccard index.
 * Two posts are similar if their hashtag sets overlap >= threshold.
 */

interface ContentHashtags {
  id: string;
  hashtags: string[];
}

interface HashtagCluster {
  hashtags: string[];
  contentIds: string[];
  name: string;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

export function clusterByHashtags(
  items: ContentHashtags[],
  threshold: number = 0.3
): HashtagCluster[] {
  // Build hashtag frequency map
  const hashtagFreq = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.hashtags) {
      hashtagFreq.set(tag, (hashtagFreq.get(tag) || 0) + 1);
    }
  }

  // Filter to hashtags that appear in at least 2 posts (actual patterns)
  const significantTags = new Set(
    [...hashtagFreq.entries()]
      .filter(([, count]) => count >= 2)
      .map(([tag]) => tag)
  );

  // Build adjacency via Jaccard similarity on significant tags only
  const clusters: HashtagCluster[] = [];
  const assigned = new Set<string>();

  // Sort items by number of significant hashtags (more tags first = better seed)
  const sorted = [...items]
    .map((item) => ({
      ...item,
      sigTags: new Set(item.hashtags.filter((t) => significantTags.has(t))),
    }))
    .filter((item) => item.sigTags.size > 0)
    .sort((a, b) => b.sigTags.size - a.sigTags.size);

  for (const seed of sorted) {
    if (assigned.has(seed.id)) continue;

    const clusterContentIds = [seed.id];
    const clusterTags = new Set(seed.sigTags);
    assigned.add(seed.id);

    // Find all items similar to the seed
    for (const candidate of sorted) {
      if (assigned.has(candidate.id)) continue;
      const similarity = jaccardSimilarity(clusterTags, candidate.sigTags);
      if (similarity >= threshold) {
        clusterContentIds.push(candidate.id);
        candidate.sigTags.forEach((t) => clusterTags.add(t));
        assigned.add(candidate.id);
      }
    }

    if (clusterContentIds.length >= 2) {
      // Name = top 3 most frequent hashtags in cluster
      const tagCounts = new Map<string, number>();
      for (const id of clusterContentIds) {
        const item = items.find((i) => i.id === id);
        item?.hashtags.forEach((t) => {
          if (clusterTags.has(t)) {
            tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
          }
        });
      }
      const topTags = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

      clusters.push({
        hashtags: [...clusterTags],
        contentIds: clusterContentIds,
        name: `#${topTags.join(" #")}`,
      });
    }
  }

  return clusters;
}
