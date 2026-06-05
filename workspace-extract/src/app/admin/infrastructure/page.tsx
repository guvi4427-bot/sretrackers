'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Cpu, HardDrive, Zap, AlertTriangle, Shield, Users, TrendingUp, Clock, Globe, BarChart3, Eye, ChevronRight, XCircle, CheckCircle, Loader2, RefreshCw, Bot, Brain, Wifi, WifiOff } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface InstanceStat {
  id: string;
  activeUsers: number;
  requestCount: number;
  errorRate: number;
  avgResponseMs: number;
  apiCalls: number;
  errorCount: number;
  lastActive: string | null;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

interface Overview {
  totalDayRequests: number;
  totalDayErrors: number;
  totalDayApiCalls: number;
  errorRate: number;
  activeAbuseFlags: number;
  rateLimitedEntries: number;
  activeUsersToday: number;
  activeUsers7d: number;
}

interface AbuseFlagEntry {
  id: string;
  userId: string | null;
  ip: string | null;
  severity: string;
  reason: string;
  details: string | null;
  confidence: number;
  status: string;
  createdAt: string;
  user?: { id: string; username: string; name: string; avatarUrl: string | null; level: number } | null;
}

interface MappedUser {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  instance: string;
  requestCount: number;
  lastActive: string;
  paths: string[];
  intensity: string;
}

interface AIProviderStat {
  name: string;
  tier: number;
  available: boolean;
  rateLimited: boolean;
  successRate: number;
  avgLatencyMs: number;
  totalRequests: number;
  failCount: number;
  lastError?: string;
}

interface AIAnalyticsData {
  providers: AIProviderStat[];
  recentRepetitionDetected: boolean;
  activeTier: number;
  totalFallbackEvents: number;
}

const INSTANCE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  A: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: '🔵' },
  B: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-500/30', icon: '🟢' },
  C: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: '🟣' },
};

const TIER_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'ChatGPT (gpt-4o-mini)' },
  2: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Gemini (2.0 + 1.5 Flash)' },
  3: { bg: 'bg-violet-600/20', text: 'text-violet-400', border: 'border-violet-500/30', label: 'Pollinations (OpenAI + Mistral)' },
  4: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'HuggingFace (Mistral-7B)' },
  5: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-500/30', label: 'z.ai API' },
};

