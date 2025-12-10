'use client';

import { get, set, del, keys } from 'idb-keyval';
import { Pattern } from '../types';

const CURRENT_PATTERN_KEY = 'bubble-stitch-current-pattern';
const PATTERNS_PREFIX = 'bubble-stitch-pattern-';

export async function saveCurrentPattern(pattern: Pattern): Promise<void> {
  try {
    await set(CURRENT_PATTERN_KEY, pattern);
    await set(`${PATTERNS_PREFIX}${pattern.id}`, pattern);
  } catch (error) {
    console.error('Failed to save pattern:', error);
  }
}

export async function loadCurrentPattern(): Promise<Pattern | null> {
  try {
    const pattern = await get<Pattern>(CURRENT_PATTERN_KEY);
    return pattern || null;
  } catch (error) {
    console.error('Failed to load pattern:', error);
    return null;
  }
}

export async function loadAllPatterns(): Promise<Pattern[]> {
  try {
    const allKeys = await keys();
    const patternKeys = allKeys.filter(
      (key) => typeof key === 'string' && key.startsWith(PATTERNS_PREFIX)
    );
    const patterns: Pattern[] = [];
    for (const key of patternKeys) {
      const pattern = await get<Pattern>(key as string);
      if (pattern) {
        patterns.push(pattern);
      }
    }
    return patterns.sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load patterns:', error);
    return [];
  }
}

export async function deletePattern(patternId: string): Promise<void> {
  try {
    await del(`${PATTERNS_PREFIX}${patternId}`);
  } catch (error) {
    console.error('Failed to delete pattern:', error);
  }
}
