'use client';
import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart, Brush,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f43f5e'];

function useChartTheme() {
  const { isDark } = useTheme();
  return {
    gridColor: isDark ? '#1e293b' : '#f1f5f9',
    textColor: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipText: isDark ? '#f1f5f9' : '#1e293b',
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number; dataKey: string }>;
  label?: string;
  formatter?: (value: number, key: string) => string;
}

function CustomTooltip({ active, payload, label, formatter }: TooltipProps) {
  const { tooltipBg, tooltipBorder, tooltipText } = useChartTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-xl px-3 py-2 border text-sm" style={{ background: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}>
      {label && <p className="font-semibold mb-1 text-xs opacity-70">{label}</p>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
          <span className="capitalize opacity-80 text-xs">{item.name}:</span>
          <span className="font-semibold text-xs">{formatter ? formatter(item.value, item.dataKey) : item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ── User Growth ───────────────────────────────────────────────────────────────
export function UserGrowthChart({ data }: { data: Record<string, unknown>[] }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorElders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorGuardians" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="elders" stroke="#0284c7" strokeWidth={2} fill="url(#colorElders)" name="Elders" dot={false} />
        <Area type="monotone" dataKey="guardians" stroke="#0d9488" strokeWidth={2} fill="url(#colorGuardians)" name="Guardians" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Medicine Adherence ────────────────────────────────────────────────────────
export function MedicineAdherenceChart({ data }: { data: Record<string, unknown>[] }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={10} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="taken" name="Taken" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey="delayed" name="Delayed" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Wellness Trends ───────────────────────────────────────────────────────────
export function WellnessTrendsChart({ data }: { data: Record<string, unknown>[] }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Sleep (hrs)" />
        <Line type="monotone" dataKey="water" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Water (glasses)" />
        <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Heart Rate (bpm)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── SOS Analytics ────────────────────────────────────────────────────────────
export function SOSChart({ data }: { data: Record<string, unknown>[] }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={14} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="alerts" name="Total" fill="#0284c7" radius={[3, 3, 0, 0]} />
        <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="cancelled" name="False Alarm" fill="#94a3b8" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── AI Usage (tokens only) ───────────────────────────────────────────────────
type AIUsagePoint = {
  name: string;
  tokens?: number;
  prompt?: number;
  completion?: number;
};

export function AIUsageChart({
  data,
  height = 280,
  showBrush = true,
}: {
  data: AIUsagePoint[];
  height?: number;
  showBrush?: boolean;
}) {
  const theme = useChartTheme();
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: d.name,
        prompt: Number(d.prompt) || 0,
        completion: Number(d.completion) || 0,
        tokens: Number(d.tokens) || 0,
      })),
    [data],
  );

  const toggleSeries = (dataKey: string) => {
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: showBrush ? 8 : 0 }}>
        <defs>
          <linearGradient id="colorPromptTokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="colorCompletionTokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#0284c7" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: theme.textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(v))}
        />
        <Tooltip
          cursor={{ fill: theme.gridColor, opacity: 0.55 }}
          content={<CustomTooltip formatter={(v) => `${Number(v).toLocaleString()} tokens`} />}
        />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: 12, cursor: 'pointer' }}
          onClick={(e) => {
            const key = String((e as { dataKey?: string }).dataKey || '');
            if (key) toggleSeries(key);
          }}
          formatter={(value, entry) => {
            const key = String((entry as { dataKey?: string }).dataKey || '');
            const isHidden = Boolean(hidden[key]);
            return (
              <span style={{ opacity: isHidden ? 0.35 : 1, textDecoration: isHidden ? 'line-through' : 'none' }}>
                {value}
              </span>
            );
          }}
        />
        <Bar
          dataKey="prompt"
          name="Prompt"
          stackId="tokens"
          fill="url(#colorPromptTokens)"
          radius={[0, 0, 0, 0]}
          maxBarSize={36}
          hide={hidden.prompt}
          activeBar={{ stroke: '#0f766e', strokeWidth: 1 }}
        />
        <Bar
          dataKey="completion"
          name="Completion"
          stackId="tokens"
          fill="url(#colorCompletionTokens)"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          hide={hidden.completion}
          activeBar={{ stroke: '#0369a1', strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey="tokens"
          name="Total"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          hide={hidden.tokens}
        />
        {showBrush && chartData.length > 3 && (
          <Brush
            dataKey="name"
            height={22}
            stroke="#94a3b8"
            fill={theme.gridColor}
            travellerWidth={8}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Donut/Pie ─────────────────────────────────────────────────────────────────
interface DonutChartProps {
  data: { name: string; value?: number }[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
}

export function DonutChart({ data, colors = COLORS, height = 200, showLegend = true, innerRadius = 55 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + (d.value ?? 0), 0);

  const renderLabel = ({ cx, cy }: { cx: number; cy: number }) => (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#64748b" fontSize={11}>Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="currentColor" fontSize={18} fontWeight={700}>{total.toLocaleString()}</text>
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 35}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderLabel as unknown as boolean}
        >
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, color: 'inherit' }}>{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Radar ─────────────────────────────────────────────────────────────────────
export function HealthRadarChart({ data }: { data: { metric: string; value: number }[] }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke={theme.gridColor} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: theme.textColor, fontSize: 10 }} />
        <Radar name="Health" dataKey="value" stroke="#0284c7" fill="#0284c7" fillOpacity={0.25} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Mini Sparkline ────────────────────────────────────────────────────────────
export function Sparkline({ data, color = '#0284c7' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
