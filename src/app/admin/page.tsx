'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, ShieldCheck, AlertTriangle, MessageSquare, TrendingUp, BadgeCheck, Monitor, Flag, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyRequests, setVerifyRequests] = useState<any[]>([]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/dashboard');
      if (r.ok) setStats(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); fetchVerifyRequests(); }, [fetchStats]);

  const fetchVerifyRequests = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/verify?action=pending');
      if (r.ok) { const d = await r.json(); setVerifyRequests(d.requests || []); }
    } catch {}
  }, []);

  async function handleVerifyDecision(verificationId: string, decision: 'approve' | 'deny') {
    setVerifyLoading(true);
    try {
      const r = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, decision }),
      });
      if (r.ok) {
        toast.success(decision === 'approve' ? 'User verified' : 'Verification denied');
        fetchVerifyRequests();
        fetchStats();
      }
    } catch {}
    setVerifyLoading(false);
  }

  if (loading) return <div className="flex justify-center py-8"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><ShieldCheck className="w-8 h-8 text-purple-400" /></motion.div></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/20' },
    { label: 'Active', value: stats?.activeUsers || 0, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-600/20' },
    { label: 'Suspended', value: stats?.suspendedUsers || 0, icon: UserX, color: 'text-amber-400', bg: 'bg-amber-600/20' },
    { label: 'Banned', value: stats?.bannedUsers || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-600/20' },
    { label: 'New This Week', value: stats?.newThisWeek || 0, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-600/20' },
    { label: 'Feedback', value: stats?.feedbackCount || 0, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-600/20' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: Flag, color: 'text-orange-400', bg: 'bg-orange-600/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and quick actions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <GlassCard key={label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold text-foreground">{value}</p></div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Button onClick={() => router.push('/admin/users')} variant="outline" className="h-20 flex flex-col gap-1"><Users size={20} />Users</Button>
        <Button onClick={() => router.push('/admin/reports')} variant="outline" className="h-20 flex flex-col gap-1"><AlertTriangle size={20} />Reports</Button>
        <Button onClick={() => router.push('/admin/feedback')} variant="outline" className="h-20 flex flex-col gap-1"><MessageSquare size={20} />Feedback</Button>
        <Button onClick={() => router.push('/admin/admins')} variant="outline" className="h-20 flex flex-col gap-1"><ShieldCheck size={20} />Admins</Button>
      </div>

      {/* Recent Reports Section */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="text-orange-400" size={20} />
            <h3 className="text-sm font-medium text-foreground">Recent Reports</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/admin/reports')}
          >
            View All →
          </Button>
        </div>
        {stats?.recentReports?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentReports.map((report: { id: string; type: string; category: string; reason: string; status: string; createdAt: string; reporterName: string }) => (
              <div
                key={report.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] capitalize">{report.type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{report.category}</Badge>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      report.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : report.status === 'actioned'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{report.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">by {report.reporterName}</span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Flag className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No reports yet</p>
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Button onClick={() => router.push('/admin/dm-monitor')} variant="outline" className="h-16 flex items-center gap-3">
          <Monitor size={20} />DM & Group Chat Monitor
        </Button>
        {isSuperAdmin && (
          <GlassCard className="p-5 border-l-2 border-l-purple-500/50">
            <div className="flex items-center gap-2 mb-3"><BadgeCheck className="text-purple-400" size={20} /><h3 className="text-sm font-medium text-foreground">Verification Management</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Grant or revoke verification badges for users. Auto-verification: Level ≥ 5 AND Followers ≥ 100</p>
            <Button onClick={() => router.push('/admin/users')} className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/20">Manage Verification</Button>
          </GlassCard>
        )}
      </div>

      {/* Pending Verification Requests */}
      {verifyRequests.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="text-amber-400" size={20} />
              <h3 className="text-sm font-medium text-foreground">Pending Verification Requests ({verifyRequests.length})</h3>
            </div>
          </div>
          <div className="space-y-3">
            {verifyRequests.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-blue-600/30 text-blue-300">{req.user?.profile?.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{req.user?.profile?.name || req.user?.username || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground">@{req.user?.username} · Lv.{req.user?.profile?.level} · Streak: {req.user?.profile?.currentStreak}</p>
                  <p className="text-[10px] text-muted-foreground/50">{req.notes}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={() => handleVerifyDecision(req.id, 'approve')} disabled={verifyLoading} size="sm" className="gradient-blue h-8 px-3">
                    <CheckCircle size={14} className="mr-1" />Verify
                  </Button>
                  <Button onClick={() => handleVerifyDecision(req.id, 'deny')} disabled={verifyLoading} size="sm" variant="ghost" className="text-red-400 h-8 px-3">
                    <XCircle size={14} className="mr-1" />Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
