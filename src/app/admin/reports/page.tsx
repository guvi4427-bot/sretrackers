'use client';

import { useEffect, useState, useCallback } from 'react';

// Prevent static prerendering — admin pages require auth at runtime
export const dynamic = 'force-dynamic';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldBan,
  UserX,
  Star,
  Trash2,
  Archive,
  Heart,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { SITE_URL } from '@/lib/site-config';

interface ReportItem {
  id: string;
  category: string;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporter: { id: string; name: string; avatarUrl: string | null };
  reportedUser: { id: string; name: string; avatarUrl: string | null; email?: string; accessStatus?: string };
  post?: { id: string; content: string };
  comment?: { id: string; content: string };
}

interface AdminBlogItem {
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

export default function AdminReports() {
  const { toast } = useToast();
  const [tab, setTab] = useState('posts');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; report: ReportItem | null; action: string }>({
    open: false,
    report: null,
    action: '',
  });
  const [adminNote, setAdminNote] = useState('');
  const [userAction, setUserAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Blog tab state
  const [blogs, setBlogs] = useState<AdminBlogItem[]>([]);
  const [blogPage, setBlogPage] = useState(1);
  const [blogTotalPages, setBlogTotalPages] = useState(1);
  const [blogTotal, setBlogTotal] = useState(0);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [deleteBlogLoading, setDeleteBlogLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (tab === 'blogs') return; // handled by fetchBlogs
    setLoading(true);
    try {
      let endpoint: string;
      if (tab === 'posts') endpoint = '/api/admin/posts';
      else if (tab === 'comments') endpoint = '/api/admin/comments';
      else endpoint = '/api/admin/user-reports';

      const res = await fetch(`${endpoint}?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tab, page, toast]);

  const fetchBlogs = useCallback(async () => {
    if (tab !== 'blogs') return;
    setLoadingBlogs(true);
    try {
      const res = await fetch(`/api/admin/blogs?page=${blogPage}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
      setBlogTotal(data.total || 0);
      setBlogTotalPages(data.totalPages || 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to load blogs', variant: 'destructive' });
    } finally {
      setLoadingBlogs(false);
    }
  }, [tab, blogPage, toast]);

  useEffect(() => {
    setPage(1);
    setBlogPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === 'blogs') {
      fetchBlogs();
    } else {
      fetchReports();
    }
  }, [tab, page, blogPage, fetchReports, fetchBlogs]);

  const handleReview = async () => {
    if (!reviewDialog.report) return;
    setActionLoading(true);
    try {
      let endpoint: string;
      if (tab === 'posts') endpoint = '/api/admin/posts';
      else if (tab === 'comments') endpoint = '/api/admin/comments';
      else endpoint = '/api/admin/user-reports';

      const body: any = {
        reportId: reviewDialog.report.id,
        status: reviewDialog.action,
        adminNote,
      };
      if (tab === 'users' && reviewDialog.action === 'actioned' && userAction) {
        body.action = userAction;
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Action failed');
      toast({ title: 'Success', description: `Report ${reviewDialog.action}` });
      setReviewDialog({ open: false, report: null, action: '' });
      setAdminNote('');
      setUserAction('');
      fetchReports();
    } catch {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlogUpdateStatus = async (blogId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, status }),
      });
      if (res.ok) {
        sonnerToast.success(`Blog status updated to ${status}`);
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status } : b));
      } else {
        sonnerToast.error('Failed to update blog status');
      }
    } catch {
      sonnerToast.error('Failed to update blog status');
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
        sonnerToast.success(featured ? 'Removed from featured' : 'Added to featured');
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, featured: !featured } : b));
      } else {
        sonnerToast.error('Failed to update featured');
      }
    } catch {
      sonnerToast.error('Failed to update featured');
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteBlogId) return;
    setDeleteBlogLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${deleteBlogId}`, { method: 'DELETE' });
      if (res.ok) {
        sonnerToast.success('Blog deleted');
        setBlogs(prev => prev.filter(b => b.id !== deleteBlogId));
      } else {
        sonnerToast.error('Failed to delete blog');
      }
    } catch {
      sonnerToast.error('Failed to delete blog');
    } finally {
      setDeleteBlogLoading(false);
      setDeleteBlogId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      dismissed: { variant: 'default', label: 'Dismissed' },
      actioned: { variant: 'destructive', label: 'Actioned' },
    };
    const config = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBlogStatusBadge = (status: string) => {
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
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === 'blogs' ? `${blogTotal} total blogs` : `${total} total reports`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => tab === 'blogs' ? fetchBlogs() : fetchReports()} className="gap-2 w-fit">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5 border border-border">
            <TabsTrigger value="posts">Post Reports</TabsTrigger>
            <TabsTrigger value="comments">Comment Reports</TabsTrigger>
            <TabsTrigger value="users">User Reports</TabsTrigger>
            <TabsTrigger value="blogs">Blog Reports</TabsTrigger>
          </TabsList>

          {/* Reports tabs (posts, comments, users) */}
          {(tab === 'posts' || tab === 'comments' || tab === 'users') && (
            <TabsContent value={tab} className="mt-4">
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporter</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reported</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Reason</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b border-border">
                            <td colSpan={7} className="px-4 py-3"><div className="h-8 bg-accent rounded animate-pulse" /></td>
                          </tr>
                        ))
                      ) : reports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No reports found</td>
                        </tr>
                      ) : (
                        reports.map((report) => (
                          <motion.tr
                            key={report.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border hover:bg-accent/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={report.reporter.avatarUrl || undefined} />
                                  <AvatarFallback className="bg-blue-500/20 text-blue-400 text-[10px]">
                                    {report.reporter.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-foreground/80">{report.reporter.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={report.reportedUser.avatarUrl || undefined} />
                                  <AvatarFallback className="bg-red-500/20 text-red-400 text-[10px]">
                                    {report.reportedUser.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-sm text-foreground/80">{report.reportedUser.name}</span>
                                  {tab === 'users' && report.reportedUser.email && (
                                    <p className="text-[10px] text-muted-foreground/60">{report.reportedUser.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">{report.category}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                              {report.reason}
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {report.status === 'pending' ? (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-green-400 hover:text-green-300"
                                    onClick={() => { setReviewDialog({ open: true, report, action: 'dismissed' }); setUserAction(''); }}
                                  >
                                    <XCircle size={12} className="mr-1" /> Dismiss
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-red-400 hover:text-red-300"
                                    onClick={() => { setReviewDialog({ open: true, report, action: 'actioned' }); setUserAction(''); }}
                                  >
                                    <AlertTriangle size={12} className="mr-1" /> Action
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setReviewDialog({ open: true, report, action: '' })}
                                >
                                  <Eye size={12} className="mr-1" /> View
                                </Button>
                              )}
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
            </TabsContent>
          )}

          {/* Blog Reports Tab */}
          <TabsContent value="blogs" className="mt-4">
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
                    {loadingBlogs ? (
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
                          <td className="px-4 py-3">{getBlogStatusBadge(blog.status)}</td>
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
                                  onClick={() => handleBlogUpdateStatus(blog.id, 'archived')}
                                  title="Archive"
                                >
                                  <Archive size={12} />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-green-400 hover:text-green-300"
                                  onClick={() => handleBlogUpdateStatus(blog.id, 'published')}
                                  title="Restore"
                                >
                                  <Eye size={12} />
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

              {blogTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Page {blogPage} of {blogTotalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={blogPage <= 1} onClick={() => setBlogPage(p => p - 1)}>
                      <ChevronLeft size={14} />
                    </Button>
                    <Button variant="outline" size="sm" disabled={blogPage >= blogTotalPages} onClick={() => setBlogPage(p => p + 1)}>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog((prev) => ({ ...prev, open }))}>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {reviewDialog.action === 'dismissed' && 'Dismiss Report'}
                {reviewDialog.action === 'actioned' && 'Take Action on Report'}
                {reviewDialog.action === '' && 'Report Details'}
              </DialogTitle>
            </DialogHeader>
            {reviewDialog.report && (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-lg bg-accent space-y-2">
                  <p className="text-xs text-muted-foreground">Category: <span className="text-foreground/70">{reviewDialog.report.category}</span></p>
                  <p className="text-xs text-muted-foreground">Reason: <span className="text-foreground/70">{reviewDialog.report.reason}</span></p>
                  {reviewDialog.report.post && (
                    <div className="mt-2 p-2 rounded bg-accent/50">
                      <p className="text-xs text-muted-foreground/60 mb-1">Reported post:</p>
                      <p className="text-sm text-foreground/70">{reviewDialog.report.post.content}</p>
                    </div>
                  )}
                  {reviewDialog.report.comment && (
                    <div className="mt-2 p-2 rounded bg-accent/50">
                      <p className="text-xs text-muted-foreground/60 mb-1">Reported comment:</p>
                      <p className="text-sm text-foreground/70">{reviewDialog.report.comment.content}</p>
                    </div>
                  )}
                  {tab === 'users' && (
                    <div className="mt-2 p-2 rounded bg-accent/50">
                      <p className="text-xs text-muted-foreground/60 mb-1">Reported user:</p>
                      <p className="text-sm text-foreground/70">{reviewDialog.report.reportedUser.name} {reviewDialog.report.reportedUser.email && `(${reviewDialog.report.reportedUser.email})`}</p>
                      {reviewDialog.report.reportedUser.accessStatus && (
                        <p className="text-xs text-muted-foreground/60">Current status: {reviewDialog.report.reportedUser.accessStatus}</p>
                      )}
                    </div>
                  )}
                </div>

                {reviewDialog.action === 'actioned' && tab === 'users' && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Action to take against user</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={userAction === 'suspend' ? 'default' : 'outline'}
                        onClick={() => setUserAction('suspend')}
                        className="gap-1"
                      >
                        <UserX size={14} /> Suspend
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={userAction === 'ban' ? 'destructive' : 'outline'}
                        onClick={() => setUserAction('ban')}
                        className="gap-1"
                      >
                        <ShieldBan size={14} /> Ban
                      </Button>
                    </div>
                  </div>
                )}

                {reviewDialog.action && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Admin Note</Label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add a note about this decision..."
                      className="bg-white/5 border-border mt-1 text-foreground"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setReviewDialog({ open: false, report: null, action: '' }); setAdminNote(''); setUserAction(''); }}>
                {reviewDialog.action ? 'Cancel' : 'Close'}
              </Button>
              {reviewDialog.action && (
                <Button
                  onClick={handleReview}
                  disabled={actionLoading || (tab === 'users' && reviewDialog.action === 'actioned' && !userAction)}
                  variant={reviewDialog.action === 'actioned' ? 'destructive' : 'default'}
                >
                  {actionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                  {reviewDialog.action === 'dismissed' ? 'Dismiss' : 'Take Action'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Blog Delete Dialog */}
        <Dialog open={!!deleteBlogId} onOpenChange={(open) => { if (!open) setDeleteBlogId(null); }}>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Delete Blog</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this blog? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteBlogId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteBlog} disabled={deleteBlogLoading}>
                {deleteBlogLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
