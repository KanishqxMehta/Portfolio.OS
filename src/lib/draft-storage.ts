import { draftSnapshotSchema, type DraftSnapshot } from "./validations/draft";

export const DRAFT_DEBOUNCE_MS = 1200;
/** PostgreSQL JSONB can reorder object keys; ordering is not an edit. */
export function draftFingerprint(value: unknown): string {
  return JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right))) : item);
}
export function draftKey(userId: string) { return `portfolio-draft:v1:${userId}`; }
export function readLocalDraft(userId: string): { snapshot: DraftSnapshot; revision: number | null; baseline?: string } | null {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey(userId)) || "null");
    if (!value || (value.revision !== null && (!Number.isInteger(value.revision) || value.revision < 0)) || !Number.isFinite(value.savedAt)) return null;
    if (value.revision === null && typeof value.baseline !== 'string') return null;
    if (Date.now() - value.savedAt > 30 * 86400_000) { clearLocalDraft(userId); return null; }
    const parsed = draftSnapshotSchema.safeParse(value.snapshot);
    return parsed.success ? { snapshot: parsed.data, revision: value.revision, baseline: value.baseline } : null;
  } catch { return null; }
}
export function writeLocalDraft(userId: string, snapshot: DraftSnapshot, revision: number | null, baseline?: string): boolean {
  try { localStorage.setItem(draftKey(userId), JSON.stringify({ snapshot, revision, baseline, savedAt: Date.now() })); return true; }
  catch { return false; }
}
export function clearLocalDraft(userId: string) {
  try { localStorage.removeItem(draftKey(userId)); } catch { /* Browser storage may be disabled. */ }
}
export function draftSnapshot(state: DraftSnapshot): DraftSnapshot {
  return { username: state.username, theme: state.theme, layout: state.layout, sections: state.sections };
}