export default function InfrastructurePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [instanceStats, setInstanceStats] = useState<InstanceStat[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [rpm, setRpm] = useState<{ minute: string; count: number }[]>([]);
  const [abuseFlags, setAbuseFlags] = useState<AbuseFlagEntry[]>([]);
  const [mappedUsers, setMappedUsers] = useState<MappedUser[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchOverview = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/infra?section=overview&_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        setInstanceStats(data.instanceStats || []);
        setOverview(data.overview || null);
        setRpm(data.requestsPerMinute || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  const fetchAbuse = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/infra?section=abuse&status=active&limit=50&_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        setAbuseFlags(data.flags || []);
      }
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/infra?section=users&_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        setMappedUsers(data.users || []);
      }
    } catch {}
  }, []);

  const fetchAIAnalytics = useCallback(async () => {
    try {
      const r = await fetch(`/api/ai/analytics?_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        setAiAnalytics(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'abuse') fetchAbuse();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'ai') fetchAIAnalytics();
  }, [activeTab, fetchAbuse, fetchUsers, fetchOverview, fetchAIAnalytics]);

  async function resolveFlag(flagId: string, resolution: 'dismiss' | 'action') {
    try {
      const r = await fetch('/api/admin/infra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_abuse', flagId, resolution }),
      });
      if (r.ok) {
        toast.success(resolution === 'dismiss' ? 'Flag dismissed' : 'Flag actioned');
        fetchAbuse();
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Server className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  const totalRequests = overview?.totalDayRequests || 0;
  const totalErrors = overview?.totalDayErrors || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="text-blue-400" size={24} />
            Infrastructure Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">3-instance load distribution monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => {
          setRefreshing(true);
          try {
            await Promise.all([fetchOverview(), fetchAbuse(), fetchUsers(), fetchAIAnalytics()]);
            toast.success('Dashboard refreshed');
          } catch {
            toast.error('Refresh failed');
          } finally {
            setRefreshing(false);
          }
        }} className="gap-2" disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-1"><BarChart3 size={14} /> Overview</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1"><Brain size={14} /> AI System</TabsTrigger>
          <TabsTrigger value="abuse" className="gap-1"><Shield size={14} /> Abuse Detection {overview?.activeAbuseFlags ? <Badge variant="destructive" className="ml-1 h-4 text-[10px] px-1">{overview.activeAbuseFlags}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users size={14} /> User Mapping</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Users className="text-green-400" size={16} /><span className="text-xs text-muted-foreground">Active Now</span></div>
              <p className="text-2xl font-bold text-foreground">{overview?.activeUsersToday || 0}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Users className="text-emerald-400" size={16} /><span className="text-xs text-muted-foreground">Active (7d)</span></div>
              <p className="text-2xl font-bold text-foreground">{overview?.activeUsers7d || 0}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Activity className="text-blue-400" size={16} /><span className="text-xs text-muted-foreground">24h Requests</span></div>
              <p className="text-2xl font-bold text-foreground">{totalRequests.toLocaleString()}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Zap className="text-amber-400" size={16} /><span className="text-xs text-muted-foreground">API Calls</span></div>
              <p className="text-2xl font-bold text-foreground">{(overview?.totalDayApiCalls || 0).toLocaleString()}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className="text-red-400" size={16} /><span className="text-xs text-muted-foreground">Error Rate</span></div>
              <p className="text-2xl font-bold text-foreground">{(overview?.errorRate || 0).toFixed(1)}%</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Shield className="text-orange-400" size={16} /><span className="text-xs text-muted-foreground">Abuse Flags</span></div>
              <p className="text-2xl font-bold text-foreground">{overview?.activeAbuseFlags || 0}</p>
            </GlassCard>
          </div>

          {/* Server Instance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instanceStats.map(inst => {
              const colors = INSTANCE_COLORS[inst.id] || INSTANCE_COLORS.A;
              const healthColor = inst.status === 'healthy' ? 'text-green-400' : inst.status === 'degraded' ? 'text-amber-400' : 'text-red-400';
              return (
                <GlassCard key={inst.id} className={`p-5 border-l-2 ${colors.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center text-lg`}>
                        {colors.icon}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Instance {inst.id}</p>
                        <p className={`text-xs font-medium capitalize ${healthColor}`}>{inst.status}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${inst.status === 'healthy' ? 'bg-green-400' : inst.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={12} /> Active Users</span>
                      <span className="text-sm font-semibold text-foreground">{inst.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity size={12} /> Requests (1h)</span>
                      <span className="text-sm font-semibold text-foreground">{inst.requestCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> Avg Response</span>
                      <span className="text-sm font-semibold text-foreground">{inst.avgResponseMs.toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap size={12} /> API Calls</span>
                      <span className="text-sm font-semibold text-foreground">{inst.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle size={12} /> Error Rate</span>
                      <span className={`text-sm font-semibold ${inst.errorRate > 5 ? 'text-red-400' : 'text-foreground'}`}>{inst.errorRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Load bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Load</span>
                      <span className="text-[10px] text-muted-foreground">{Math.min(100, Math.round(inst.requestCount / Math.max(totalRequests / 3, 1) * 100))}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${colors.bg.replace('/20', '/60')}`}
                        style={{ width: `${Math.min(100, Math.round(inst.requestCount / Math.max(totalRequests / 3, 1) * 100))}%` }}
                      />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Requests Per Minute Chart */}
          {rpm.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-400" size={18} />
                <h3 className="text-sm font-medium text-foreground">Requests Per Minute (last hour)</h3>
              </div>
              <div className="flex items-end gap-[2px] h-32">
                {rpm.slice(-60).map((point, i) => {
                  const maxCount = Math.max(...rpm.map(p => p.count), 1);
                  const height = Math.max(4, (point.count / maxCount) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500/40 hover:bg-blue-500/60 rounded-t transition-colors min-w-[2px]"
                      style={{ height: `${height}%` }}
                      title={`${point.minute}: ${point.count} req`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">60 min ago</span>
                <span className="text-[10px] text-muted-foreground">now</span>
              </div>
            </GlassCard>
          )}
        </TabsContent>

        {/* ── AI SYSTEM TAB ── */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          {!aiAnalytics ? (
            <GlassCard className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-400/50 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading AI analytics...</p>
            </GlassCard>
          ) : (
            <>
              {/* AI Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Brain className="text-emerald-400" size={16} /><span className="text-xs text-muted-foreground">Active Tier</span></div>
                  <p className="text-2xl font-bold text-foreground">Tier {aiAnalytics.activeTier}</p>
                  <p className="text-[10px] text-muted-foreground">{TIER_COLORS[aiAnalytics.activeTier]?.label || 'Unknown'}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Activity className="text-blue-400" size={16} /><span className="text-xs text-muted-foreground">Total AI Requests</span></div>
                  <p className="text-2xl font-bold text-foreground">{aiAnalytics.providers.reduce((sum, p) => sum + p.totalRequests, 0)}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-1"><AlertTriangle className="text-amber-400" size={16} /><span className="text-xs text-muted-foreground">Fallback Events</span></div>
                  <p className="text-2xl font-bold text-foreground">{aiAnalytics.totalFallbackEvents}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Bot className="text-purple-400" size={16} /><span className="text-xs text-muted-foreground">Repetition Detected</span></div>
                  <p className="text-2xl font-bold text-foreground">{aiAnalytics.recentRepetitionDetected ? 'Yes' : 'No'}</p>
                </GlassCard>
              </div>

              {/* Provider Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiAnalytics.providers.map(provider => {
                  const tierStyle = TIER_COLORS[provider.tier] || TIER_COLORS[4];
                  const successPct = provider.totalRequests > 0 ? (provider.successRate * 100).toFixed(1) : '0.0';
                  const isAvailable = provider.available;
                  return (
                    <GlassCard key={provider.name} className={`p-5 border-l-2 ${tierStyle.border}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg ${tierStyle.bg} flex items-center justify-center`}>
                            <Brain className={`w-5 h-5 ${tierStyle.text}`} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Tier {provider.tier}</p>
                            <p className="text-xs text-muted-foreground">{provider.tierLabel || tierStyle.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isAvailable ? (
                            <Wifi className="w-4 h-4 text-green-400" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-400" />
                          )}
                          {provider.rateLimited && (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0">RATE LIMITED</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge variant="outline" className={`text-[10px] ${isAvailable ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Success Rate</span>
                          <span className={`text-sm font-semibold ${parseFloat(successPct) > 80 ? 'text-green-400' : parseFloat(successPct) > 50 ? 'text-amber-400' : 'text-red-400'}`}>{successPct}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Avg Latency</span>
                          <span className="text-sm font-semibold text-foreground">{provider.avgLatencyMs}ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Requests</span>
                          <span className="text-sm font-semibold text-foreground">{provider.totalRequests}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Failures</span>
                          <span className={`text-sm font-semibold ${provider.failCount > 0 ? 'text-amber-400' : 'text-foreground'}`}>{provider.failCount}</span>
                        </div>
                        {provider.lastError && (
                          <div className="mt-2 p-2 rounded bg-red-950/30 border border-red-500/20">
                            <p className="text-[10px] text-red-400/80 font-mono break-all">Last error: {provider.lastError}</p>
                          </div>
                        )}
                      </div>

                      {/* Success rate bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Reliability</span>
                          <span className="text-[10px] text-muted-foreground">{successPct}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              parseFloat(successPct) > 80 ? 'bg-green-500/60' :
                              parseFloat(successPct) > 50 ? 'bg-amber-500/60' :
                              'bg-red-500/60'
                            }`}
                            style={{ width: `${Math.max(2, parseFloat(successPct))}%` }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Architecture Info */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="text-blue-400" size={18} />
                  <h3 className="text-sm font-medium text-foreground">AI Orchestration Architecture</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { tier: 1, model: 'ChatGPT (gpt-4o-mini)', desc: 'Best quality reasoning. Natural conversational responses. Requires OPENAI_API_KEY.' },
                    { tier: 2, model: 'Gemini (2.0 Flash + 1.5 Flash)', desc: 'Fast, high quality. Two models race. Requires GEMINI_API_KEY.' },
                    { tier: 3, model: 'Pollinations (OpenAI + Mistral)', desc: 'Free, no API key. Reliable OpenAI-compatible and Mistral models. 3 endpoints.' },
                    { tier: 4, model: 'HuggingFace (Mistral-7B)', desc: 'Free inference API. Open-source Mistral-7B model. Optional HF_API_KEY.' },
                    { tier: 5, model: 'z.ai API', desc: 'High-availability lightweight. Always available as last resort provider.' },
                  ].map(t => (
                    <div key={t.tier} className="p-3 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-[10px] ${TIER_COLORS[t.tier].bg} ${TIER_COLORS[t.tier].text} border ${TIER_COLORS[t.tier].border}`}>
                          Tier {t.tier}
                        </Badge>
                        {aiAnalytics.activeTier === t.tier && (
                          <Badge variant="default" className="text-[8px] px-1">ACTIVE</Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground">{t.model}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Graceful degradation: When a higher tier fails (rate limit, error, timeout), the system automatically falls back to the next tier while preserving context and tone continuity.
                </p>
              </GlassCard>
            </>
          )}
        </TabsContent>

        {/* ── ABUSE DETECTION TAB ── */}
        <TabsContent value="abuse" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Shield className="text-red-400" size={16} /><span className="text-xs text-muted-foreground">Active Flags</span></div>
              <p className="text-2xl font-bold text-foreground">{abuseFlags.length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className="text-amber-400" size={16} /><span className="text-xs text-muted-foreground">High Severity</span></div>
              <p className="text-2xl font-bold text-foreground">{abuseFlags.filter(f => f.severity === 'high' || f.severity === 'critical').length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Globe className="text-blue-400" size={16} /><span className="text-xs text-muted-foreground">IP-based Flags</span></div>
              <p className="text-2xl font-bold text-foreground">{abuseFlags.filter(f => f.ip).length}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-1"><Users className="text-purple-400" size={16} /><span className="text-xs text-muted-foreground">User Flags</span></div>
              <p className="text-2xl font-bold text-foreground">{abuseFlags.filter(f => f.userId).length}</p>
            </GlassCard>
          </div>

          {abuseFlags.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Shield className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No active abuse flags</p>
              <p className="text-xs text-muted-foreground/60 mt-1">The system is monitoring for suspicious patterns</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {abuseFlags.map(flag => (
                <GlassCard key={flag.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      flag.severity === 'critical' ? 'bg-red-600/20' :
                      flag.severity === 'high' ? 'bg-orange-600/20' :
                      flag.severity === 'medium' ? 'bg-amber-600/20' : 'bg-blue-600/20'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        flag.severity === 'critical' ? 'text-red-400' :
                        flag.severity === 'high' ? 'text-orange-400' :
                        flag.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] capitalize ${
                          flag.severity === 'critical' ? 'border-red-500/50 text-red-400' :
                          flag.severity === 'high' ? 'border-orange-500/50 text-orange-400' :
                          flag.severity === 'medium' ? 'border-amber-500/50 text-amber-400' : 'border-blue-500/50 text-blue-400'
                        }`}>{flag.severity}</Badge>
                        <span className="text-sm font-medium text-foreground">{flag.reason}</span>
                        <Badge variant="outline" className="text-[10px]">Confidence: {(flag.confidence * 100).toFixed(0)}%</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {flag.user && (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-purple-600/30 text-purple-300">{flag.user.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">@{flag.user.username}</span>
                          </div>
                        )}
                        {flag.ip && <span className="text-xs text-muted-foreground/60">IP: {flag.ip}</span>}
                        <span className="text-[10px] text-muted-foreground/40">{new Date(flag.createdAt).toLocaleString()}</span>
                      </div>
                      {flag.details && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">{flag.details}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button onClick={() => resolveFlag(flag.id, 'action')} size="sm" variant="ghost" className="text-amber-400 h-7 px-2 text-xs">
                        <CheckCircle size={12} className="mr-1" /> Action
                      </Button>
                      <Button onClick={() => resolveFlag(flag.id, 'dismiss')} size="sm" variant="ghost" className="text-muted-foreground h-7 px-2 text-xs">
                        <XCircle size={12} className="mr-1" /> Dismiss
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── USER MAPPING TAB ── */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-purple-400" size={18} />
              <h3 className="text-sm font-medium text-foreground">User to Instance Mapping</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{mappedUsers.length} active users</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Shows which server instance each active user is routed to, along with their request patterns and intensity levels.</p>

            {mappedUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active user mappings</p>
                <p className="text-xs text-muted-foreground/60">Users will appear here as they make requests</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mappedUsers.map(user => {
                  const colors = INSTANCE_COLORS[user.instance] || INSTANCE_COLORS.A;
                  return (
                    <div key={user.userId} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-purple-600/30 text-purple-300">{user.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                          <span className="text-[10px] text-muted-foreground/50">Lv.{user.level}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{user.requestCount} requests</span>
                          <span className="text-[10px] text-muted-foreground/40">•</span>
                          <span className="text-[10px] text-muted-foreground">{user.paths.length} endpoints</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] ${colors.bg} ${colors.text} border ${colors.border}`}>
                          Server {user.instance}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${
                          user.intensity === 'high' ? 'border-red-500/30 text-red-400' :
                          user.intensity === 'medium' ? 'border-amber-500/30 text-amber-400' :
                          'border-green-500/30 text-green-400'
                        }`}>{user.intensity}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
