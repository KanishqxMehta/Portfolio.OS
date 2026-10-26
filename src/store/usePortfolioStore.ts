import { create } from 'zustand';
import { useToastStore } from './useToastStore';
import { Section, portfolioSchema } from '@/lib/validations/portfolio';
import { slugifyUsername } from '@/lib/validations/user';
import { BlockDecision, applyDecisionsToSections, calculatePortfolioDiff } from '@/lib/diffUtils';
import { clearLocalDraft, draftFingerprint, draftSnapshot, readLocalDraft, writeLocalDraft } from '@/lib/draft-storage';
import { draftSnapshotSchema } from '@/lib/validations/draft';

interface PortfolioState {
  draftOwnerId: string | null;
  draftRevision: number | null;
  draftStatus: 'loading' | 'saved' | 'saving' | 'restored' | 'error' | 'conflict';
  draftMessage: string;
  lastDraftSnapshot: string;
  saveDraft: () => Promise<boolean>;
  discardDraft: () => Promise<boolean>;
  savedSections: Section[] | null;
  proposedSections: Section[] | null;
  diffDecisions: Record<string, BlockDecision>;
  isDiffMode: boolean;
  enableDiffMode: (proposed?: Section[]) => void;
  disableDiffMode: () => void;
  setProposedSections: (proposed: Section[]) => void;
  setBlockDiffDecision: (blockId: string, decision: BlockDecision) => void;
  acceptBlockDiff: (blockId: string) => void;
  rejectBlockDiff: (blockId: string) => void;
  acceptAllDiffs: () => void;
  discardAllDiffs: () => void;
  applyDiffChanges: () => void;
  sections: Section[];
  username: string;
  isSaving: boolean;
  isLoading: boolean;
  setUsername: (username: string) => void;
  setSections: (sections: Section[]) => void;
  addBlock: (type: string, title: string) => void;
  savePortfolio: () => Promise<boolean>;
  loadPortfolio: (options?: { userId?: string; username?: string; recoverDraft?: boolean }) => Promise<void>;
  removeBlock: (id: string) => void;
  updateBlockData: (id: string, newData: any) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  toggleBlockVisibility: (id: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  layout: string;
  setLayout: (layout: string) => void;
  isPublicOnSearch: boolean;
  setIsPublicOnSearch: (isPublic: boolean) => void;
  updatePublicSearch: (isPublic: boolean) => Promise<boolean>;
  isDraggingBlock: boolean;
  setIsDraggingBlock: (isDragging: boolean) => void;
}

let portfolioLoadVersion = 0;

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  draftOwnerId: null,
  draftRevision: null,
  draftStatus: 'loading',
  draftMessage: '',
  lastDraftSnapshot: '',
  sections: [],
  username: "",
  theme: "classic",
  layout: "classic",
  isPublicOnSearch: false,
  isSaving: false,
  isLoading: true,
  isDraggingBlock: false,
  savedSections: null,
  proposedSections: null,
  diffDecisions: {},
  isDiffMode: false,

  enableDiffMode: (proposed) => set((state) => ({
    isDiffMode: true,
    savedSections: state.savedSections || JSON.parse(JSON.stringify(state.sections)),
    proposedSections: proposed || JSON.parse(JSON.stringify(state.sections)),
    diffDecisions: {},
  })),

  disableDiffMode: () => set({ isDiffMode: false }),

  setProposedSections: (proposedSections) => set((state) => ({
    proposedSections,
    savedSections: JSON.parse(JSON.stringify(state.sections)),
    diffDecisions: {},
    isDiffMode: true,
  })),

  setBlockDiffDecision: (blockId, decision) => set((state) => {
    const newDecisions = { ...state.diffDecisions, [blockId]: decision };
    const baseline = state.savedSections || state.sections;
    const proposed = state.proposedSections || [];
    const updatedSections = applyDecisionsToSections(baseline, proposed, newDecisions);
    return {
      diffDecisions: newDecisions,
      sections: updatedSections,
    };
  }),

  acceptBlockDiff: (blockId) => {
    get().setBlockDiffDecision(blockId, 'accepted');
  },

