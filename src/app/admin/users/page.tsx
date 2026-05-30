'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Search,
  MoreHorizontal,
  UserX,
  ShieldBan,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Loader2,
  Trash2,
  Phone,
  User,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

  interface UserItem {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  createdAt: string;
  profile: {
    name: string | null;
    avatarUrl: string | null;
    xp: number;
    level: number;
    accessStatus: string;
    verified: boolean;
    currentStreak: number;
    activePhases: string;
    phaseActivityMap: string;
  } | null;
  adminRole: { isSuperAdmin: boolean } | null;
}

export default function AdminUsers() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    user: UserItem | null;
    action: string;
  }>({ open: false, user: null, action: '' });
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async () => {
    if (!actionDialog.user) return;
    setActionLoading(true);
    try {
      if (actionDialog.action === 'delete') {
        const res = await fetch(`/api/admin/users?userId=${actionDialog.user.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        toast({ title: 'Success', description: 'User deleted successfully' });
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: actionDialog.user.id,
            action: actionDialog.action,
            adminNote,
          }),
        });
        if (!res.ok) throw new Error('Action failed');
        toast({ title: 'Success', description: `User ${actionDialog.action} successful` });
      }
      setActionDialog({ open: false, user: null, action: '' });
      setAdminNote('');
      fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      suspended: { variant: 'secondary', label: 'Suspended' },
      banned: { variant: 'destructive', label: 'Banned' },
    };
    const config = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) return name.slice(0, 2).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">{total} total users</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2 w-fit">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search by name, email, or username..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {['', 'active', 'suspended', 'banned'].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className="text-xs"
                >
                  {s || 'All'}
                </Button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Users Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">XP / Level</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Phases</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-10 bg-accent rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/profile/${user.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profile?.avatarUrl || undefined} />
                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                              {getInitials(user.profile?.name ?? null, user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user.profile?.name || user.username}
                              {user.profile?.verified && <CheckCircle size={12} className="inline ml-1 text-blue-400" />}
                            </p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{user.phone ? <span className="flex items-center gap-1"><Phone size={12} />{user.phone}</span> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs">
                            {user.profile?.xp ?? 0} XP
                          </Badge>
                          <span className="text-xs text-muted-foreground">Lv.{user.profile?.level ?? 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(() => { try { const phases = JSON.parse(user.profile?.activePhases || '[]'); return phases.map((p: string) => <Badge key={p} variant="outline" className={`text-[10px] ${p === 'start' ? 'text-blue-400 border-blue-400/30' : p === 'restart' ? 'text-amber-400 border-amber-400/30' : 'text-purple-400 border-purple-400/30'}`}>{p}</Badge>); } catch { return <span className="text-muted-foreground/40 text-xs">—</span>; } })()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user.profile?.accessStatus || 'active')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/profile/${user.id}`); }}>
                              <User size={14} className="mr-2" /> View Profile
                            </DropdownMenuItem>
                            {/* Admin can ban/suspend/verify/activate ALL users including super admins */}
                            {/* Only restriction: cannot modify access of or delete super admins */}
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'verify' }); }}>
                              <ShieldCheck size={14} className="mr-2" /> Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'suspend' }); }}>
                              <UserX size={14} className="mr-2" /> Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'ban' }); }} className="text-red-500">
                              <ShieldBan size={14} className="mr-2" /> Ban
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'activate' }); }}>
                              <Eye size={14} className="mr-2" /> Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'unverify' }); }}>
                              <XCircle size={14} className="mr-2" /> Unverify
                            </DropdownMenuItem>
                            {/* Only super admin can delete super admins; admins can delete non-super-admin users */}
                            {!(user.adminRole?.isSuperAdmin) && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'delete' }); }} className="text-red-600">
                                <Trash2 size={14} className="mr-2" /> Delete User
                              </DropdownMenuItem>
                            )}
                            {user.adminRole?.isSuperAdmin && !isSuperAdmin && (
                              <DropdownMenuItem disabled className="text-muted-foreground/50">
                                <Lock size={14} className="mr-2" /> Cannot Delete/Modify Super Admin
                              </DropdownMenuItem>
                            )}
                            {user.adminRole?.isSuperAdmin && isSuperAdmin && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setActionDialog({ open: true, user, action: 'delete' }); }} className="text-red-600">
                                <Trash2 size={14} className="mr-2" /> Delete Super Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {actionDialog.action === 'suspend' && 'Suspend User'}
                {actionDialog.action === 'ban' && 'Ban User'}
                {actionDialog.action === 'activate' && 'Activate User'}
                {actionDialog.action === 'verify' && 'Verify User'}
                {actionDialog.action === 'unverify' && 'Unverify User'}
                {actionDialog.action === 'delete' && 'Delete User'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to {actionDialog.action}{' '}
                <span className="font-medium text-foreground">{actionDialog.user?.profile?.name || actionDialog.user?.username}</span>?
              </p>
              <div>
                <Label className="text-muted-foreground text-sm">Admin Note (optional)</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Reason for this action..."
                  className="bg-white/5 border-border mt-1 text-foreground"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, user: null, action: '' })}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={actionLoading}
                variant={actionDialog.action === 'ban' ? 'destructive' : 'default'}
              >
                {actionLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
