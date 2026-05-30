'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  ScrollText,
  Clock,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  target: string | null;
  details: string | null;
  createdAt: string;
  admin: { id: string; name: string; email: string };
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit-log?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('ban') || action.includes('delete')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (action.includes('suspend')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    if (action.includes('verify') || action.includes('activate') || action.includes('promote')) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (action.includes('dismiss')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-muted-foreground bg-accent border-border';
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-sm text-muted-foreground mt-1">{total} total entries</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 w-fit">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Filter */}
        <GlassCard className="p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Filter by action type..."
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="pl-9 bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </GlassCard>

        {/* Log Entries */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-4 py-3"><div className="h-8 bg-accent rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <ScrollText size={32} className="mx-auto mb-2 opacity-30" />
                      No audit log entries found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground/80">{log.admin.name}</p>
                          <p className="text-xs text-muted-foreground/60">{log.admin.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs capitalize ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {log.target ? log.target.slice(0, 12) + '...' : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell max-w-[250px] truncate">
                        {log.details ? JSON.stringify(JSON.parse(log.details)).slice(0, 80) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock size={12} />
                          {formatTime(log.createdAt)}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}
