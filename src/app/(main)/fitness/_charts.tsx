'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { Scale } from 'lucide-react';

interface CalorieData {
  date: string;
  consumed: number;
  burned: number;
  balance?: number;
}

interface MacroData {
  name: string;
  value: number;
  color: string;
}

interface WorkoutData {
  date: string;
  calories: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0F1E] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-white font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function CalorieChart({ data }: { data: CalorieData[] }) {
  const hasBalance = data.some(d => d.balance !== undefined);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="consumed" name="Consumed" stroke="#F59E0B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="burned" name="Burned" stroke="#EF4444" strokeWidth={2} dot={false} />
          {hasBalance && <Line type="monotone" dataKey="balance" name="Balance" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MacroPieChart({ data }: { data: MacroData[] }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-white/60">{d.name}</span>
            <span className="text-white font-medium tabular-nums">{d.value}g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkoutChart({ data }: { data: WorkoutData[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="calories" name="Calories Burned" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Safely parse a date string into a timestamp.
 * Handles: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, MM/DD, MM-DD, and more.
 * Returns NaN if unparseable.
 */
function safeParseDate(raw: string): number {
  if (!raw) return NaN;
  // Already a full ISO string
  const direct = Date.parse(raw);
  if (!isNaN(direct)) return direct;
  // Try YYYY-MM-DD explicitly (split and construct to avoid timezone issues)
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return Date.parse(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`);
  }
  // Try MM/DD or MM-DD
  const mdMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (mdMatch) {
    const year = new Date().getFullYear();
    const [, m, d] = mdMatch;
    return Date.parse(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`);
  }
  return NaN;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/**
 * WeightChart — shows daily entries for the first week, then switches to weekly trend.
 * Falls back to simple display if dates can't be parsed.
 */
export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground/60">No weight data available yet</p>
          <p className="text-xs text-muted-foreground/40 mt-1">Log your weight in the overview tab to see progress here</p>
        </div>
      </div>
    );
  }

  // Filter out entries with NaN weight
  const validData = data.filter(d => !isNaN(Number(d.weight)));
  if (validData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground/60">No weight data available yet</p>
        </div>
      </div>
    );
  }

  // Try to parse all dates; track how many succeed
  const withTs = validData.map(d => {
    const raw = typeof d.date === 'string' ? d.date : String(d.date ?? '');
    const ts = safeParseDate(raw);
    return { ...d, ts, raw };
  });

  const parseableCount = withTs.filter(d => !isNaN(d.ts)).length;
  const canAggregate = parseableCount === withTs.length && parseableCount > 1;

  let chartData: { date: string; weight: number }[];
  let useWeekly = false;

  if (canAggregate) {
    // Sort by timestamp
    withTs.sort((a, b) => a.ts - b.ts);

    const firstTs = withTs[0].ts;
    const lastTs = withTs[withTs.length - 1].ts;
    const daySpan = Math.round((lastTs - firstTs) / 86400000);
    useWeekly = daySpan > 7 || withTs.length > 7;

    if (useWeekly) {
      // First 7 days: daily entries
      const sevenDaysMs = 7 * 86400000;
      const dailyEntries = withTs.filter(d => d.ts - firstTs <= sevenDaysMs);
      const weeklyEntries = withTs.filter(d => d.ts - firstTs > sevenDaysMs);

      // Group into 7-day buckets
      const weekBuckets = new Map<number, { sum: number; count: number }>();
      for (const entry of weeklyEntries) {
        const weekIndex = Math.floor((entry.ts - firstTs - sevenDaysMs) / 86400000 / 7);
        const weekStartTs = firstTs + sevenDaysMs + weekIndex * 7 * 86400000;
        if (!weekBuckets.has(weekStartTs)) {
          weekBuckets.set(weekStartTs, { sum: 0, count: 0 });
        }
        const bucket = weekBuckets.get(weekStartTs)!;
        bucket.sum += Number(entry.weight);
        bucket.count += 1;
      }

      const dailyData = dailyEntries.map(d => ({
        date: formatDateLabel(d.ts),
        weight: Number(d.weight),
      }));

      const weeklyData = Array.from(weekBuckets.entries())
        .sort(([a], [b]) => a - b)
        .map(([weekStartTs, bucket], idx) => ({
          date: `W${idx + 2} (${formatDateLabel(weekStartTs)})`,
          weight: Math.round((bucket.sum / bucket.count) * 10) / 10,
        }));

      chartData = [...dailyData, ...weeklyData];
    } else {
      // Daily only (≤7 entries)
      chartData = withTs.map(d => ({
        date: formatDateLabel(d.ts),
        weight: Number(d.weight),
      }));
    }
  } else {
    // Fallback: can't parse dates — use labels as-is, just ensure data displays
    chartData = validData.map(d => ({
      date: typeof d.date === 'string' ? d.date : String(d.date ?? ''),
      weight: Number(d.weight),
    }));
  }

  // Ensure at least 2 points so recharts renders a visible line
  if (chartData.length === 1) {
    chartData = [chartData[0], { ...chartData[0] }];
  }

  // Fixed Y domain with padding
  const weights = chartData.map(d => d.weight).filter(v => !isNaN(v));
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const pad = Math.max(2, (maxW - minW) * 0.25);
  const yMin = Math.floor(minW - pad);
  const yMax = Math.ceil(maxW + pad);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: useWeekly ? 8 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            interval={useWeekly ? 0 : 'preserveStartEnd'}
            angle={useWeekly ? -25 : 0}
            textAnchor={useWeekly ? 'end' : 'middle'}
            height={useWeekly ? 50 : 30}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}kg`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            name="Weight (kg)"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3B82F6', stroke: '#1d4ed8', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#60a5fa', stroke: '#3B82F6', strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
