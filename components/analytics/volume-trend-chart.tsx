'use client';

import React, { useState, useId } from 'react';
import type { VolumeTrendPoint } from '@/lib/types/analytics';
import { TrendingUp, Dumbbell, Calendar, Info } from 'lucide-react';

interface VolumeTrendChartProps {
  data: VolumeTrendPoint[];
  timeRangeLabel: string;
}

export function VolumeTrendChart({ data, timeRangeLabel }: VolumeTrendChartProps) {
  const [metric, setMetric] = useState<'volume' | 'workouts'>('volume');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-surface border border-border text-center text-text-muted text-sm">
        No training trend data recorded for this period yet.
      </div>
    );
  }

  // Values based on selected metric
  const values = data.map((d) => (metric === 'volume' ? d.volumeKg : d.workoutCount));
  const maxValue = Math.max(...values, metric === 'volume' ? 1000 : 4);
  const minValue = 0;

  // Chart dimensions in SVG viewBox coordinate space
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x =
      data.length > 1
        ? paddingLeft + (index / (data.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const val = metric === 'volume' ? d.volumeKg : d.workoutCount;
    const y =
      paddingTop + chartHeight - (maxValue > 0 ? (val / maxValue) * chartHeight : 0);
    return { x, y, data: d, val };
  });

  // Smooth line path (Catmull-Rom or cubic Bezier)
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Closed area path for gradient
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const zeroY = paddingTop + chartHeight;
  const areaPath = `${linePath} L ${lastPoint.x} ${zeroY} L ${firstPoint.x} ${zeroY} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  // Y-axis tick values
  const yTicks = [0, maxValue * 0.5, maxValue];

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-7 flex flex-col gap-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Volume & Consistency Trajectory
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Progression across {timeRangeLabel}. Tap or hover points for details.
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMetric('volume');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              metric === 'volume'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Volume (kg)
          </button>
          <button
            type="button"
            onClick={() => {
              setMetric('workouts');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              metric === 'workouts'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Workouts
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-4 w-full aspect-[21/9] min-h-[220px] max-h-[300px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y Axis labels */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / (maxValue || 1)) * chartHeight;
            const formatted =
              metric === 'volume'
                ? val >= 1000
                  ? `${Math.round(val / 100) / 10}k`
                  : `${Math.round(val)}`
                : `${Math.round(val)}`;

            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#27272a"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#71717a"
                  fontFamily="monospace"
                >
                  {formatted}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            // Render every label if <= 7 points, or every 2nd/3rd if more
            const shouldRenderLabel =
              points.length <= 7 ||
              idx === 0 ||
              idx === points.length - 1 ||
              idx % Math.ceil(points.length / 6) === 0;

            if (!shouldRenderLabel) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#a1a1aa"
                fontFamily="sans-serif"
              >
                {p.data.label}
              </text>
            );
          })}

          {/* Hover Crosshair */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={zeroY}
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#22c55e"
                stroke="#0a0a0a"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Clickable/Hoverable Hit Areas */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="16"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onTouchStart={() => setHoveredIndex(idx)}
            />
          ))}
        </svg>

        {/* If no training volume recorded in this period */}
        {values.every((v) => v === 0) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-text-subtle font-mono px-3.5 py-1.5 rounded-xl bg-surface/90 border border-border/80 shadow-sm">
              No training volume recorded in this period
            </span>
          </div>
        )}

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 z-10 p-3 rounded-2xl bg-surface-raised/95 backdrop-blur-md border border-emerald-500/30 shadow-xl pointer-events-none transition-all duration-150 animate-in fade-in"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-text-primary">
                {activePoint.data.label}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-emerald-400">
                {activePoint.data.workoutCount}{' '}
                {activePoint.data.workoutCount === 1 ? 'workout' : 'workouts'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-text-muted">Volume:</div>
              <div className="font-mono font-bold text-emerald-400 text-right">
                {activePoint.data.volumeKg.toLocaleString()} kg
              </div>
              <div className="text-text-muted">Total Sets:</div>
              <div className="font-mono text-text-primary text-right">
                {activePoint.data.setsCount} sets
              </div>
              {activePoint.data.avgIntensityKg > 0 && (
                <>
                  <div className="text-text-muted">Avg Load:</div>
                  <div className="font-mono text-text-primary text-right">
                    {activePoint.data.avgIntensityKg} kg/rep
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Summary Strip under chart */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>
            Peak period volume:{' '}
            <strong className="text-text-primary font-mono">
              {Math.max(...data.map((d) => d.volumeKg)).toLocaleString()} kg
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-subtle">
          <Info className="w-3.5 h-3.5 text-accent" />
          <span>Volume excludes warmup sets</span>
        </div>
      </div>
    </div>
  );
}
