export type LayoutConfig = {
  id: string;
  name: string;
  description: string;
  iconName: string;
};

export const LAYOUTS: Record<string, LayoutConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Standard vertical stacked layout.",
    iconName: "AlignJustify",
  },
  bento: {
    id: "bento",
    name: "Bento Box",
    description: "Modular dashboard grid layout.",
    iconName: "LayoutGrid",
  },
  sidebar: {
    id: "sidebar",
    name: "Sidebar",
    description: "IDE-style sidebar navigation.",
    iconName: "PanelLeft",
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "Interactive command-line interface.",
    iconName: "TerminalSquare",
  },
};
