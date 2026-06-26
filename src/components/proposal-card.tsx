'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Loader2, ArrowRight, Plus, Pencil, Trash2,
  GitMerge, Archive, ArrowUpDown, Info,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ProposalData {
  id?: string;
  module: string;
  actionType: 'create' | 'edit' | 'delete' | 'reorder' | 'merge' | 'archive';
  entityType: string;
  entityId?: string;
  title: string;
  reason: string;
  beforeState?: Record<string, any>;
  afterState: Record<string, any>;
  expectedBenefit?: string;
  confidence: number;
}

const ACTION_META: Record<string, { icon: any; color: string; label: string }> = {
  create:    { icon: Plus,         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Create' },
  edit:      { icon: Pencil,       color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',         label: 'Edit' },
  delete:    { icon: Trash2,       color: 'text-red-400 bg-red-500/10 border-red-500/30',            label: 'Delete' },
  reorder:   { icon: ArrowUpDown,  color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',      label: 'Reorder' },
  merge:     { icon: GitMerge,     color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',   label: 'Merge' },
  archive:   { icon: Archive,      color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',         label: 'Archive' },
};

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function renderStateDiff(before: Record<string, any> | undefined, after: Record<string, any>): React.ReactNode {
  const allKeys = Array.from(new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ])).filter(k => k !== 'mergeTargetId'); // hide internal keys

  if (allKeys.length === 0) {
    return <p className="text-xs text-muted-foreground/70 italic">No state changes to display</p>;
  }

  return (
    <div className="space-y-1.5 mt-3">
      {allKeys.map(key => {
        const beforeVal = before?.[key];
        const afterVal = after?.[key];
        const changed = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

        return (
          <div key={key} className="grid grid-cols-[100px_auto_1fr] items-center gap-2 text-xs">
            <span className="text-muted-foreground/70 font-mono">{key}</span>
            {changed ? (
              <>
                <span className="text-red-400/80 line-through truncate font-mono">
                  {formatValue(beforeVal)}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <ArrowRight size={10} className="text-muted-foreground/50 shrink-0" />
                  <span className="text-emerald-400 truncate font-mono">
                    {formatValue(afterVal)}
                  </span>
                </div>
              </>
            ) : (
              <span className="col-span-2 text-foreground/70 truncate font-mono">
                {formatValue(afterVal)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ProposalCardProps {
  proposal: ProposalData;
  onApplied?: (proposalId: string) => void;
  onRejected?: (proposalId: string) => void;
}

export function ProposalCard({ proposal, onApplied, onRejected }: ProposalCardProps) {
  const [status, setStatus] = useState<'pending' | 'applying' | 'applied' | 'rejected' | 'failed'>('pending');
  const [message, setMessage] = useState<string | null>(null);

  const meta = ACTION_META[proposal.actionType] || ACTION_META.edit;
  const ActionIcon = meta.icon;
  const confidencePct = Math.round(proposal.confidence * 100);

  const handleApprove = async () => {
    if (!proposal.id) {
      toast.error('Proposal ID missing — cannot apply');
      return;
    }
    setStatus('applying');
    try {
      const res = await fetch(`/api/ai/proposals/${proposal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('applied');
        setMessage(data.message || 'Applied successfully');
        toast.success(data.message || 'Proposal applied');
        onApplied?.(proposal.id);
      } else {
        setStatus('failed');
        setMessage(data.error || 'Failed to apply');
        toast.error(data.error || 'Failed to apply proposal');
      }
    } catch (err) {
      setStatus('failed');
      setMessage('Network error');
      toast.error('Network error applying proposal');
    }
  };

  const handleReject = async () => {
    if (!proposal.id) {
      // No ID means it was never persisted — just remove from UI
      setStatus('rejected');
      onRejected?.('');
      return;
    }
    setStatus('applying');
    try {
      const res = await fetch(`/api/ai/proposals/${proposal.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStatus('rejected');
        toast.info('Proposal rejected');
        onRejected?.(proposal.id);
      } else {
        setStatus('failed');
        toast.error('Failed to reject proposal');
      }
    } catch (err) {
      setStatus('failed');
      toast.error('Network error rejecting proposal');
    }
  };

  if (status === 'applied') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3"
      >
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400 font-medium truncate">{message || 'Applied'}</p>
        </div>
      </motion.div>
    );
  }

  if (status === 'rejected') {
    return null; // Remove from UI
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        variant="default"
        className={cn(
          'p-4 border',
          status === 'failed' && 'border-red-500/40'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', meta.color)}>
            <ActionIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4', meta.color)}>
                {meta.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground/70">
                {proposal.entityType.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground/70">
                {confidencePct}% confidence
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">{proposal.title}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mt-3 pl-11">
          <div className="flex items-start gap-1.5">
            <Info size={12} className="text-muted-foreground/60 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-muted-foreground/80 font-medium">Why: </span>
              {proposal.reason}
            </p>
          </div>
          {proposal.expectedBenefit && (
            <p className="text-xs text-emerald-400/80 mt-1.5 leading-relaxed">
              <span className="font-medium">Benefit: </span>
              {proposal.expectedBenefit}
            </p>
          )}
        </div>

        {/* State diff */}
        <div className="mt-3 pl-11">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-semibold">
            {proposal.actionType === 'create' ? 'New Values' : 'Changes'}
          </p>
          <div className="rounded-lg bg-background/40 border border-border/50 p-2.5">
            {renderStateDiff(proposal.beforeState, proposal.afterState)}
          </div>
        </div>

        {/* Status / error message */}
        {status === 'failed' && message && (
          <p className="text-xs text-red-400 mt-2 pl-11">{message}</p>
        )}

        {/* Actions */}
        <div className="mt-3 pl-11 flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleApprove}
            disabled={status === 'applying'}
          >
            {status === 'applying' ? (
              <Loader2 size={12} className="animate-spin mr-1.5" />
            ) : (
              <Check size={12} className="mr-1.5" />
            )}
            Approve & Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleReject}
            disabled={status === 'applying'}
          >
            <X size={12} className="mr-1.5" />
            Reject
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Proposal List (renders multiple proposals together) ─────────────────────

interface ProposalListProps {
  proposals: ProposalData[];
  onAnyChange?: () => void;
}

export function ProposalList({ proposals, onAnyChange }: ProposalListProps) {
  if (proposals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 mt-3"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <span className="font-medium">Proposed actions</span>
        <span className="text-muted-foreground/50">·</span>
        <span>Review and approve each change below</span>
      </div>
      {proposals.map((p, i) => (
        <ProposalCard
          key={p.id || `proposal-${i}`}
          proposal={p}
          onApplied={() => onAnyChange?.()}
          onRejected={() => onAnyChange?.()}
        />
      ))}
    </motion.div>
  );
}
