"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart"

interface ChartDataPoint {
  time: number;
  wpm: number;
}

interface ChartLineDefaultProps {
  data?: ChartDataPoint[];
}

const chartConfig = {
  wpm: {
    label: "WPM",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartLineDefault({ data = [] }: ChartLineDefaultProps) {
  return (

        <ChartContainer config={chartConfig} className="w-full h-full z-5">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, 60]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="wpm"
              type="natural"
              stroke="var(--color-wpm)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              animationDuration={100}
            />
          </LineChart>
        </ChartContainer>

  )
}
