'use client';

import React from 'react';
import { Section } from '@/lib/validations/portfolio';
import { PortfolioRenderer } from '@/components/portfolio/Renderer';
import { calculatePortfolioDiff, ItemDiff, BlockDecision } from '@/lib/diffUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Wand2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  originalSections: Section[];
  proposedSections: Section[];
  theme: string;
  layout: string;
  diffDecisions?: Record<string, BlockDecision>;
  onSetDecision?: (blockId: string, decision: BlockDecision) => void;
  onAcceptBlock: (blockId: string) => void;
  onRejectBlock: (blockId: string) => void;
  onAcceptAll: () => void;
  onDiscardAll: () => void;
  onApplyChanges?: () => void;
}

export function DiffViewer({
  originalSections,
  proposedSections,
  theme,
  layout,
  diffDecisions = {},
  onSetDecision,
  onAcceptBlock,
  onRejectBlock,
  onAcceptAll,
  onDiscardAll,
  onApplyChanges,
}: DiffViewerProps) {
  const diffs = calculatePortfolioDiff(originalSections, proposedSections);
  const modifiedDiffs = diffs.filter((d) => d.status !== 'UNCHANGED');
  const totalChanges = modifiedDiffs.length;
  const acceptedCount = modifiedDiffs.filter((d) => diffDecisions[d.blockId] === 'accepted').length;
  const rejectedCount = modifiedDiffs.filter((d) => diffDecisions[d.blockId] === 'rejected').length;
  const pendingCount = totalChanges - acceptedCount - rejectedCount;

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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-zinc-100">Selective Diff & Review Mode</h3>
              <Badge variant="secondary" className="bg-violet-950 text-violet-300 border-violet-800 text-xs px-2.5 py-0.5">
                {totalChanges} Total {totalChanges === 1 ? 'Change' : 'Changes'}
              </Badge>
              {acceptedCount > 0 && (
                <Badge className="bg-emerald-950/80 text-emerald-300 border-emerald-800 text-xs px-2.5 py-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> {acceptedCount} Accepted
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs px-2.5 py-0.5 flex items-center gap-1">
                  <X className="w-3 h-3 text-zinc-400" /> {rejectedCount} Kept Original
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge className="bg-amber-950/80 text-amber-300 border-amber-800 text-xs px-2.5 py-0.5">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review each block below: accept or keep original, switch decisions anytime, and apply when ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscardAll}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full text-xs px-3.5 h-9 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            Discard All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAcceptAll}
            className="border-violet-700/60 bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 hover:text-white rounded-full text-xs px-4 h-9 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
            Accept All Changes
          </Button>
          {onApplyChanges && (
            <Button
              size="sm"
              onClick={onApplyChanges}
              className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/30 rounded-full text-xs px-5 h-9 font-semibold cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Apply Changes {acceptedCount > 0 ? `(${acceptedCount})` : ''}
            </Button>
          )}
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
              const decision = diffDecisions[diff.blockId] || 'pending';
              const isAccepted = decision === 'accepted';
              const isRejected = decision === 'rejected';
              const isPending = decision === 'pending';

              return (
                <div
                  key={diff.blockId}
                  className={cn(
                    "relative rounded-2xl border p-4 space-y-4 shadow-xl transition-all duration-200",
                    isAccepted
                      ? "border-emerald-500/50 bg-emerald-950/10 ring-1 ring-emerald-500/30 shadow-emerald-950/20"
                      : isRejected
                      ? "border-zinc-800/80 bg-zinc-900/20 opacity-80"
                      : "border-zinc-800 bg-zinc-900/30"
                  )}
                >
                  {/* Block Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-zinc-100">{diff.title}</span>
                      {isBlockModified ? (
                        <div className="flex items-center gap-1.5">
                          {isAccepted && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-[11px] px-2.5 py-0.5 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Accepted
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[11px] px-2.5 py-0.5 font-medium flex items-center gap-1">
                              <X className="w-3 h-3 text-zinc-400" />
                              Keeping Original
                            </Badge>
                          )}
                          {isPending && (
                            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[11px] px-2 py-0.5">
                              Contains Changes
                            </Badge>
                          )}
                        </div>
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
                          variant="outline"
                          onClick={() => {
                            if (onSetDecision) onSetDecision(diff.blockId, 'rejected');
                            else onRejectBlock(diff.blockId);
                          }}
                          className={cn(
                            "h-7 px-2.5 text-xs rounded-lg transition-all cursor-pointer border flex items-center gap-1",
                            isRejected
                              ? "bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm font-semibold ring-1 ring-zinc-500/30"
                              : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                          )}
                          title="Keep original version (reject changes)"
                        >
                          <X className="w-3 h-3 text-zinc-400" />
                          <span>{isRejected ? "Kept Original" : "Keep Original"}</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            if (onSetDecision) onSetDecision(diff.blockId, 'accepted');
                            else onAcceptBlock(diff.blockId);
                          }}
                          className={cn(
                            "h-7 px-3 text-xs rounded-lg transition-all cursor-pointer border flex items-center gap-1",
                            isAccepted
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30 font-semibold ring-1 ring-emerald-400/40"
                              : "border-emerald-600/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300"
                          )}
                          title="Accept proposed changes"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isAccepted ? "Accepted" : "Accept Change"}</span>
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
