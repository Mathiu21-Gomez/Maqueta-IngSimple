"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  chartTokens,
  EditorialChartCard as DashboardChartCard,
  formatPercent,
  formatScore,
  getRiskTone,
} from "@/components/charts/editorial-chart"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

interface TrendChartProps {
  data: Array<{ mes: string; evaluaciones: number; calificacionPromedio: number }>
}

interface RiskDistributionProps {
  data: Array<{ nivel: string; cantidad: number; porcentaje: number }>
}

interface CategoryChartProps {
  data: Array<{ categoria: string; promedio: number }>
}

interface SedeChartProps {
  data: Array<{ sede: string; promedio: number }>
}

const trendConfig = {
  evaluaciones: {
    label: "Evaluaciones",
    color: chartTokens.area,
  },
  calificacionPromedio: {
    label: "Calificación promedio",
    color: chartTokens.line,
  },
} satisfies ChartConfig

const riskConfig = {
  porcentaje: {
    label: "Participación",
    color: chartTokens.bar,
  },
  cantidad: {
    label: "Proveedores",
    color: chartTokens.line,
  },
} satisfies ChartConfig

const categoryConfig = {
  promedio: {
    label: "Promedio",
    color: chartTokens.bar,
  },
} satisfies ChartConfig

const sedeConfig = {
  promedio: {
    label: "Promedio",
    color: chartTokens.campus,
  },
} satisfies ChartConfig

function LastPointDot(props: {
  cx?: number
  cy?: number
  index?: number
  dataLength: number
  color: string
}) {
  const { cx, cy, index, dataLength, color } = props

  if (cx === undefined || cy === undefined || index === undefined) {
    return null
  }

  if (index !== dataLength - 1) {
    return <circle cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1.5} />
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill="white" fillOpacity={0.88} stroke={color} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
    </g>
  )
}

