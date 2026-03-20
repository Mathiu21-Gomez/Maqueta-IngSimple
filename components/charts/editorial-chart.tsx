"use client"

import * as React from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const chartTokens = {
  grid: "var(--color-chart-grid)",
  axis: "var(--color-chart-axis)",
  textOnColor: "var(--color-chart-foreground)",
  area: "var(--color-chart-1)",
  bar: "var(--color-chart-4)",
  line: "var(--color-chart-5)",
  campus: "var(--color-chart-2)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-destructive)",
  border: "var(--color-border)",
  muted: "var(--color-muted-foreground)",
  soft: "color-mix(in oklab, var(--color-secondary) 62%, white)",
  paper: "color-mix(in oklab, var(--color-card) 86%, white)",
} as const

const riskToneMap = {
  Bajo: {
    solid: chartTokens.success,
    soft: "color-mix(in oklab, var(--color-success) 16%, white)",
  },
  Medio: {
    solid: chartTokens.warning,
    soft: "color-mix(in oklab, var(--color-warning) 18%, white)",
  },
  Alto: {
    solid: chartTokens.danger,
    soft: "color-mix(in oklab, var(--color-destructive) 18%, white)",
  },
} as const

export function getRiskTone(level: string) {
  return riskToneMap[level as keyof typeof riskToneMap] ?? riskToneMap.Medio
}

export function formatScore(value: number) {
  return value.toFixed(1)
}

export function formatPercent(value: number) {
  return `${value}%`
}

export function EditorialChartCard({
  eyebrow,
  title,
  description,
  actionLabel,
  actionValue,
  actionHint,
  className,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  actionValue: string
  actionHint: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,var(--color-card)_54%,color-mix(in_oklab,var(--color-secondary)_42%,white)_100%)] shadow-[0_26px_65px_-40px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
      <div className="pointer-events-none absolute -right-16 top-10 h-36 w-36 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />

      <CardHeader className="relative gap-4 border-b border-white/45 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
        <div className="space-y-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground/85">
            {eyebrow}
          </p>
          <div className="space-y-1.5">
            <CardTitle className="font-display text-[1.7rem] leading-none tracking-[-0.04em] text-card-foreground">
              {title}
            </CardTitle>
            <CardDescription className="max-w-[40ch] text-sm leading-6 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>

        <CardAction className="col-start-2 row-span-2 rounded-[1.25rem] border border-white/55 bg-white/65 px-4 py-3 shadow-[0_16px_36px_-28px_color-mix(in_oklab,var(--foreground)_28%,transparent)] backdrop-blur-sm">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
            {actionLabel}
          </p>
          <p className="mt-2 font-display text-3xl leading-none tracking-[-0.05em] text-card-foreground">
            {actionValue}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">{actionHint}</p>
        </CardAction>
      </CardHeader>

      <CardContent className="relative px-4 pb-4 pt-5 lg:px-5">{children}</CardContent>
    </Card>
  )
}

export function EditorialChartFrame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-white/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_18%,white)_100%)] p-4 shadow-inner shadow-white/45",
        className,
      )}
    >
      {children}
    </div>
  )
}
