'use client';

import React from 'react';
import { Section } from '@/lib/validations/portfolio';
import { PortfolioRenderer } from '@/components/portfolio/Renderer';
import { calculatePortfolioDiff, ItemDiff } from '@/lib/diffUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Wand2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  originalSections: Section[];
  proposedSections: Section[];
  theme: string;
  layout: string;
  onAcceptBlock: (blockId: string) => void;
  onRejectBlock: (blockId: string) => void;
  onAcceptAll: () => void;
  onDiscardAll: () => void;
}

export function DiffViewer({
  originalSections,
  proposedSections,
  theme,
  layout,
  onAcceptBlock,
  onRejectBlock,
  onAcceptAll,
  onDiscardAll,
}: DiffViewerProps) {
  const diffs = calculatePortfolioDiff(originalSections, proposedSections);
  const totalChanges = diffs.filter((d) => d.status !== 'UNCHANGED').length;

  const getItemBorderClass = (status: ItemDiff['status']) => {
    switch (status) {
      case 'ADDED':
        return 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50 shadow-emerald-500/10';
      case 'MODIFIED':
        return 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50 shadow-amber-500/10';
      case 'REMOVED':
        return 'border-rose-500 bg-rose-950/30 opacity-75 ring-1 ring-rose-500/50 shadow-rose-500/10';
      default:
        return 'border-zinc-800 bg-zinc-900/20';
    }
  };

  const getSkillBadgeClass = (status: ItemDiff['status']) => {
    switch (status) {
      case 'ADDED':
        return 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-500/40 font-bold';
      case 'REMOVED':
        return 'border-rose-500/80 bg-rose-950/60 text-rose-300 line-through opacity-75 ring-2 ring-rose-500/40 font-bold';
      default:
        return 'border-zinc-800 bg-zinc-900 text-zinc-400';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-inner">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-base text-zinc-100">Selective Diff & Review Mode</h3>
              <Badge variant="secondary" className="bg-violet-950 text-violet-300 border-violet-800 text-xs px-2.5 py-0.5">
                {totalChanges} Pending {totalChanges === 1 ? 'Change' : 'Changes'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Items with green borders are Added, yellow/amber are Modified, and red are Removed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscardAll}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full text-xs px-4 h-9"
          >
            <X className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            Discard All
          </Button>
          <Button
            size="sm"
            onClick={onAcceptAll}
            className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/30 rounded-full text-xs px-5 h-9 font-semibold"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Accept All Changes
          </Button>
        </div>
      </div>

      {/* Main Dual View Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
        {/* Left Column: Original Live Version */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/70">
          <div className="px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Current Live Version
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6" data-lenis-prevent>
            <div className="rounded-2xl border border-zinc-800 bg-black/40 overflow-hidden shadow-2xl p-2 sm:p-4 min-w-[320px]">
              <PortfolioRenderer sections={originalSections} theme={theme} layout={layout} />
            </div>
          </div>
        </div>

        {/* Right Column: Proposed Version with Per-Item Granular Borders */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/90">
          <div className="px-5 py-3 bg-violet-950/30 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Proposed Version (Item Diff)
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6" data-lenis-prevent>
            {diffs.map((diff) => {
              const isBlockModified = diff.status !== 'UNCHANGED';

              return (
                <div
                  key={diff.blockId}
                  className="relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4 shadow-xl"
                >
                  {/* Block Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-zinc-100">{diff.title}</span>
                      {isBlockModified ? (
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[11px] px-2 py-0.5">
                          Contains Changes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-zinc-800 text-zinc-500 text-[10px]">
                          Unchanged
                        </Badge>
                      )}
                    </div>

                    {isBlockModified && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRejectBlock(diff.blockId)}
                          className="h-7 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                        >
                          Keep Original
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAcceptBlock(diff.blockId)}
                          className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md font-medium"
                        >
                          Accept Block
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Skills Granular View */}
                  {diff.type === 'SKILLS' ? (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-zinc-800 bg-black/50">
                      {diff.items.map((item) => (
                        <span
                          key={item.id}
                          className={cn(
                            'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5',
                            getSkillBadgeClass(item.status)
                          )}
                        >
                          {item.status === 'ADDED' && <span className="text-emerald-400 font-bold">+</span>}
                          {item.status === 'REMOVED' && <span className="text-rose-400 font-bold">-</span>}
                          {item.title}
                        </span>
                      ))}
                    </div>
                  ) : diff.items && diff.items.length > 0 ? (
                    /* Cards Granular View (Projects, Experience, Education, Testimonials, Hero) */
                    <div className="space-y-3">
                      {diff.items.map((item) => {
                        const itemSection: Section = {
                          id: item.id,
                          type: diff.type as any,
                          title: diff.title,
                          isVisible: true,
                          content:
                            item.type === 'field'
                              ? { fullName: '', [item.id]: item.proposedItem || item.originalItem }
                              : ({ items: [item.proposedItem || item.originalItem] } as any),
                        };

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'rounded-xl border-2 p-3 space-y-2 transition-all shadow-md',
                              getItemBorderClass(item.status)
                            )}
                          >
                            <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-1.5">
                              <span className="font-bold text-zinc-200">{item.title}</span>
                              {item.status === 'ADDED' && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                                  + Added Item
                                </Badge>
                              )}
                              {item.status === 'MODIFIED' && (
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]">
                                  ~ Modified Item
                                </Badge>
                              )}
                              {item.status === 'REMOVED' && (
                                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-[10px]">
                                  - Removed Item
                                </Badge>
                              )}
                            </div>

                            {/* Item Field Modifications Breakdown */}
                            {item.changes && item.changes.length > 0 && (
                              <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-[11px] font-mono space-y-1">
                                {item.changes.map((c, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-zinc-300 flex-wrap">
                                    <span className="text-amber-400 font-semibold">[{c.field}]:</span>
                                    <span className="line-through text-rose-400/80 max-w-[150px] truncate">
                                      {String(c.oldValue)}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                                    <span className="text-emerald-400 font-medium max-w-[180px] truncate">
                                      {String(c.newValue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Rendered Item Card Preview */}
                            <div className="rounded-lg border border-zinc-800 bg-black/60 p-2 overflow-hidden">
                              <PortfolioRenderer sections={[itemSection]} theme={theme} layout={layout} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-black/60 p-3 overflow-hidden">
                      {diff.proposedSection ? (
                        <PortfolioRenderer sections={[diff.proposedSection]} theme={theme} layout={layout} />
                      ) : (
                        <PortfolioRenderer sections={[diff.originalSection!]} theme={theme} layout={layout} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