  rejectBlockDiff: (blockId) => {
    get().setBlockDiffDecision(blockId, 'rejected');
  },

  acceptAllDiffs: () => set((state) => {
    if (!state.proposedSections) return {};
    const baseline = state.savedSections || state.sections;
    const diffs = calculatePortfolioDiff(baseline, state.proposedSections);
    const newDecisions: Record<string, BlockDecision> = {};
    for (const d of diffs) {
      if (d.status !== 'UNCHANGED') {
        newDecisions[d.blockId] = 'accepted';
      }
    }
    const updatedSections = applyDecisionsToSections(baseline, state.proposedSections, newDecisions);
    useToastStore.getState().toast("All changes accepted and applied!", "success");
    return {
      sections: updatedSections,
      savedSections: JSON.parse(JSON.stringify(updatedSections)),
      proposedSections: null,
      diffDecisions: {},
      isDiffMode: false,
    };
  }),

  discardAllDiffs: () => set((state) => {
    const original = state.savedSections ? JSON.parse(JSON.stringify(state.savedSections)) : state.sections;
    useToastStore.getState().toast("Discarded all diff changes", "info");
    return {
      sections: original,
      proposedSections: null,
      diffDecisions: {},
      isDiffMode: false,
    };
  }),

  applyDiffChanges: () => set((state) => {
    const baseline = state.savedSections || state.sections;
    const proposed = state.proposedSections || [];
    const updatedSections = applyDecisionsToSections(baseline, proposed, state.diffDecisions);
    const acceptedCount = Object.values(state.diffDecisions).filter((d) => d === 'accepted').length;
    useToastStore.getState().toast(`Applied ${acceptedCount} changes to your portfolio!`, "success");
    return {
      sections: updatedSections,
      savedSections: JSON.parse(JSON.stringify(updatedSections)),
      proposedSections: null,
      diffDecisions: {},
      isDiffMode: false,
    };
  }),

