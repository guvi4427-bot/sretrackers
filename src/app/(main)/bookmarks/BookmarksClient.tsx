'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Bookmark, Loader2, Rss, Clock, Newspaper
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { useGuest } from '@/components/guest-guard';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  readTime: number;
  featured: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostItem {
  id: string;
  content: string;
  images: string[];
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted: boolean;
  isRepost: boolean;
}

export default function BookmarksClient() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserStore();
  const { isGuest, showLoginPrompt } = useGuest();
  const [tab, setTab] = useState('blogs');
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const initialFetchDone = useRef(false);

  const fetchBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch('/api/blogs/bookmarked', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      } else {
        console.error('Bookmarks blogs API error:', res.status);
      }
    } catch (e) {
      console.error('Bookmarks blogs fetch error:', e);
      toast.error('Failed to load bookmarked blogs');
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/posts/bookmarked', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        console.error('Bookmarks posts API error:', res.status);
      }
    } catch (e) {
      console.error('Bookmarks posts fetch error:', e);
      toast.error('Failed to load bookmarked posts');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (isGuest) {
      showLoginPrompt('view bookmarks');
      router.push('/feed');
      return;
    }
    // Only fetch once when profile becomes available
    if (!profileLoading && profile && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchBlogs();
      fetchPosts();
    } else if (!profileLoading && !profile) {
      router.push('/login');
    }
  }, [profile, profileLoading, isGuest, fetchBlogs, fetchPosts, router, showLoginPrompt]);

  const toggleBlogBookmark = async (blog: BlogItem) => {
    const wasBookmarked = blog.isBookmarked;
    setBlogs(prev => prev.map(b => b.id === blog.id ? {
      ...b,
      isBookmarked: !wasBookmarked,
      stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    } : b));
    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/blogs/${blog.id}/bookmark`, { method, credentials: 'include' });
      if (wasBookmarked) {
        setBlogs(prev => prev.filter(b => b.id !== blog.id));
        toast.success('Bookmark removed');
      }
    } catch {
      setBlogs(prev => prev.map(b => b.id === blog.id ? {
        ...b,
        isBookmarked: wasBookmarked,
        stats: { ...b.stats, bookmarks: b.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      } : b));
    }
  };

  const togglePostBookmark = async (post: PostItem) => {
    const wasBookmarked = post.isBookmarked;
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      isBookmarked: !wasBookmarked,
      stats: { ...p.stats, bookmarks: p.stats.bookmarks + (wasBookmarked ? -1 : 1) },
    } : p));
    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      await fetch(`/api/posts/${post.id}/bookmark`, { method, credentials: 'include' });
      if (wasBookmarked) {
        setPosts(prev => prev.filter(p => p.id !== post.id));
        toast.success('Bookmark removed');
      }
    } catch {
      setPosts(prev => prev.map(p => p.id === post.id ? {
        ...p,
        isBookmarked: wasBookmarked,
        stats: { ...p.stats, bookmarks: p.stats.bookmarks + (wasBookmarked ? 1 : -1) },
      } : p));
    }
  };

  if (profileLoading || (loadingBlogs && loadingPosts)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-xs text-muted-foreground">Your saved content</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-border">
          <TabsTrigger value="blogs" className="gap-1.5">
            <Newspaper size={14} /> Blogs
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5">
            <Rss size={14} /> Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mt-4">
          {loadingBlogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No bookmarked blogs</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Bookmark blogs you want to read later</p>
              <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={() => router.push('/blog')}>
                Browse Blogs
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {blogs.map(blog => (
                <GlassCard key={blog.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5 border border-border">
                          <AvatarImage src={blog.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-600/20 text-blue-300 text-[8px]">
                            {blog.user.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">{blog.user.name}</span>
                        {blog.user.verified && <span className="text-blue-400 text-[9px]">✓</span>}
                      </div>
                      <h3
                        className="text-sm font-semibold text-foreground cursor-pointer hover:text-blue-300 transition-colors line-clamp-1"
                        onClick={() => router.push(`/blog/${blog.slug || blog.id}`)}
                      >
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                        <span className="flex items-center gap-1"><Clock size={10} />{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{blog.readTime} min read</span>
                        <span className="flex items-center gap-1"><Heart size={10} />{blog.stats.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} />{blog.stats.comments}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleBlogBookmark(blog)}
                      className="shrink-0 text-amber-400 hover:text-amber-300 transition-colors p-1"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          {loadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Rss className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No bookmarked posts</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Bookmark posts you want to revisit</p>
              <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={() => router.push('/feed')}>
                Browse Feed
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <GlassCard key={post.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarImage src={post.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-blue-600/20 text-blue-300 text-xs">
                        {post.user.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{post.user.name}</span>
                        {post.user.verified && <span className="text-blue-400 text-[10px]">✓</span>}
                        <span className="text-[10px] text-muted-foreground/40">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                      {post.hashtags?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {post.hashtags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-blue-400/70">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                        <span className="flex items-center gap-1"><Heart size={10} />{post.stats.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} />{post.stats.comments}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePostBookmark(post)}
                      className="shrink-0 text-amber-400 hover:text-amber-300 transition-colors p-1"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
