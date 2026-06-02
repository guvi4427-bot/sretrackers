'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Star,
  Search,
  Loader2,
  Eye,
  Archive,
  Newspaper,
  Heart,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { SITE_URL } from '@/lib/site-config';

interface AdminBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Delete dialog
  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/blogs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleDelete = async () => {
    if (!deleteBlogId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${deleteBlogId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted');
        setBlogs(prev => prev.filter(b => b.id !== deleteBlogId));
      } else {
        toast.error('Failed to delete blog');
      }
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleteLoading(false);
      setDeleteBlogId(null);
    }
  };

  const handleUpdateStatus = async (blogId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, status }),
      });
      if (res.ok) {
        toast.success(`Blog status updated to ${status}`);
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status } : b));
      } else {
        toast.error('Failed to update blog status');
      }
    } catch {
      toast.error('Failed to update blog status');
    }
  };

  const handleToggleFeatured = async (blogId: string, featured: boolean) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, featured: !featured }),
      });
      if (res.ok) {
        toast.success(featured ? 'Removed from featured' : 'Added to featured');
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, featured: !featured } : b));
      } else {
        toast.error('Failed to update featured status');
      }
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-[10px]">Published</Badge>;
      case 'draft':
        return <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-[10px]">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30 text-[10px]">Archived</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total blogs</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBlogs} className="gap-2 w-fit">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search blogs by title or content..."
            className="bg-accent border-border text-foreground pl-9 h-9 text-sm"
          />
        </div>
        <Button size="sm" onClick={handleSearch} className="h-9">Search</Button>
        <div className="flex gap-1">
          {['', 'published', 'draft', 'archived'].map(s => (
            <Button
              key={s || 'all'}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className="text-xs h-9 capitalize"
            >
              {s || 'All'}
            </Button>
          ))}
        </div>
      </div>

      {/* Blog Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Blog</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stats</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={6} className="px-4 py-3"><div className="h-8 bg-accent rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No blogs found</td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <motion.tr
                    key={blog.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                          {blog.featured && <Star size={12} className="text-amber-400 shrink-0" fill="currentColor" />}
                        </div>
                        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{blog.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={blog.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                            {blog.user.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-foreground/80">{blog.user.name}</p>
                          <p className="text-[10px] text-muted-foreground/50">{blog.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                        <span className="flex items-center gap-0.5"><Heart size={10} />{blog.stats.likes}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle size={10} />{blog.stats.comments}</span>
                        <span className="flex items-center gap-0.5"><Bookmark size={10} />{blog.stats.bookmarks}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(`${SITE_URL}/blog/${blog.slug || blog.id}`, '_blank')}
                        >
                          <Eye size={12} className="mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-amber-400 hover:text-amber-300"
                          onClick={() => handleToggleFeatured(blog.id, blog.featured)}
                        >
                          <Star size={12} fill={blog.featured ? 'currentColor' : 'none'} />
                        </Button>
                        {blog.status !== 'archived' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-400 hover:text-gray-300"
                            onClick={() => handleUpdateStatus(blog.id, 'archived')}
                          >
                            <Archive size={12} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-400 hover:text-green-300"
                            onClick={() => handleUpdateStatus(blog.id, 'published')}
                          >
                            <ExternalLink size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-400 hover:text-red-300"
                          onClick={() => setDeleteBlogId(blog.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
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
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBlogId} onOpenChange={(open) => { if (!open) setDeleteBlogId(null); }}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Blog</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this blog? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBlogId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
