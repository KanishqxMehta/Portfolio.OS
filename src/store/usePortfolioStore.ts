import { create } from 'zustand';

interface PortfolioState {
  sections: any[];
  username: string;
  isSaving: boolean;
  isLoading: boolean;
  setUsername: (username: string) => void;
  setSections: (sections: any[]) => void;
  addBlock: (type: string, title: string) => void;
  savePortfolio: () => Promise<void>;
  loadPortfolio: () => Promise<void>;
  removeBlock: (id: string) => void;
  updateBlockData: (id: string, newData: any) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  sections: [],
  username: "",
  theme: "classic",
  isSaving: false,
  isLoading: false,

  setTheme: (theme) => set({ theme }),

  setUsername: (username) => {
    const slugified = username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    set({ username: slugified });
  },

  setSections: (sections) => set({ sections }),

  addBlock: (type, title) => set((state) => {
    if (state.sections.some((s) => s.type === type)) {
      return {};
    }

    const newBlock = {
      id: crypto.randomUUID(),
      type,
      title,
      content: {},
      isVisible: true,
    };

    let newSections;
    if (type === "HERO") {
      newSections = [newBlock, ...state.sections];
    } else {
      newSections = [...state.sections, newBlock];
    }

    return { sections: newSections };
  }),

  loadPortfolio: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/portfolios');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const content = data.content || {};
      set({
        sections: content.sections || [],
        theme: content.theme || "classic",
        username: data.publicSlug || '',
      });
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  savePortfolio: async () => {
    const { sections, username, theme } = get();
    if (!username) return alert("Please set a username first!");

    set({ isSaving: true });
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          content: {
            theme,
            sections,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save");
      }
      alert("Portfolio saved successfully!");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error saving portfolio");
    } finally {
      set({ isSaving: false });
    }
  },

  updateBlockData: (id, newData) => set((state) => ({
    sections: state.sections.map((block) =>
      block.id === id ? { ...block, content: { ...block.content, ...newData } } : block
    ),
  })),

  removeBlock: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id),
  })),

  moveBlock: (id, direction) => set((state) => {
    const index = state.sections.findIndex((s) => s.id === id);
    if (index === -1) return {};

    const block = state.sections[index];
    if (block.type === "HERO") return {};

    const newSections = [...state.sections];
    if (direction === 'up') {
      if (index === 0) return {};
      if (index === 1 && newSections[0].type === "HERO") return {};

      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down') {
      if (index >= newSections.length - 1) return {};

      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    return { sections: newSections };
  }),
}));
