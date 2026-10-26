import { afterEach, describe, expect, it, vi } from "vitest";
import { draftSnapshotSchema } from "./validations/draft";
import { draftFingerprint, draftKey, readLocalDraft, writeLocalDraft } from "./draft-storage";

const snapshot = { username: 'example', theme: 'classic', layout: 'classic', sections: [
  { id: 'hero', type: 'HERO', title: 'Hero', isVisible: true, content: { fullName: '', github: 'unfinished-url' } },
  { id: 'projects', type: 'PROJECTS', title: 'Projects', isVisible: true, content: { items: [{ title: '', description: '', link: 'https://', screenshots: [{ url: '', caption: '' }] }] } },
] };
afterEach(() => { vi.unstubAllGlobals(); });
describe('private draft recovery', () => {
  it('ignores JSONB object key order but preserves meaningful array order', () => {
    expect(draftFingerprint({ one: 1, two: { a: 2, b: 3 } })).toBe(draftFingerprint({ two: { b: 3, a: 2 }, one: 1 }));
    expect(draftFingerprint([1, 2])).not.toBe(draftFingerprint([2, 1]));
  });
  it('keeps incomplete fields but rejects malformed block shapes', () => {
    expect(draftSnapshotSchema.parse(snapshot)).toMatchObject(snapshot);
    expect(draftSnapshotSchema.safeParse({ ...snapshot, sections: [{ ...snapshot.sections[1], content: { items: [42] } }] }).success).toBe(false);
  });
  it('scopes recovery copies to their owner and ignores corrupted/expired data', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key), setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
    const parsed = draftSnapshotSchema.parse(snapshot);
    expect(writeLocalDraft('one', parsed, 3)).toBe(true);
    expect(readLocalDraft('one')?.revision).toBe(3);
    expect(readLocalDraft('two')).toBeNull();
    values.set(draftKey('one'), '{broken');
    expect(readLocalDraft('one')).toBeNull();
    values.set(draftKey('one'), JSON.stringify({ snapshot, revision: 3, savedAt: 0 }));
    expect(readLocalDraft('one')).toBeNull();
    expect(values.has(draftKey('one'))).toBe(false);
  });
  it('does not crash the editor when browser storage is unavailable', () => {
    vi.stubGlobal('localStorage', { setItem: () => { throw new Error('Quota exceeded'); } });
    expect(writeLocalDraft('one', draftSnapshotSchema.parse(snapshot), 0)).toBe(false);
    expect(readLocalDraft('one')).toBeNull();
  });
});
