'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Search,
  RefreshCw,
  Loader2,
  Crown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminItem {
  id: string;
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  appointedById: string | null;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
}

export default function AdminAdmins() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [demoteDialog, setDemoteDialog] = useState<{ open: boolean; admin: AdminItem | null }>({
    open: false,
    admin: null,
  });
  const [demoteLoading, setDemoteLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins');
      if (!res.ok) throw new Error('Failed to fetch admins');
      const data = await res.json();
      setAdmins(data.admins);
    } catch {
      toast({ title: 'Error', description: 'Failed to load admins', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handlePromote = async () => {
    if (!promoteEmail.trim()) return;
    setPromoteLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: promoteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote');
      toast({ title: 'Success', description: `Promoted ${promoteEmail} to admin` });
      setPromoteEmail('');
      fetchAdmins();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to promote', variant: 'destructive' });
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleDemote = async () => {
    if (!demoteDialog.admin) return;
    setDemoteLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: demoteDialog.admin.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to demote');
      toast({ title: 'Success', description: `Demoted ${demoteDialog.admin.email}` });
      setDemoteDialog({ open: false, admin: null });
      fetchAdmins();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to demote', variant: 'destructive' });
    } finally {
      setDemoteLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
            <p className="text-sm text-muted-foreground mt-1">{admins.length} administrators</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAdmins} className="gap-2 w-fit">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Promote User */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-green-400" />
              Promote User to Admin
            </h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  placeholder="Enter user email to promote..."
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  className="pl-9 bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handlePromote()}
                />
              </div>
              <Button onClick={handlePromote} disabled={promoteLoading || !promoteEmail.trim()} className="gap-2">
                {promoteLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Promote
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Admins List */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              Current Admins
            </h2>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="h-12 bg-accent rounded animate-pulse" />
                </div>
              ))
            ) : admins.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                No admins found
              </div>
            ) : (
              admins.map((admin) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={admin.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-400">
                        {admin.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{admin.user.name}</p>
                        {admin.isSuperAdmin ? (
                          <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-400/20 gap-1">
                            <Crown size={10} />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-400/20">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        Appointed: {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!admin.isSuperAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-1"
                      onClick={() => setDemoteDialog({ open: true, admin })}
                    >
                      <UserMinus size={14} />
                      Demote
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Demote Dialog */}
        <Dialog open={demoteDialog.open} onOpenChange={(open) => setDemoteDialog((prev) => ({ ...prev, open }))}>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Demote Admin</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove admin privileges from{' '}
                <span className="font-medium text-foreground">{demoteDialog.admin?.email}</span>?
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">This action will be logged in the audit trail.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDemoteDialog({ open: false, admin: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDemote} disabled={demoteLoading}>
                {demoteLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                Demote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
