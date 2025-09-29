"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const fetchStats = async (): Promise<StatsData> => {
  const safeNum = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : 0;

  try {
    // If the page is loaded with ?random=true, return temporary random values for development/demo.
    if (typeof window !== "undefined" && window.location.search.includes("random=true")) {
      const randInt = (min = 0, max = 1000) =>
        Math.floor(Math.random() * (max - min + 1)) + min;
      const randFloat = (min = 0, max = 10) =>
        Math.random() * (max - min) + min;

      return {
        pageviews: { value: randInt(100, 200), prev: randInt(100, 200) },
        visitors: { value: randInt(50, 150), prev: randInt(50, 150) },
        visits: { value: randInt(50, 150), prev: randInt(50, 150) },
        bounces: { value: randInt(10, 80), prev: randInt(10, 80) },
        // avg minutes per visit (float)
        totaltime: { value: Number(randFloat(0.5, 8).toFixed(2)), prev: Number(randFloat(0.5, 8).toFixed(2)) },
      };
    }
    // Client-side fetch to the API route that returns Umami stats
    const res = await fetch(`/api/fetch-umami-stats?random=true`);
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }
    const data = await res.json();

    // Normalize and provide safe defaults for missing values
    const pageviews = {
      value: safeNum(data?.pageviews?.value),
      prev: safeNum(data?.pageviews?.prev),
    };
    const visitors = {
      value: safeNum(data?.visitors?.value),
      prev: safeNum(data?.visitors?.prev),
    };
    const visits = {
      value: safeNum(data?.visits?.value),
      prev: safeNum(data?.visits?.prev),
    };
    const bounces = {
      value: safeNum(data?.bounces?.value),
      prev: safeNum(data?.bounces?.prev),
    };

    // totaltime may be returned as total seconds; the original code stored minutes.
    const totaltimeRaw = data?.totaltime ?? null;
    let totaltimeValue = 0;
    let totaltimePrev = 0;
    if (totaltimeRaw && typeof totaltimeRaw === "object") {
      // support either directly minutes or seconds -> try both
      totaltimeValue = safeNum(totaltimeRaw.value);
      totaltimePrev = safeNum(totaltimeRaw.prev);
    }

    // If totaltime looks like total seconds rather than minutes, and visits > 0, compute average minutes
    if (totaltimeValue === 0 && typeof data?.totaltime === "number") {
      const totalSeconds = safeNum(data.totaltime);
      totaltimeValue = visits.value > 0 ? (totalSeconds / visits.value) / 60 : 0;
    }

    const totaltime = {
      value: totaltimeValue,
      prev: totaltimePrev,
    };

    return { pageviews, visitors, visits, bounces, totaltime };
  } catch (e) {
    // On error, return zeros so chart won't crash
    return {
      pageviews: { value: 0, prev: 0 },
      visitors: { value: 0, prev: 0 },
      visits: { value: 0, prev: 0 },
      bounces: { value: 0, prev: 0 },
      totaltime: { value: 0, prev: 0 },
    };
  }
};





type StatsData = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number }; // now in minutes
};

type UmamiStatsProps = {
  stats: StatsData;
};

const chartConfig = {
  visitor_stats: {
    label: "Visitors",
  },
  pageviews: {
    label: "Page Views",
    color: "hsl(var(--chart-1))",
  },
  visitors: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-3))",
  },
  bounces: {
    label: "Bounces",
    color: "hsl(var(--chart-4))",
  },
  totaltime: {
    label: "Average Time",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function StatsChart() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const getStats = async () => {
      const stats = await fetchStats();
      setStats(stats);
    };

    getStats();
  }, []);

  const chartData = React.useMemo(() => {
    if (!stats) return [];
    return [
      {
        type: "pageviews",
        visitors: stats.pageviews.value,
        fill: "var(--color-pageviews)",
      },
      {
        type: "visitors",
        visitors: stats.visitors.value,
        fill: "var(--color-visitors)",
      },
      {
        type: "visits",
        visitors: stats.visits.value,
        fill: "var(--color-visits)",
      },
      {
        type: "bounces",
        visitors: stats.bounces.value,
        fill: "var(--color-bounces)",
      },
      {
        type: "totaltime",
        visitors: stats.totaltime.value,
        fill: "var(--color-totaltime)",
      },
    ];
  }, [stats]);

  if (!stats) {
    return <div className="flex items-center justify-center h-full"></div>;
  }

  return (
    <ChartContainer config={chartConfig} className="">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="visitors"
          nameKey="type"
          innerRadius={70}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-5xl font-bold"
                    >
                        {chartData[2]?.visitors ?? 0}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground "
                    >
                      {chartConfig.visits.label}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
