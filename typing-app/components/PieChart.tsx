"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export const description = "A customizable pie chart with legend"

interface PieChartData {
  [key: string]: string | number;
}

interface ChartPieLegendProps {
  data?: PieChartData[];
  config?: ChartConfig;
  title?: string;
  description?: string;
  dataKey?: string;
  nameKey?: string;
  className?: string;
}

// Default fallback data
const defaultChartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const defaultChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLegend({
  data = defaultChartData,
  config = defaultChartConfig,
  title = "Pie Chart - Legend",
  description = "January - June 2024",
  dataKey = "visitors",
  nameKey = "browser",
  className
}: ChartPieLegendProps) {
  return (
    <Card className={`flex flex-col ${className || ''}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={data} dataKey={dataKey} />
            <ChartLegend
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Helper function to create chart config
export function createChartConfig(items: Array<{key: string, label: string, color?: string}>): ChartConfig {
  const config: ChartConfig = {};
  
  items.forEach((item, index) => {
    config[item.key] = {
      label: item.label,
      color: item.color || `var(--chart-${index + 1})`,
    };
  });
  
  return config;
}

// Helper function to create chart data with fill colors
export function createChartData(items: Array<{[key: string]: string | number}>, colorPrefix = "var(--color-"): PieChartData[] {
  return items.map(item => ({
    ...item,
    fill: `${colorPrefix}${Object.keys(item)[0]})`
  }));
}

// Export types for external use
export type { ChartPieLegendProps, PieChartData };
