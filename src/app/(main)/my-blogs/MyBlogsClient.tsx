'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, PenTool, Trash2, Search, Loader2,
  FileText, Plus, CheckSquare, Square, X, ExternalLink, Clock
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  readTime: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

export default function MyBlogsClient() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Edit dialog
  const [editBlog, setEditBlog] = useState<BlogItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editStatus, setEditStatus] = useState('published');
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk delete dialog
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/blogs?mine=true&limit=50');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchBlogs();
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, fetchBlogs, router]);

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openEditDialog = (blog: BlogItem) => {
    setEditBlog(blog);
    setEditTitle(blog.title);
    setEditContent(''); // Content is not included in list API
    setEditExcerpt(blog.excerpt);
    setEditTags(blog.tags.join(', '));
    setEditStatus(blog.status);
  };

  const handleEditSave = async () => {
    if (!editBlog) return;
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setEditLoading(true);
    try {
      const body: any = {
        title: editTitle.trim(),
        excerpt: editExcerpt.trim(),
        status: editStatus,
      };
      if (editTags.trim()) {
        body.tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      }
      if (editContent.trim()) {
        body.content = editContent.trim();
      }
      const res = await fetch(`/api/blogs/${editBlog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success('Blog updated!');
        setEditBlog(null);
        fetchBlogs();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to update blog');
      }
    } catch {
      toast.error('Failed to update blog');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted');
        setBlogs(prev => prev.filter(b => b.id !== blogId));
        setSelectedIds(prev => { const next = new Set(prev); next.delete(blogId); return next; });
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

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      let failed = 0;
      for (const id of selectedIds) {
        const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
        if (!res.ok) failed++;
      }
      if (failed > 0) {
        toast.error(`Deleted ${selectedIds.size - failed} blogs, ${failed} failed`);
      } else {
        toast.success(`${selectedIds.size} blogs deleted`);
      }
      setBlogs(prev => prev.filter(b => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
      setBulkMode(false);
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkDeleteLoading(false);
      setBulkDeleteOpen(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredBlogs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBlogs.map(b => b.id)));
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

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Blogs</h1>
          <p className="text-xs text-muted-foreground">{blogs.length} article{blogs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={bulkMode ? 'default' : 'outline'}
            onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            className="text-xs h-8"
          >
            {bulkMode ? <X size={14} className="mr-1" /> : <CheckSquare size={14} className="mr-1" />}
            {bulkMode ? 'Cancel' : 'Select'}
          </Button>
          <Button size="sm" className="gradient-blue text-xs h-8" onClick={() => router.push('/blog?write=true')}>
            <Plus size={14} className="mr-1" /> New Blog
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your blogs..."
            className="bg-accent border-border text-foreground pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'published', 'draft'] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className="text-xs h-9 capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <GlassCard className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={selectAll} className="text-xs h-7">
              {selectedIds.size === filteredBlogs.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBulkDeleteOpen(true)}
            className="text-xs h-7"
            disabled={bulkDeleteLoading}
          >
            <Trash2 size={12} className="mr-1" /> Delete Selected
          </Button>
        </GlassCard>
      )}

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {blogs.length === 0 ? 'You haven\'t written any blogs yet' : 'No blogs match your search'}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            {blogs.length === 0 ? 'Share your knowledge and experiences with the community' : 'Try adjusting your filters'}
          </p>
          {blogs.length === 0 && (
            <Button size="sm" className="gradient-blue mt-4 text-xs" onClick={() => router.push('/blog?write=true')}>
              <Plus size={14} className="mr-1" /> Write Your First Blog
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredBlogs.map(blog => (
            <GlassCard key={blog.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Checkbox (bulk mode) */}
                {bulkMode && (
                  <button onClick={() => toggleSelect(blog.id)} className="mt-1 shrink-0 text-muted-foreground hover:text-foreground">
                    {selectedIds.has(blog.id) ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} />}
                  </button>
                )}

                {/* Blog Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(blog.status)}
                    {blog.featured && <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-[10px]">Featured</Badge>}
                  </div>
                  <h3
                    className="text-sm font-semibold text-foreground cursor-pointer hover:text-blue-300 transition-colors line-clamp-1"
                    onClick={() => router.push(`/blog/${blog.slug || blog.id}`)}
                  >
                    {blog.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">{blog.excerpt}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                    <span className="flex items-center gap-1"><Clock size={10} />{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{blog.readTime} min read</span>
                    <span className="flex items-center gap-1"><Heart size={10} />{blog.stats.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={10} />{blog.stats.comments}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400"
                    onClick={() => router.push(`/blog/${blog.slug || blog.id}`)}
                    title="View"
                  >
                    <ExternalLink size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-cyan-400"
                    onClick={() => openEditDialog(blog)}
                    title="Edit"
                  >
                    <PenTool size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                    onClick={() => setDeleteBlogId(blog.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editBlog} onOpenChange={(open) => { if (!open) setEditBlog(null); }}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Blog</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="bg-accent border-border text-foreground mt-1"
                placeholder="Blog title"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Excerpt</label>
              <Textarea
                value={editExcerpt}
                onChange={e => setEditExcerpt(e.target.value)}
                className="bg-accent border-border text-foreground mt-1 min-h-[60px] resize-none"
                placeholder="Brief summary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Content (leave empty to keep existing)</label>
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="bg-accent border-border text-foreground mt-1 min-h-[120px] resize-none"
                placeholder="Updated blog content..."
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
              <Input
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                className="bg-accent border-border text-foreground mt-1"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <div className="flex gap-2 mt-1">
                {(['published', 'draft'] as const).map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={editStatus === s ? 'default' : 'outline'}
                    onClick={() => setEditStatus(s)}
                    className="text-xs capitalize"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBlog(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editLoading} className="gradient-blue">
              {editLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBlogId} onOpenChange={(open) => { if (!open) setDeleteBlogId(null); }}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Blog</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this blog? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBlogId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteBlogId && handleDelete(deleteBlogId)} disabled={deleteLoading}>
              {deleteLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete {selectedIds.size} Blog{selectedIds.size !== 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete {selectedIds.size} selected blog{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
              {bulkDeleteLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
