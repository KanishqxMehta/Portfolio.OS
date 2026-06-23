import { create } from 'zustand';
import { useToastStore } from './useToastStore';
import { Section, portfolioSchema } from '@/lib/validations/portfolio';

interface PortfolioState {
  sections: Section[];
  username: string;
  isSaving: boolean;
  isLoading: boolean;
  setUsername: (username: string) => void;
  setSections: (sections: Section[]) => void;
  addBlock: (type: string, title: string) => void;
  savePortfolio: () => Promise<boolean>;
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
  isLoading: true,

  setTheme: (theme) => set({ theme }),

  setUsername: (username) => {
    const slugified = username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    set({ username: slugified });
  },

  setSections: (sections) => set((state) => {
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

  loadPortfolio: async () => {
    set({ isLoading: true });
    const startTime = Date.now();
    try {
      const res = await fetch('/api/portfolios');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const content = data.content || {};
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
        theme: content.theme || "classic",
        username: data.publicSlug || '',
      });
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      set({ isLoading: false });
    }
  },

  savePortfolio: async () => {
    const { sections, username, theme } = get();
    if (!username) {
      useToastStore.getState().toast("Please set a username first!", "error");
      return false;
    }

    const validation = portfolioSchema.safeParse({
      username,
      content: { theme, sections }
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid fields in block";
      useToastStore.getState().toast(`Please fix error: ${errorMsg}`, "error");
      return false;
    }

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
      useToastStore.getState().toast("Portfolio saved successfully!", "success");
      return true;
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast(error.message || "Error saving portfolio", "error");
      return false;
    } finally {
      set({ isSaving: false });
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
}));
