'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Clock,
  Calendar, MoreHorizontal, Trash2, Flag, Send, Loader2,
  Check, Copy, ExternalLink, PenTool
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AdCard } from '@/components/ad-banner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGuest } from '@/components/guest-guard';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

export default function BlogDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { isGuest, showLoginPrompt } = useGuest();
  const blogId = params.blogId as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBlog = useCallback(async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBlog(data.blog);
      } else {
        setBlog(null);
      }
    } catch {
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => { fetchBlog(); }, [fetchBlog]);

  const toggleLike = async () => {
    if (isGuest) { showLoginPrompt('like this blog'); return; }
    if (!blog) return;
    const wasLiked = blog.isLiked;
    setBlog((prev: any) => ({
      ...prev,
      isLiked: !wasLiked,
      stats: { ...prev.stats, likes: prev.stats.likes + (wasLiked ? -1 : 1) },
    }));
    try {
      const method = wasLiked ? 'DELETE' : 'POST';
      await fetch(`/api/blogs/${blog.id}/like`, { method });
    } catch {
      setBlog((prev: any) => ({
        ...prev,
        isLiked: wasLiked,
        stats: { ...prev.stats, likes: prev.stats.likes + (wasLiked ? 1 : -1) },
      }));
    }
  };

  const toggleBookmark = async () => {
    if (isGuest) { showLoginPrompt('bookmark this blog'); return; }
    if (!blog) return;
    const wasBookmarked = blog.isBookmarked;
    setBlog((prev: any) => ({
      ...prev,
      isBookmarked: !wasBookmarked,
      stats: { ...prev.stats, bookmarks: prev.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    }));
    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/blogs/${blog.id}/bookmark`, { method });
    } catch {
      setBlog((prev: any) => ({
        ...prev,
        isBookmarked: wasBookmarked,
        stats: { ...prev.stats, bookmarks: prev.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      }));
    }
  };

  const submitComment = async () => {
    if (isGuest) { showLoginPrompt('comment on this blog'); return; }
    if (!commentText.trim() || !blog) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/blogs/${blog.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlog((prev: any) => ({
          ...prev,
          stats: { ...prev.stats, comments: prev.stats.comments + 1 },
          comments: [data.comment, ...(prev.comments || [])],
        }));
        setCommentText('');
        toast.success('Comment posted!');
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to post comment');
      }
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const shareUrl = blog ? `${SITE_URL}/blog/${blog.slug || blog.id}` : '';
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const deleteBlog = async () => {
    if (!blog || !blog.isOwn) return;
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted');
        router.push('/blog');
      } else {
        toast.error('Failed to delete blog');
      }
    } catch {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-foreground mb-2">Blog Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">This article may have been removed or doesn't exist.</p>
        <Button onClick={() => router.push('/blog')} className="gradient-blue">
          <ArrowLeft size={16} className="mr-2" /> Back to Blog
        </Button>
      </div>
    );
  }

  // Render blog content with paragraph breaks
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, i) => {
      // Check for headings (lines starting with #)
      if (paragraph.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-3">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-4">{paragraph.slice(3)}</h2>;
      }
      // Check for bullet lists
      if (paragraph.split('\n').every(line => line.startsWith('- ') || line.startsWith('* ') || line.trim() === '')) {
        return (
          <ul key={i} className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">
            {paragraph.split('\n').filter(l => l.trim()).map((line, j) => (
              <li key={j} className="text-sm">{line.replace(/^[-*]\s*/, '')}</li>
            ))}
          </ul>
        );
      }
      // Regular paragraph
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-4">{paragraph}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => router.push('/blog')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      {/* Blog Header */}
      <GlassCard className="p-6">
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {blog.tags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => router.push(`/blog?tag=${encodeURIComponent(tag)}`)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-300 hover:bg-blue-600/25 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">{blog.title}</h1>

        {/* Author + Meta */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border border-border cursor-pointer" onClick={() => router.push(`/profile/${blog.user.id}`)}>
            <AvatarImage src={blog.user.avatarUrl} />
            <AvatarFallback className="bg-blue-600/30 text-blue-300 text-sm">
              {blog.user.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground cursor-pointer hover:text-blue-300 transition-colors" onClick={() => router.push(`/profile/${blog.user.id}`)}>
              {blog.user.name} {blog.user.verified && <span className="text-blue-400 text-xs">✓</span>}
            </p>
            <p className="text-[10px] text-muted-foreground/70">@{blog.user.username}</p>
          </div>
          {blog.isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal size={18} /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={deleteBlog} className="text-red-400">
                  <Trash2 size={14} className="mr-2" /> Delete Blog
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60 mb-6">
          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {blog.readTime} min read</span>
        </div>

        {/* Blog Content */}
        <div className="prose-sm max-w-none">
          {renderContent(blog.content)}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/30">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${blog.isLiked ? 'text-rose-400' : 'text-muted-foreground/70 hover:text-rose-400'}`}>
            <Heart size={16} fill={blog.isLiked ? 'currentColor' : 'none'} />
            <span>{blog.stats.likes}</span>
          </button>
          <button onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-cyan-400 transition-colors">
            <MessageCircle size={16} />
            <span>{blog.stats.comments}</span>
          </button>
          <button onClick={() => { if (isGuest) { showLoginPrompt('share this blog'); return; } setShareDialogOpen(true); }} className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-blue-400 transition-colors">
            <Share2 size={16} />
          </button>
          <button onClick={toggleBookmark} className={`flex items-center gap-1.5 text-xs transition-colors ${blog.isBookmarked ? 'text-amber-400' : 'text-muted-foreground/70 hover:text-amber-400'}`}>
            <Bookmark size={16} fill={blog.isBookmarked ? 'currentColor' : 'none'} />
            <span>{blog.stats.bookmarks}</span>
          </button>
          {!blog.isOwn && (
            <button onClick={() => { if (isGuest) { showLoginPrompt('report this blog'); return; } toast.success('Report submitted. We will review this blog.'); }} className="text-muted-foreground/40 hover:text-amber-400 ml-auto transition-colors">
              <Flag size={14} />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Ad */}
      <AdCard format="horizontal" />

      {/* Comments Section */}
      <div id="comments-section">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle size={18} /> Comments ({blog.stats.comments})
          </h3>

          {/* Comment Input */}
          {isGuest ? (
            <div className="mb-4 p-3 rounded-lg bg-accent/30 border border-border/30 text-center">
              <p className="text-xs text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Button onClick={() => router.push('/login')} size="sm" className="gradient-blue text-xs h-7 px-3">Sign In</Button>
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <Textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="bg-accent border-border text-foreground text-sm min-h-[60px] resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
              />
              <Button onClick={submitComment} size="icon" className="gradient-blue shrink-0 h-10 w-10" disabled={submittingComment || !commentText.trim()}>
                {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {blog.comments?.map((comment: any) => (
              <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/20">
                <Avatar className="h-7 w-7 border border-border shrink-0">
                  <AvatarFallback className="bg-blue-600/20 text-blue-300 text-[10px]">
                    {comment.user.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-foreground cursor-pointer hover:text-blue-300 transition-colors" onClick={() => router.push(`/profile/${comment.user.id}`)}>
                      {comment.user.name} {comment.user.verified && <span className="text-blue-400 text-[10px]">✓</span>}
                    </p>
                    <span className="text-[9px] text-muted-foreground/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
            {(!blog.comments || blog.comments.length === 0) && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent
          style={{ maxWidth: '340px', width: 'min(340px, calc(100vw - 2rem))', padding: '12px', boxSizing: 'border-box' }}
        >
          <DialogHeader style={{ minWidth: 0 }}>
            <DialogTitle className="flex items-center gap-2"><Share2 size={18} /> Share This Blog</DialogTitle>
          </DialogHeader>
          <div className="space-y-3" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            <div className="bg-accent/50 rounded-lg p-3 overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">by {blog.user.name}</p>
              <p className="text-sm text-foreground line-clamp-2 break-words whitespace-normal">{blog.title}</p>
            </div>
            {/* URL display + copy button in a flex row — no absolute positioning */}
            <div className="flex items-center gap-1 w-full" style={{ minWidth: 0 }}>
              <div className="flex-1 bg-accent/30 rounded-md px-2 py-2 text-xs text-muted-foreground border border-border/50 overflow-hidden" style={{ minWidth: 0 }}>
                <p className="truncate">{shareUrl}</p>
              </div>
              <button
                onClick={copyLink}
                title="Copy link"
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-border/50 bg-accent/30 hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <Button variant="outline" onClick={() => { window.open(shareUrl, '_blank'); setShareDialogOpen(false); }} className="w-full">
              <ExternalLink size={16} className="mr-2" /> Open in New Tab
            </Button>
            {/* Social share buttons — all full-width vertical stack */}
            <div className="flex flex-col gap-1.5 w-full" style={{ minWidth: 0 }}>
              <button type="button" className="w-full flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title + ' ' + shareUrl)}`, '_blank')}>
                WhatsApp
              </button>
              <button type="button" className="w-full flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                X / Twitter
              </button>
              <button type="button" className="w-full flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                LinkedIn
              </button>
              <button type="button" className="w-full flex items-center justify-center h-8 rounded-md border border-border bg-background text-xs text-foreground hover:bg-accent transition-colors" onClick={() => window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(blog.title)}`, '_blank')}>
                Reddit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
