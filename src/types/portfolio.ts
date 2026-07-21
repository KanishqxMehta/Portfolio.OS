interface PortfolioSection {
  id: string;
  type: 'HERO' | 'EXPERIENCE' | 'PROJECTS' | 'SKILLS' | 'CUSTOM_TEXT';
  title: string;
  content: any; // Type defined by the 'type' field
  isVisible: boolean;
}

export interface PortfolioContent {
  theme: string;
  layout?: string;
  sections: PortfolioSection[]; // Array of blocks
}