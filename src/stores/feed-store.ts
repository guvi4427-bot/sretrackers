import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedPost {
  id: string;
  userId: string;
  content: string;
  username: string;
  avatarUrl: string | null;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface FeedState {
  posts: FeedPost[];
  setPosts: (posts: FeedPost[]) => void;
  addPost: (post: FeedPost) => void;
  removePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  incrementComments: (postId: string) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: [],
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      removePost: (postId) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) })),
      toggleLike: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
              : p
          ),
        })),
      toggleBookmark: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
          ),
        })),
      incrementComments: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, comments: p.comments + 1 } : p
          ),
        })),
    }),
    { name: 'sre-feed-store' }
  )
);
