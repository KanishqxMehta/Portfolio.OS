import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useToastStore } from '@/store/useToastStore';
import { draftFingerprint, draftSnapshot, readLocalDraft, writeLocalDraft } from './draft-storage';

const snapshot = { username: 'draft-owner', theme: 'classic', layout: 'classic', sections: [] };
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key), setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
  usePortfolioStore.setState({ ...snapshot, draftOwnerId: 'owner', draftRevision: null, draftStatus: 'error', lastDraftSnapshot: draftFingerprint(snapshot), isLoading: false, isSaving: false });
  useToastStore.setState({ toasts: [] });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('draft recovery outages', () => {
  it('keeps a recovery copy even before a server revision is known', () => {
    expect(writeLocalDraft('owner', snapshot, null, draftFingerprint(snapshot))).toBe(true);
    expect(readLocalDraft('owner')).toMatchObject({ snapshot, revision: null, baseline: draftFingerprint(snapshot) });
  });
  it('retries without replacing edits and saves with the recovered revision', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json({ revision: 2, snapshot })).mockResolvedValueOnce(Response.json({ revision: 3 }));
    vi.stubGlobal('fetch', fetch);
    usePortfolioStore.setState({ username: 'edited-name' });
    expect(await usePortfolioStore.getState().saveDraft()).toBe(true);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({ revision: 2, snapshot: { username: 'edited-name' } });
    expect(usePortfolioStore.getState()).toMatchObject({ username: 'edited-name', draftStatus: 'saved', draftRevision: 3 });
  });
  it('does not overwrite a newer remote draft after an initial outage', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ revision: 4, snapshot: { ...snapshot, username: 'newer' } }));
    vi.stubGlobal('fetch', fetch);
    usePortfolioStore.setState({ username: 'local-edit' });
    expect(await usePortfolioStore.getState().saveDraft()).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(usePortfolioStore.getState()).toMatchObject({ draftStatus: 'conflict', username: 'local-edit' });
    expect(readLocalDraft('owner')?.snapshot.username).toBe('local-edit');
  });
  it('retains edits when recovery keeps failing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Service unavailable', { status: 503 })));
    usePortfolioStore.setState({ username: 'local-edit' });
    expect(await usePortfolioStore.getState().saveDraft()).toBe(false);
    expect(readLocalDraft('owner')?.snapshot).toEqual(draftSnapshot(usePortfolioStore.getState()));
    expect(usePortfolioStore.getState().draftStatus).toBe('error');
  });
  it('does not log a client exception when initial recovery fails', async () => {
    const error = vi.spyOn(console, 'error');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ publicSlug: snapshot.username, content: { sections: [] } })).mockResolvedValueOnce(new Response('', { status: 503 })));
    await usePortfolioStore.getState().loadPortfolio({ userId: 'owner' });
    expect(error).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState()).toMatchObject({ draftStatus: 'error', isLoading: false });
    expect(usePortfolioStore.getState().sections[0].type).toBe('HERO');
  });
});
