'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/star-rating';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface FeedbackItem {
  id: string;
  rating: number;
  category: string | null;
  message: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null; email: string };
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [ratingFilter, setRatingFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (ratingFilter) params.set('rating', ratingFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/admin/feedback?${params}`);
      if (!res.ok) throw new Error('Failed to fetch feedback');
      const data = await res.json();
      setFeedbacks(data.feedbacks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setRatingDist(data.ratingDistribution);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter, categoryFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const chartData = Object.entries(ratingDist).map(([rating, count]) => ({
    rating: `${rating} ⭐`,
    count,
    fill: parseInt(rating) >= 4 ? '#22C55E' : parseInt(rating) >= 3 ? '#F59E0B' : '#EF4444',
  }));

  const categories = ['bug', 'feature', 'ui', 'performance', 'other'];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback Management</h1>
            <p className="text-sm text-muted-foreground mt-1">{total} total feedback entries</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFeedback} className="gap-2 w-fit">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Rating Distribution Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Rating Distribution</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <rect key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button
                variant={ratingFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setRatingFilter(''); setPage(1); }}
                className="text-xs"
              >
                All Ratings
              </Button>
              {[5, 4, 3, 2, 1].map((r) => (
                <Button
                  key={r}
                  variant={ratingFilter === String(r) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setRatingFilter(String(r)); setPage(1); }}
                  className="text-xs gap-1"
                >
                  {r} <Star size={10} />
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setCategoryFilter(''); setPage(1); }}
                className="text-xs"
              >
                All Categories
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant={categoryFilter === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setCategoryFilter(c); setPage(1); }}
                  className="text-xs capitalize"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Feedback Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-4 py-3"><div className="h-8 bg-accent rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No feedback found</td>
                  </tr>
                ) : (
                  feedbacks.map((fb) => (
                    <motion.tr
                      key={fb.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={fb.user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                              {fb.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-foreground/80">{fb.user.name}</p>
                            <p className="text-xs text-muted-foreground/60">{fb.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {fb.category && <Badge variant="outline" className="text-xs capitalize">{fb.category}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[300px] truncate">{fb.message}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(fb.createdAt).toLocaleDateString()}
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
