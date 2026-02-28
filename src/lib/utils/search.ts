/**
 * Smart search utilities for fuzzy matching and typo tolerance
 */

/**
 * Normalize string for case-insensitive comparison
 * Removes diacritics, converts to lowercase, trims whitespace
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
}

/**
 * Calculate Levenshtein distance between two strings (edit distance)
 * Used for typo tolerance
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Check if two strings match with fuzzy tolerance
 * Returns true if strings are similar enough (typo-tolerant)
 */
export function fuzzyMatch(query: string, target: string, threshold = 0.7): boolean {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  // Exact match
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Check if query words are in target (partial match)
  const queryWords = normalizedQuery.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);

  for (const qWord of queryWords) {
    let found = false;
    for (const tWord of targetWords) {
      // Check substring match
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        found = true;
        break;
      }

      // Check fuzzy match using Levenshtein distance
      const maxLen = Math.max(qWord.length, tWord.length);
      if (maxLen > 0) {
        const distance = levenshteinDistance(qWord, tWord);
        const similarity = 1 - distance / maxLen;
        if (similarity >= threshold) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      return false;
    }
  }

  return true;
}

/**
 * Score a match for ranking results
 * Higher score = better match
 */
export function scoreMatch(query: string, target: string): number {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);

  // Exact match gets highest score
  if (normalizedTarget === normalizedQuery) {
    return 1000;
  }

  // Starts with query
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return 900;
  }

  // Contains query as substring
  if (normalizedTarget.includes(normalizedQuery)) {
    return 800;
  }

  // Calculate similarity score
  const maxLen = Math.max(normalizedQuery.length, normalizedTarget.length);
  if (maxLen === 0) return 0;

  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const similarity = 1 - distance / maxLen;

  return similarity * 700;
}

/**
 * Search across multiple fields with fuzzy matching
 */
export function multiFieldSearch(query: string, fields: (string | null | undefined)[]): boolean {
  if (!query || query.trim() === '') {
    return true; // Empty query matches everything
  }

  for (const field of fields) {
    if (field && fuzzyMatch(query, field)) {
      return true;
    }
  }

  return false;
}

/**
 * Search and score across multiple fields
 * Returns the best match score
 */
export function multiFieldScore(query: string, fields: (string | null | undefined)[]): number {
  if (!query || query.trim() === '') {
    return 0;
  }

  let bestScore = 0;

  for (const field of fields) {
    if (field) {
      const score = scoreMatch(query, field);
      if (score > bestScore) {
        bestScore = score;
      }
    }
  }

  return bestScore;
}