export function TrendChart({ data }: TrendChartProps) {
  const gradientId = React.useId().replace(/:/g, "")
  const latest = data.at(-1)
  const latestValue = latest ? `${latest.evaluaciones}` : "0"
  const latestHint = latest ? `${formatScore(latest.calificacionPromedio)} / 5 en ${latest.mes}` : "Sin registros"

  return (
    <DashboardChartCard
      eyebrow="Evolucion mensual"
      title="Tendencia de Evaluaciones"
      description="Area chart editorial para leer volumen y calidad en la misma vista, sin perder la meta minima de desempeno."
      actionLabel="Ultimo corte"
      actionValue={latestValue}
      actionHint={latestHint}
      className="col-span-2"
    >
      <div className="rounded-[1.4rem] border border-white/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_88%,white)_0%,color-mix(in_oklab,var(--color-secondary)_22%,white)_100%)] p-4 shadow-inner shadow-white/50">
        <ChartContainer config={trendConfig} className="h-[320px] w-full">
          <ComposedChart data={data} accessibilityLayer margin={{ top: 18, right: 18, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={`trend-area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTokens.area} stopOpacity={0.34} />
                <stop offset="55%" stopColor={chartTokens.area} stopOpacity={0.14} />
                <stop offset="100%" stopColor={chartTokens.area} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={chartTokens.grid} strokeDasharray="4 10" />

            <XAxis
              dataKey="mes"
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />

            <YAxis
              yAxisId="left"
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 5]}
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />

            <ChartTooltip
              cursor={{ stroke: chartTokens.axis, strokeDasharray: "4 6", strokeOpacity: 0.45 }}
              content={<ChartTooltipContent indicator="line" className="bg-white/92 backdrop-blur-sm" />}
            />

            <ReferenceLine
              yAxisId="right"
              y={3}
              stroke={chartTokens.warning}
              strokeDasharray="7 5"
              strokeWidth={1.5}
              label={{
                value: "Meta 3.0",
                position: "insideTopRight",
                fill: chartTokens.warning,
                fontSize: 11,
              }}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="evaluaciones"
              stroke={chartTokens.area}
              strokeWidth={2.5}
              fill={`url(#trend-area-${gradientId})`}
              fillOpacity={1}
              dot={false}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="calificacionPromedio"
              stroke={chartTokens.line}
              strokeWidth={3}
              dot={(dotProps: { cx?: number; cy?: number; index?: number }) => (
                <LastPointDot
                  key={`trend-dot-${dotProps.index}`}
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  index={dotProps.index}
                  dataLength={data.length}
                  color={chartTokens.line}
                />
              )}
              activeDot={{ r: 6, fill: chartTokens.line, stroke: "white", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </DashboardChartCard>
  )
}

export function RiskDistributionChart({ data }: RiskDistributionProps) {
  const chartId = React.useId().replace(/:/g, "")
  const total = data.reduce((acc, item) => acc + item.cantidad, 0)
  const dominantRisk = [...data].sort((left, right) => right.cantidad - left.cantidad)[0]

  return (
    <DashboardChartCard
      eyebrow="Mapa de criticidad"
      title="Distribucion de Riesgo"
      description="Mixed chart vertical para contrastar el peso porcentual de cada nivel con la cantidad real de proveedores afectados."
      actionLabel="Nivel dominante"
      actionValue={dominantRisk ? formatPercent(dominantRisk.porcentaje) : "0%"}
      actionHint={dominantRisk ? `${dominantRisk.nivel} · ${dominantRisk.cantidad} proveedores` : "Sin datos"}
    >
      <div className="rounded-[1.4rem] border border-white/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_88%,white)_0%,color-mix(in_oklab,var(--color-secondary)_18%,white)_100%)] p-4 shadow-inner shadow-white/45">
        <ChartContainer config={riskConfig} className="h-[290px] w-full">
          <ComposedChart data={data} accessibilityLayer margin={{ top: 18, right: 8, left: -6, bottom: 6 }}>
            <defs>
              {data.map((item) => (
                <linearGradient
                  key={item.nivel}
                  id={`risk-bar-${chartId}-${item.nivel}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={getRiskTone(item.nivel).solid} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={getRiskTone(item.nivel).solid} stopOpacity={0.64} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} stroke={chartTokens.grid} strokeDasharray="4 10" />

            <XAxis
              dataKey="nivel"
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis
              yAxisId="left"
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" className="bg-white/92 backdrop-blur-sm" />}
            />

            <Bar yAxisId="left" dataKey="porcentaje" radius={[16, 16, 8, 8]} barSize={46}>
              {data.map((item) => (
                <Cell
                  key={item.nivel}
                  fill={`url(#risk-bar-${chartId}-${item.nivel})`}
                  stroke={getRiskTone(item.nivel).solid}
                  strokeWidth={1.25}
                />
              ))}
              <LabelList
                dataKey="porcentaje"
                position="top"
                offset={12}
                formatter={(value: number) => formatPercent(value)}
                style={{ fill: chartTokens.muted, fontSize: 12, fontWeight: 600 }}
              />
            </Bar>

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cantidad"
              stroke={chartTokens.line}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartTokens.line, stroke: "white", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartTokens.line, stroke: "white", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div
            key={item.nivel}
            className="rounded-[1.15rem] border border-white/60 px-3 py-3 shadow-sm"
            style={{ backgroundColor: getRiskTone(item.nivel).soft }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {item.nivel}
              </span>
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getRiskTone(item.nivel).solid }}
              />
            </div>
            <p className="mt-3 font-display text-2xl leading-none tracking-[-0.04em] text-card-foreground">
              {item.cantidad}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{formatPercent(item.porcentaje)} del total</p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        {total} proveedores contemplados en la distribucion actual.
      </p>
    </DashboardChartCard>
  )
}

export function CategoryChart({ data }: CategoryChartProps) {
  const patternId = React.useId().replace(/:/g, "")
  const sortedData = [...data].sort((left, right) => right.promedio - left.promedio)
  const leader = sortedData[0]
  const underTarget = sortedData.filter((item) => item.promedio < 4).length

  return (
    <DashboardChartCard
      eyebrow="Clasificacion comparativa"
      title="Calificacion por Categoria"
      description="Horizontal bar inspirado en lenguaje editorial para comparar rapido que servicios sostienen el promedio y cuales piden atencion."
      actionLabel="Categoria lider"
      actionValue={leader ? formatScore(leader.promedio) : "0.0"}
      actionHint={leader ? leader.categoria : "Sin categorias"}
      className="col-span-2"
    >
      <div className="rounded-[1.4rem] border border-white/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_16%,white)_100%)] p-4 shadow-inner shadow-white/45">
        <ChartContainer config={categoryConfig} className="h-[320px] w-full">
          <BarChart data={sortedData} layout="vertical" accessibilityLayer margin={{ top: 8, right: 26, left: 12, bottom: 8 }}>
            <defs>
              <pattern
                id={`category-bars-${patternId}`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-45)"
              >
                <rect width="8" height="8" fill={chartTokens.bar} fillOpacity={0.16} />
                <rect width="2" height="8" fill={chartTokens.bar} fillOpacity={0.95} />
              </pattern>
            </defs>

            <CartesianGrid horizontal stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />

            <XAxis
              type="number"
              domain={[0, 5]}
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />

            <YAxis
              dataKey="categoria"
              type="category"
              width={110}
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <ChartTooltip
              cursor={{ fill: chartTokens.soft, fillOpacity: 0.5 }}
              content={<ChartTooltipContent hideLabel className="bg-white/92 backdrop-blur-sm" />}
            />

            <ReferenceLine
              x={4}
              stroke={chartTokens.warning}
              strokeDasharray="7 5"
              strokeWidth={1.35}
              label={{
                value: "Objetivo 4.0",
                position: "insideTopRight",
                fill: chartTokens.warning,
                fontSize: 11,
              }}
            />

            <Bar
              dataKey="promedio"
              radius={[0, 16, 16, 0]}
              barSize={24}
              fill={`url(#category-bars-${patternId})`}
              stroke={chartTokens.bar}
              strokeWidth={1.25}
            >
              <LabelList
                dataKey="promedio"
                position="right"
                offset={10}
                formatter={(value: number) => formatScore(value)}
                style={{ fill: chartTokens.muted, fontSize: 12, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        {underTarget} categorias quedan por debajo del umbral de 4.0 en el corte visible.
      </p>
    </DashboardChartCard>
  )
}

export function SedeChart({ data }: SedeChartProps) {
  const patternId = React.useId().replace(/:/g, "")
  const sortedByScore = [...data].sort((left, right) => right.promedio - left.promedio)
  const bestSede = sortedByScore[0]
  const overall = data.length > 0 ? data.reduce((acc, item) => acc + item.promedio, 0) / data.length : 0

  return (
    <DashboardChartCard
      eyebrow="Lectura territorial"
      title="Calificacion por Sede"
      description="Bar chart con textura tipo EvilCharts para resaltar campus fuertes y sostener una lectura clara del promedio general."
      actionLabel="Mejor sede"
      actionValue={bestSede ? formatScore(bestSede.promedio) : "0.0"}
      actionHint={bestSede ? bestSede.sede : "Sin sedes"}
    >
      <div className="rounded-[1.4rem] border border-white/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_16%,white)_100%)] p-4 shadow-inner shadow-white/45">
        <ChartContainer config={sedeConfig} className="h-[320px] w-full">
          <BarChart data={data} accessibilityLayer margin={{ top: 14, right: 10, left: -8, bottom: 12 }}>
            <defs>
              <pattern
                id={`sede-bars-${patternId}`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-45)"
              >
                <rect width="8" height="8" fill={chartTokens.campus} fillOpacity={0.14} />
                <rect width="2" height="8" fill={chartTokens.campus} fillOpacity={0.95} />
              </pattern>
            </defs>

            <CartesianGrid stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />

            <XAxis
              dataKey="sede"
              stroke={chartTokens.axis}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              angle={-28}
              textAnchor="end"
              height={70}
            />

            <YAxis
              domain={[0, 5]}
              stroke={chartTokens.axis}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />

            <ChartTooltip
              cursor={{ fill: chartTokens.soft, fillOpacity: 0.45 }}
              content={<ChartTooltipContent hideLabel className="bg-white/92 backdrop-blur-sm" />}
            />

            <ReferenceLine
              y={Number(overall.toFixed(1))}
              stroke={chartTokens.line}
              strokeDasharray="7 5"
              strokeWidth={1.35}
              label={{
                value: `Promedio ${formatScore(overall)}`,
                position: "insideTopRight",
                fill: chartTokens.line,
                fontSize: 11,
              }}
            />

            <Bar
              dataKey="promedio"
              radius={[18, 18, 0, 0]}
              barSize={42}
              fill={`url(#sede-bars-${patternId})`}
              stroke={chartTokens.campus}
              strokeWidth={1.25}
            >
              <LabelList
                dataKey="promedio"
                position="top"
                offset={10}
                formatter={(value: number) => formatScore(value)}
                style={{ fill: chartTokens.muted, fontSize: 12, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </DashboardChartCard>
  )
}
