import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

interface Block {
  id: string;
  type: string;
  title: string;
  data: any;
}

interface PortfolioState {
  sections: any[];
  username: string;
  isSaving: boolean;
  setUsername: (username: string) => void;
  addBlock: (type: string, title: string) => void;
  savePortfolio: () => Promise<void>;
  removeBlock: (id: string) => void;
  updateBlockData: (id: string, newData: any) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  reorderBlocks?: (startIndex: number, endIndex: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  sections: [],
  username: "",
  isSaving: false,

setUsername: (username) => {
    const slugified = username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric chars except hyphens
    set({ username: slugified });
  },
  addBlock: (type, title) => set((state) => ({
    sections: [...state.sections, { 
      id: uuidv4(), 
      type, 
      title, 
      content: {}, 
      isVisible: true 
    }]
  })),

  savePortfolio: async () => {
    const { sections, username } = get();
    if (!username) return alert("Please set a username first!");

    set({ isSaving: true });
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          content: {
            theme: 'classic',
            sections
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to save");
      alert("Portfolio saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving portfolio");
    } finally {
      set({ isSaving: false });
    }
  },
  updateBlockData: (id, newData) => set((state) => ({
    sections: state.sections.map((block) => 
      block.id === id ? { ...block, content: { ...block.content, ...newData } } : block
    )
  })),

  // Add these to your store definition
  removeBlock: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id)
  })),

  moveBlock: (id, direction) => set((state) => {
    const index = state.sections.findIndex((s) => s.id === id);
    const newSections = [...state.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    return { sections: newSections };
  }),
}));