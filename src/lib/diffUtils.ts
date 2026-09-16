import { Section } from "@/lib/validations/portfolio";

export type ItemDiffStatus = "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";

export interface ItemDiff {
  id: string;
  type: "skill" | "project" | "experience" | "education" | "testimonial" | "field";
  title: string;
  status: ItemDiffStatus;
  originalItem?: any;
  proposedItem?: any;
  changes?: { field: string; oldValue: any; newValue: any }[];
}

export interface BlockDiff {
  blockId: string;
  type: string;
  title: string;
  status: ItemDiffStatus;
  items: ItemDiff[];
  originalSection?: Section;
  proposedSection?: Section;
}

export function getItemDiffsForSection(origContent: any = {}, proposedContent: any = {}): ItemDiff[] {
  const itemDiffs: ItemDiff[] = [];

  // 1. Text Field Comparisons (Hero & Contact Form)
  ['fullName', 'bio', 'github', 'linkedin', 'twitter', 'instagram', 'emailTarget'].forEach((field) => {
    const origVal = origContent[field];
    const propVal = proposedContent[field];

    if (origVal !== undefined || propVal !== undefined) {
      if (!origVal && propVal) {
        itemDiffs.push({
          id: field,
          type: 'field',
          title: field,
          status: 'ADDED',
          proposedItem: propVal,
        });
      } else if (origVal && !propVal) {
        itemDiffs.push({
          id: field,
          type: 'field',
          title: field,
          status: 'REMOVED',
          originalItem: origVal,
        });
      } else if (origVal !== propVal) {
        itemDiffs.push({
          id: field,
          type: 'field',
          title: field,
          status: 'MODIFIED',
          originalItem: origVal,
          proposedItem: propVal,
          changes: [{ field, oldValue: origVal, newValue: propVal }],
        });
      }
    }
  });

  // 2. Array-based Items (Skills, Projects, Experience, Education, Testimonials)
  if (Array.isArray(origContent.items) || Array.isArray(proposedContent.items)) {
    const origItems: any[] = Array.isArray(origContent.items) ? origContent.items : [];
    const propItems: any[] = Array.isArray(proposedContent.items) ? proposedContent.items : [];

    // String items (e.g., Skills)
    if (typeof origItems[0] === 'string' || typeof propItems[0] === 'string') {
      const processedProp = new Set<string>();

      origItems.forEach((skill) => {
        if (propItems.includes(skill)) {
          processedProp.add(skill);
          itemDiffs.push({
            id: skill,
            type: 'skill',
            title: skill,
            status: 'UNCHANGED',
            originalItem: skill,
            proposedItem: skill,
          });
        } else {
          itemDiffs.push({
            id: skill,
            type: 'skill',
            title: skill,
            status: 'REMOVED',
            originalItem: skill,
          });
        }
      });

      propItems.forEach((skill) => {
        if (!processedProp.has(skill)) {
          itemDiffs.push({
            id: skill,
            type: 'skill',
            title: skill,
            status: 'ADDED',
            proposedItem: skill,
          });
        }
      });
    } else {
      // Object items (Projects, Experience, Education, Testimonials)
      const getItemKey = (item: any) => item.id || item.title || item.company || item.school || item.author;
      const getItemTitle = (item: any) => item.title || item.company || item.school || item.author || 'Item';
      const processedPropKeys = new Set<string>();

      origItems.forEach((orig) => {
        const key = getItemKey(orig);
        const prop = propItems.find((p) => getItemKey(p) && getItemKey(p) === key);

        if (!prop) {
          itemDiffs.push({
            id: key,
            type: 'project',
            title: getItemTitle(orig),
            status: 'REMOVED',
            originalItem: orig,
          });
        } else {
          processedPropKeys.add(getItemKey(prop));
          const fieldChanges: { field: string; oldValue: any; newValue: any }[] = [];

          // Compare object fields
          Object.keys({ ...orig, ...prop }).forEach((f) => {
            if (f !== 'id' && f !== 'isVisible' && orig[f] !== prop[f]) {
              fieldChanges.push({ field: f, oldValue: orig[f] || '', newValue: prop[f] || '' });
            }
          });

          if (fieldChanges.length > 0) {
            itemDiffs.push({
              id: key,
              type: 'project',
              title: getItemTitle(prop),
              status: 'MODIFIED',
              originalItem: orig,
              proposedItem: prop,
              changes: fieldChanges,
            });
          } else {
            itemDiffs.push({
              id: key,
              type: 'project',
              title: getItemTitle(prop),
              status: 'UNCHANGED',
              originalItem: orig,
              proposedItem: prop,
            });
          }
        }
      });

      propItems.forEach((prop) => {
        const key = getItemKey(prop);
        if (!processedPropKeys.has(key)) {
          itemDiffs.push({
            id: key,
            type: 'project',
            title: getItemTitle(prop),
            status: 'ADDED',
            proposedItem: prop,
          });
        }
      });
    }
  }

  return itemDiffs;
}

export function calculatePortfolioDiff(
  originalSections: Section[],
  proposedSections: Section[]
): BlockDiff[] {
  const diffs: BlockDiff[] = [];
  const processedProposedIds = new Set<string>();

  for (const orig of originalSections) {
    const proposed = proposedSections.find(
      (p) => p.type === orig.type || p.id === orig.id
    );

    if (!proposed) {
      const items = getItemDiffsForSection(orig.content, {});
      diffs.push({
        blockId: orig.id,
        type: orig.type,
        title: orig.title,
        status: 'REMOVED',
        items,
        originalSection: orig,
      });
    } else {
      processedProposedIds.add(proposed.id);
      const items = getItemDiffsForSection(orig.content, proposed.content);
      const hasChanges = items.some((i) => i.status !== 'UNCHANGED') || orig.title !== proposed.title;

      diffs.push({
        blockId: orig.id,
        type: orig.type,
        title: orig.title,
        status: hasChanges ? 'MODIFIED' : 'UNCHANGED',
        items,
        originalSection: orig,
        proposedSection: proposed,
      });
    }
  }

  for (const proposed of proposedSections) {
    if (!processedProposedIds.has(proposed.id)) {
      const items = getItemDiffsForSection({}, proposed.content);
      diffs.push({
        blockId: proposed.id,
        type: proposed.type,
        title: proposed.title,
        status: 'ADDED',
        items,
        proposedSection: proposed,
      });
    }
  }

  return diffs;
}