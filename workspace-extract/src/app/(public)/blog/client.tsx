'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Bookmark, Share2, ChevronRight, Sparkles,
  PenTool, Clock, Calendar, Tag, X, Loader2, Search, BookOpen,
  Dumbbell, Zap, TrendingUp, Target, Brain, ArrowRight, Plus,
  FileText, Send, Image as ImageIcon
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { useGuest } from '@/components/guest-guard';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

const TAG_OPTIONS = [
  { label: 'Fitness', icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-600/15' },
  { label: 'Learning', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-600/15' },
  { label: 'Productivity', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-600/15' },
  { label: 'Growth', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-600/15' },
  { label: 'Content', icon: PenTool, color: 'text-purple-400', bg: 'bg-purple-600/15' },
  { label: 'SRE', icon: Target, color: 'text-rose-400', bg: 'bg-rose-600/15' },
  { label: 'AI', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-600/15' },
];

export function BlogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isGuest, showLoginPrompt } = useGuest();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Write form state
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeExcerpt, setWriteExcerpt] = useState('');
  const [writeTags, setWriteTags] = useState<string[]>([]);
  const [writeCoverImage, setWriteCoverImage] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetchBlogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (selectedTag !== 'All') params.set('tag', selectedTag);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      const res = await fetch(`/api/blogs?${params}&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  useEffect(() => { fetchBlogs(1); }, [fetchBlogs]);

  const handleTagToggle = (tag: string) => {
    setWriteTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const publishBlog = async () => {
    if (!writeTitle.trim()) { toast.error('Title is required'); return; }
    if (!writeContent.trim()) { toast.error('Content is required'); return; }
    if (writeContent.trim().length < 50) { toast.error('Content should be at least 50 characters'); return; }

    setPublishing(true);
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: writeTitle.trim(),
          content: writeContent.trim(),
          excerpt: writeExcerpt.trim() || undefined,
          tags: writeTags.length > 0 ? writeTags : undefined,
          coverImage: writeCoverImage.trim() || undefined,
          status: 'published',
        }),
      });

      if (res.ok) {
        toast.success('Blog published! +15 XP');
        setWriteTitle('');
        setWriteContent('');
        setWriteExcerpt('');
        setWriteTags([]);
        setWriteCoverImage('');
        setWriteDialogOpen(false);
        fetchBlogs(1);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to publish blog');
      }
    } catch {
      toast.error('Failed to publish blog');
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (blog: any, index: number) => {
    if (isGuest) { showLoginPrompt('like this blog'); return; }
    const wasLiked = blog.isLiked;
    setBlogs(prev => prev.map((b, i) => i === index ? {
      ...b,
      isLiked: !wasLiked,
      stats: { ...b.stats, likes: b.stats.likes + (wasLiked ? -1 : 1) },
    } : b));
    try {
      await fetch(`/api/blogs/${blog.id}/like`, { method: wasLiked ? 'DELETE' : 'POST' });
    } catch {
      setBlogs(prev => prev.map((b, i) => i === index ? {
        ...b,
        isLiked: wasLiked,
        stats: { ...b.stats, likes: b.stats.likes + (wasLiked ? 1 : -1) },
      } : b));
    }
  };

  const toggleBookmark = async (blog: any, index: number) => {
    if (isGuest) { showLoginPrompt('bookmark this blog'); return; }
    const wasBookmarked = blog.isBookmarked;
    setBlogs(prev => prev.map((b, i) => i === index ? {
      ...b,
      isBookmarked: !wasBookmarked,
      stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    } : b));
    try {
      await fetch(`/api/blogs/${blog.id}/bookmark`, { method: wasBookmarked ? 'DELETE' : 'POST' });
    } catch {
      setBlogs(prev => prev.map((b, i) => i === index ? {
        ...b,
        isBookmarked: wasBookmarked,
        stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      } : b));
    }
  };

  const copyBlogLink = async (blog: any) => {
    const url = `${SITE_URL}/blog/${blog.slug || blog.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const tagCategories = ['All', ...TAG_OPTIONS.map(t => t.label)];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="sr-only">Blog — {SITE_NAME}</h1>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={20} className="text-amber-400" />
          <h2 className="text-2xl font-bold text-foreground">SRE Blog</h2>
          <Sparkles size={20} className="text-amber-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Insights, guides, and strategies for your self-growth journey. Read, write, and share with {SITE_NAME}.
        </p>
        {/* Write button - only for authenticated users */}
        {!isGuest && (
          <Button onClick={() => setWriteDialogOpen(true)} className="gradient-blue mt-2">
            <PenTool size={16} className="mr-2" /> Write an Article
          </Button>
        )}
        {isGuest && (
          <Button onClick={() => router.push('/signup')} variant="outline" className="mt-2 border-border">
            <PenTool size={16} className="mr-2" /> Write an Article (Sign Up)
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="bg-accent border-border text-foreground pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tagCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedTag(cat)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedTag === cat
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Featured Blog */}
      {blogs.filter(b => b.featured).length > 0 && selectedTag === 'All' && !searchQuery && (
        <GlassCard className="p-6 border border-blue-500/20 cursor-pointer" onClick={() => router.push(`/blog/${blogs.find(b => b.featured)?.slug || blogs.find(b => b.featured)?.id}`)}>
          {(() => {
            const featured = blogs.find(b => b.featured);
            if (!featured) return null;
            return (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 font-medium">Featured</span>
                  {featured.tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/50 text-muted-foreground">#{tag}</span>
                  ))}
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">{new Date(featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {featured.readTime} min read</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{featured.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarFallback className="bg-blue-600/20 text-blue-300 text-[9px]">{featured.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{featured.user.name}</span>
                  <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1"><Heart size={12} /> {featured.stats.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {featured.stats.comments}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </GlassCard>
      )}

      {/* Ad Banner */}
      <AdCard format="horizontal" />

      {/* Blog List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <FileText size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-bold text-foreground mb-2">No articles yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isGuest ? 'Sign in to write the first article on this topic.' : 'Be the first to share your insights on this topic!'}
          </p>
          {!isGuest && (
            <Button onClick={() => setWriteDialogOpen(true)} className="gradient-blue">
              <Plus size={16} className="mr-2" /> Write Now
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog, index) => (
            <GlassCard key={blog.id} className="p-4 hover:border-border/50 transition-colors group">
              <div className="flex items-start gap-3">
                {/* Blog content */}
                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {blog.tags?.slice(0, 3).map((tag: string) => (
                      <button
                        key={tag}
                        onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-accent/50 text-muted-foreground hover:bg-accent/80 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                    <span className="text-[9px] text-muted-foreground/40 ml-auto">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {blog.readTime} min</span>
                  </div>

                  {/* Title - clickable to read article */}
                  <h3
                    className="text-sm font-semibold text-foreground mb-1 group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-2"
                    onClick={() => router.push(`/blog/${blog.slug || blog.id}`)}
                  >
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{blog.excerpt}</p>

                  {/* Author + Actions row (Reddit/Quora style) */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-border cursor-pointer" onClick={() => router.push(`/profile/${blog.user.id}`)}>
                      <AvatarFallback className="bg-blue-600/20 text-blue-300 text-[8px]">{blog.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-muted-foreground/70 cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push(`/profile/${blog.user.id}`)}>
                      {blog.user.name} {blog.user.verified && <span className="text-blue-400">✓</span>}
                    </span>
                    <span className="text-[9px] text-muted-foreground/30">@{blog.user.username}</span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 ml-auto">
                      <button onClick={() => toggleLike(blog, index)} className={`flex items-center gap-1 text-[11px] transition-colors ${blog.isLiked ? 'text-rose-400' : 'text-muted-foreground/50 hover:text-rose-400'}`}>
                        <Heart size={13} fill={blog.isLiked ? 'currentColor' : 'none'} />{blog.stats.likes}
                      </button>
                      <button onClick={() => router.push(`/blog/${blog.slug || blog.id}`)} className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-cyan-400 transition-colors">
                        <MessageCircle size={13} />{blog.stats.comments}
                      </button>
                      <button onClick={() => { if (isGuest) { showLoginPrompt('share this blog'); return; } copyBlogLink(blog); }} className="text-muted-foreground/40 hover:text-blue-400 transition-colors">
                        <Share2 size={13} />
                      </button>
                      <button onClick={() => toggleBookmark(blog, index)} className={`transition-colors ${blog.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/40 hover:text-amber-400'}`}>
                        <Bookmark size={13} fill={blog.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Ad Banner between posts */}
      <AdCard format="in-article" />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchBlogs(pagination.page - 1)} className="text-xs">Previous</Button>
          <span className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBlogs(pagination.page + 1)} className="text-xs">Next</Button>
        </div>
      )}

      {/* CTA */}
      <GlassCard className="p-6 text-center border border-blue-500/20">
        <Sparkles size={20} className="mx-auto mb-2 text-amber-400" />
        <h3 className="text-lg font-bold text-foreground mb-1">Share Your Journey</h3>
        <p className="text-sm text-muted-foreground mb-4">Write about your self-growth experience and inspire others in the community.</p>
        {isGuest ? (
          <Button onClick={() => router.push('/signup')} className="gradient-blue">
            Sign Up to Write <ArrowRight size={14} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setWriteDialogOpen(true)} className="gradient-blue">
            <PenTool size={14} className="mr-1" /> Start Writing
          </Button>
        )}
      </GlassCard>

      {/* Write Blog Dialog */}
      <Dialog open={writeDialogOpen} onOpenChange={setWriteDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PenTool size={18} /> Write an Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <Input
                value={writeTitle}
                onChange={e => setWriteTitle(e.target.value)}
                placeholder="Your article title..."
                className="bg-accent border-border text-foreground"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Excerpt (optional - auto-generated if empty)</label>
              <Input
                value={writeExcerpt}
                onChange={e => setWriteExcerpt(e.target.value)}
                placeholder="A brief summary of your article..."
                className="bg-accent border-border text-foreground"
                maxLength={300}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cover Image URL (optional)</label>
              <Input
                value={writeCoverImage}
                onChange={e => setWriteCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-accent border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Content * (Use ## for headings, blank line for paragraphs)</label>
              <Textarea
                value={writeContent}
                onChange={e => setWriteContent(e.target.value)}
                placeholder={`## Introduction\n\nStart your article here...\n\n## Key Points\n\n- First point\n- Second point\n\n## Conclusion\n\nWrap up your thoughts...`}
                className="bg-accent border-border text-foreground min-h-[250px] resize-y"
              />
              <p className="text-[10px] text-muted-foreground/40 mt-1">{writeContent.trim().split(/\s+/).length} words · ~{Math.max(1, Math.ceil(writeContent.trim().split(/\s+/).length / 200))} min read</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (select up to 3)</label>
              <div className="flex items-center gap-2 flex-wrap">
                {TAG_OPTIONS.map(tag => {
                  const TagIcon = tag.icon;
                  const isSelected = writeTags.includes(tag.label);
                  return (
                    <button
                      key={tag.label}
                      onClick={() => {
                        if (isSelected) handleTagToggle(tag.label);
                        else if (writeTags.length < 3) handleTagToggle(tag.label);
                        else toast.error('Maximum 3 tags allowed');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                        isSelected ? `${tag.bg} ${tag.color} border border-current/30` : 'bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent'
                      }`}
                    >
                      <TagIcon size={10} />
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setWriteDialogOpen(false)} className="text-xs">Cancel</Button>
              <Button onClick={publishBlog} className="gradient-blue text-xs" disabled={publishing || !writeTitle.trim() || !writeContent.trim()}>
                {publishing ? <><Loader2 size={14} className="mr-1 animate-spin" /> Publishing...</> : <><Send size={14} className="mr-1" /> Publish</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
