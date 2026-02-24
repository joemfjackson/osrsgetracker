"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { formatGP } from "@/lib/utils";

interface PriceChartProps {
  data: Array<{
    timestamp: string;
    highPrice: number | null;
    lowPrice: number | null;
  }>;
  itemName: string;
  timeframe?: string;
}

export function PriceChart({ data, timeframe }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted border border-border rounded-lg bg-surface">
        No price history available
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.highPrice !== null || d.lowPrice !== null)
    .map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullTime: new Date(d.timestamp).toLocaleString(),
      high: d.highPrice,
      low: d.lowPrice,
    }));

  // Auto-calculate tick interval to prevent label crowding
  // Aim for ~6-8 labels regardless of data length
  const tickInterval = Math.max(1, Math.floor(chartData.length / 7));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            stroke="#888"
            fontSize={11}
            tickLine={false}
            interval={timeframe === "1h" ? "preserveStartEnd" : tickInterval}
          />
          <YAxis
            stroke="#888"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => formatGP(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#252525",
              border: "1px solid #333",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            labelStyle={{ color: "#888" }}
            formatter={(value) => [`${formatGP(value as number)} gp`]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullTime || ""
            }
          />
          <Area
            type="monotone"
            dataKey="high"
            fill="rgba(255, 152, 31, 0.05)"
            stroke="transparent"
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#ff981f"
            strokeWidth={2}
            dot={false}
            name="Instant Sell"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#4dabf7"
            strokeWidth={2}
            dot={false}
            name="Instant Buy"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