  setTheme: (theme) => set({ theme }),
  setLayout: (layout) => set({ layout }),
  setIsPublicOnSearch: (isPublicOnSearch) => set({ isPublicOnSearch }),
  updatePublicSearch: async (isPublic) => {
    set({ isPublicOnSearch: isPublic });
    try {
      const res = await fetch('/api/portfolios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublicOnSearch: isPublic }),
      });
      if (!res.ok) {
        throw new Error('Failed to update search visibility');
      }
      return true;
    } catch (err) {
      console.error('Error updating search visibility:', err);
      set({ isPublicOnSearch: !isPublic });
      return false;
    }
  },
  setIsDraggingBlock: (isDraggingBlock) => set({ isDraggingBlock }),

  setUsername: (username) => {
    set({ username: slugifyUsername(username) });
  },

  setSections: (sections) => set(() => {
    let newSections = [...sections];
    const heroIdx = newSections.findIndex((s) => s.type === "HERO");
    if (heroIdx === -1) {
      const defaultHero = {
        id: crypto.randomUUID(),
        type: "HERO",
        title: "About Me",
        content: { fullName: "", bio: "", github: "", linkedin: "", instagram: "", twitter: "" },
        isVisible: true,
      } as Section;
      newSections = [defaultHero, ...newSections];
    } else if (heroIdx > 0) {
      const [heroBlock] = newSections.splice(heroIdx, 1);
      newSections = [heroBlock, ...newSections];
    }
    return { sections: newSections };
  }),

  addBlock: (type, title) => set((state) => {
    if (state.sections.some((s) => s.type === type)) {
      return {};
    }

    let defaultContent: any = {};
    if (type === "HERO") defaultContent = { fullName: "", bio: "", github: "", linkedin: "", instagram: "", twitter: "" };
    else if (type === "SKILLS") defaultContent = { items: [] };
    else if (type === "EXPERIENCE") defaultContent = { items: [] };
    else if (type === "PROJECTS") defaultContent = { items: [] };
    else if (type === "EDUCATION") defaultContent = { items: [] };
    else if (type === "TESTIMONIALS") defaultContent = { items: [] };
    else if (type === "CONTACT_FORM") defaultContent = { emailTarget: "", buttonText: "" };

    const newBlock = {
      id: crypto.randomUUID(),
      type,
      title,
      content: defaultContent,
      isVisible: true,
    } as Section;

    let newSections;
    if (type === "HERO") {
      newSections = [newBlock, ...state.sections];
    } else {
      const contactIdx = state.sections.findIndex((s) => s.type === "CONTACT_FORM");
      if (contactIdx !== -1) {
        newSections = [...state.sections];
        newSections.splice(contactIdx, 0, newBlock);
      } else {
        newSections = [...state.sections, newBlock];
      }
    }

    return { sections: newSections };
  }),

  loadPortfolio: async (options = {}) => {
    const version = ++portfolioLoadVersion;
    const ownerId = options.userId ?? get().draftOwnerId;
    set({ isLoading: true, isSaving: false, draftOwnerId: ownerId, draftRevision: null, draftStatus: 'loading', sections: [], savedSections: null, proposedSections: null, isDiffMode: false, diffDecisions: {}, ...(get().draftOwnerId !== ownerId ? { username: options.username || '', theme: 'classic', layout: 'classic' } : {}) });
    const startTime = Date.now();
    try {
      const res = await fetch('/api/portfolios');
      if (!res.ok) throw new Error('Unable to load published portfolio');
      const data = await res.json();
      if (get().draftOwnerId !== ownerId || version !== portfolioLoadVersion) return;
      const content = data?.content || {};
      let loadedSections = content.sections || [];
      const heroIdx = loadedSections.findIndex((s: any) => s.type === "HERO");
      if (heroIdx === -1) {
        const defaultHero = {
          id: crypto.randomUUID(),
          type: "HERO",
          title: "About Me",
          content: { fullName: "", bio: "", github: "", linkedin: "", instagram: "", twitter: "" },
          isVisible: true,
        } as Section;
        loadedSections = [defaultHero, ...loadedSections];
      } else if (heroIdx > 0) {
        const [heroBlock] = loadedSections.splice(heroIdx, 1);
        loadedSections = [heroBlock, ...loadedSections];
      }

      set({
        sections: loadedSections,
        savedSections: JSON.parse(JSON.stringify(loadedSections)),
        theme: content.theme || "classic",
        layout: content.layout || "classic",
        username: data?.publicSlug || options.username || get().username,
        isPublicOnSearch: Boolean(data?.isPublicOnSearch),
      });
      set({ lastDraftSnapshot: draftFingerprint(draftSnapshot(get())), draftMessage: '' });
      const draftResponse = await fetch('/api/portfolio-draft', { cache: 'no-store' });
      if (!draftResponse.ok) throw new Error('Unable to recover saved draft');
      const draft = await draftResponse.json();
      if (get().draftOwnerId !== ownerId || version !== portfolioLoadVersion) return;
      const revision = Number(draft.revision ?? 0);
      const parsed = draftSnapshotSchema.safeParse(draft.snapshot);
      const local = ownerId ? readLocalDraft(ownerId) : null;
      const published = draftSnapshot(get());
      const unknownLocal = local?.revision === null;
      const serverFingerprint = draftFingerprint(parsed.success ? parsed.data : published);
      const conflict = unknownLocal && revision !== 0 && local.baseline !== serverFingerprint;
      const recovered = options.recoverDraft === false ? null : local && (unknownLocal || local.revision === revision) ? local.snapshot : parsed.success ? parsed.data : null;
      if (recovered) set(recovered);
      set({ draftRevision: revision, lastDraftSnapshot: serverFingerprint, draftStatus: conflict ? 'conflict' : recovered && draftFingerprint(recovered) !== draftFingerprint(published) ? 'restored' : 'saved', draftMessage: conflict ? 'A newer draft exists. Copy your unsynced edits before reloading the latest saved draft.' : '' });
    } catch {
      if (version !== portfolioLoadVersion) return;
      const local = ownerId ? readLocalDraft(ownerId) : null;
      if (local && options.recoverDraft !== false) set(local.snapshot);
      set({ draftRevision: local?.revision ?? null, lastDraftSnapshot: local?.baseline ?? get().lastDraftSnapshot, draftStatus: 'error', draftMessage: 'Draft sync is unavailable. Keep this page open and retry before publishing.' });
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      if (version === portfolioLoadVersion) set({ isLoading: false });
    }
  },

  saveDraft: async () => {
    const state = get();
    const loadVersion = portfolioLoadVersion;
    if (!state.draftOwnerId || state.isLoading || state.draftStatus === 'saving' || state.draftStatus === 'conflict') return false;
    writeLocalDraft(state.draftOwnerId, draftSnapshot(state), state.draftRevision, state.lastDraftSnapshot);
    set({ draftStatus: 'saving', draftMessage: '' });
    try {
      let revision = state.draftRevision;
      if (revision === null) {
        const recovery = await fetch('/api/portfolio-draft', { cache: 'no-store' });
        if (!recovery.ok) throw new Error('Draft recovery unavailable');
        const server = await recovery.json();
        if (get().draftOwnerId !== state.draftOwnerId || portfolioLoadVersion !== loadVersion) return false;
        if (!Number.isInteger(server.revision) || server.revision < 0) throw new Error('Invalid draft revision');
        if (server.revision !== 0 && draftFingerprint(server.snapshot) !== state.lastDraftSnapshot) {
          set({ draftStatus: 'conflict', draftMessage: 'A newer draft exists. Copy your unsynced edits before reloading the latest saved draft.' });
          return false;
        }
        revision = server.revision;
      }
      // Keep edits made during the recovery request; never reload the editor here.
      const snapshot = draftSnapshot(get());
      writeLocalDraft(state.draftOwnerId, snapshot, revision, state.lastDraftSnapshot);
      const response = await fetch('/api/portfolio-draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ snapshot, revision }) });
      const result = await response.json();
      if (get().draftOwnerId !== state.draftOwnerId || portfolioLoadVersion !== loadVersion) return false;
      if (!response.ok) {
        set({ draftStatus: response.status === 409 ? 'conflict' : 'error', draftMessage: result.error || 'Draft could not be saved. Please retry.' });
        return false;
      }
      const latest = draftSnapshot(get());
      if (draftFingerprint(latest) === draftFingerprint(snapshot)) clearLocalDraft(state.draftOwnerId);
      else writeLocalDraft(state.draftOwnerId, latest, result.revision);
      set({ draftRevision: result.revision, lastDraftSnapshot: draftFingerprint(snapshot), draftStatus: 'saved', draftMessage: '' });
      return true;
    } catch {
      if (get().draftOwnerId === state.draftOwnerId && portfolioLoadVersion === loadVersion) set({ draftStatus: 'error', draftMessage: 'Draft sync failed. A recovery copy is kept on this device when browser storage is available. Retry when online.' });
      return false;
    }
  },

  discardDraft: async () => {
    // Store the published snapshot as the new private baseline using the same CAS.
    const state = get();
    if (state.draftStatus === 'saving' || state.draftStatus === 'conflict' || state.draftRevision === null) return false;
    set({ isLoading: true });
    try {
    const response = await fetch('/api/portfolios', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load published version');
    const published = await response.json();
    const snapshot = { username: published?.publicSlug || state.username, theme: published?.content?.theme || 'classic', layout: published?.content?.layout || 'classic', sections: published?.content?.sections || [] };
    // Do not replace the current editor unless the server accepts the discard.
    const saved = await fetch('/api/portfolio-draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: state.draftRevision, snapshot }) }).catch(() => null);
    if (!saved?.ok) throw new Error('Unable to discard draft');
    if (state.draftOwnerId) clearLocalDraft(state.draftOwnerId);
    await get().loadPortfolio({ recoverDraft: false });
    return true;
    } catch {
      useToastStore.getState().toast('Draft was not discarded. Please retry when online, or reload if another tab changed it.', 'error');
      return false;
    } finally { set({ isLoading: false }); }
  },

  savePortfolio: async () => {
    if (get().isSaving) return false;
    const { sections, username, theme, layout, isPublicOnSearch } = get();
    if (!username) {
      useToastStore.getState().toast("Please set a username first!", "error");
      return false;
    }

    const validation = portfolioSchema.safeParse({
      username,
      isPublicOnSearch,
      content: { theme, layout, sections }
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid fields in block";
      useToastStore.getState().toast(`Please fix error: ${errorMsg}`, "error");
      return false;
    }

    // Publishing must not overwrite a newer draft from another tab/device.
    const draftOwnerId = get().draftOwnerId;
    const loadVersion = portfolioLoadVersion;
    set({ isSaving: true });
    if (get().draftStatus === 'saving') {
      // Flush an in-flight autosave instead of making the user click Publish twice.
      await new Promise<void>((resolve) => {
        const unsubscribe = usePortfolioStore.subscribe((state) => {
          if (state.draftStatus !== 'saving') { clearTimeout(timer); unsubscribe(); resolve(); }
        });
        const timer = setTimeout(() => { unsubscribe(); resolve(); }, 10_000);
      });
    }
    if (get().draftOwnerId !== draftOwnerId || portfolioLoadVersion !== loadVersion) return false;
    if (get().draftOwnerId && !(await get().saveDraft())) {
      const message = get().draftMessage || 'Your private draft is still saving. Please try publishing again in a moment.';
      const toastState = useToastStore.getState();
      if (!toastState.toasts.some((toast) => toast.type === 'error' && toast.message === message)) toastState.toast(message, 'error');
      set({ isSaving: false });
      return false;
    }
    const draftRevision = get().draftRevision;
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          isPublicOnSearch,
          draftRevision,
          content: {
            theme,
            layout,
            sections,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }
      const result = await response.json();
      if (get().draftOwnerId !== draftOwnerId || portfolioLoadVersion !== loadVersion) return false;
      const publishedSnapshot = { username, theme, layout, sections };
      const latest = draftSnapshot(get());
      if (draftOwnerId && typeof result.draftRevision === 'number' && draftFingerprint(latest) !== draftFingerprint(publishedSnapshot)) writeLocalDraft(draftOwnerId, latest, result.draftRevision);
      set({ savedSections: JSON.parse(JSON.stringify(sections)), lastDraftSnapshot: draftFingerprint(publishedSnapshot), ...(typeof result.draftRevision === 'number' ? { draftRevision: result.draftRevision } : {}) });
      useToastStore.getState().toast("Portfolio saved successfully!", "success");
      return true;
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast(error.message || "Error saving portfolio", "error");
      return false;
    } finally {
      if (get().draftOwnerId === draftOwnerId && portfolioLoadVersion === loadVersion) set({ isSaving: false });
    }
  },

  updateBlockData: (id, newData) => set((state) => ({
    sections: state.sections.map((block) =>
      block.id === id 
        ? { ...block, content: { ...block.content, ...newData } } 
        : { ...block }
    ),
  })),

  removeBlock: (id) => set((state) => {
    const blockToRemove = state.sections.find((s) => s.id === id);
    if (blockToRemove?.type === "HERO") {
      return {};
    }
    return {
      sections: state.sections.filter((s) => s.id !== id),
    };
  }),

  moveBlock: (id, direction) => set((state) => {
    const index = state.sections.findIndex((s) => s.id === id);
    if (index === -1) return {};

    const block = state.sections[index];
    if (block.type === "HERO" || block.type === "CONTACT_FORM") return {};

    const newSections = [...state.sections];
    if (direction === 'up') {
      if (index === 0) return {};
      if (index === 1 && newSections[0].type === "HERO") return {};

      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down') {
      if (index >= newSections.length - 1) return {};
      if (newSections[index + 1].type === "CONTACT_FORM") return {};

      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    return { sections: newSections };
  }),

  reorderBlocks: (activeId, overId) => set((state) => {
    if (activeId === overId) return {};

    const oldIndex = state.sections.findIndex((s) => s.id === activeId);
    const newIndex = state.sections.findIndex((s) => s.id === overId);
    if (oldIndex === -1 || newIndex === -1) return {};

    const block = state.sections[oldIndex];
    if (block.type === "HERO" || block.type === "CONTACT_FORM") return {};

    const newSections = [...state.sections];
    newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, block);
    return { sections: newSections };
  }),

  toggleBlockVisibility: (id) => set((state) => ({
    sections: state.sections.map((block) =>
      block.id === id ? { ...block, isVisible: !block.isVisible } : block
    ),
  })),
}));
