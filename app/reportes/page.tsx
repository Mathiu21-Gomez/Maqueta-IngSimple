"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, FileText, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  Area,
  Cell,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import {
  calificacionPorCategoria,
  calificacionPorSede,
  tendenciaMensual,
  distribucionRiesgo,
  proveedores,
} from "@/lib/mock-data"
import {
  chartTokens,
  EditorialChartCard,
  EditorialChartFrame,
  formatPercent,
  formatScore,
  getRiskTone,
} from "@/components/charts/editorial-chart"

const comparativoProveedores = [
  { nombre: "CleanPro", actual: 4.5, anterior: 4.3 },
  { nombre: "ServiAseo", actual: 4.7, anterior: 4.5 },
  { nombre: "Buses Valle", actual: 4.6, anterior: 4.4 },
  { nombre: "Catering G.", actual: 4.4, anterior: 4.1 },
  { nombre: "Mantención I.", actual: 4.1, anterior: 3.9 },
  { nombre: "TechSolutions", actual: 3.8, anterior: 4.0 },
  { nombre: "Vigilancia C.", actual: 3.5, anterior: 3.7 },
  { nombre: "Seguridad I.", actual: 2.8, anterior: 3.5 },
]

// Datos del radar convertidos a BarChart horizontal, ordenados de mayor a menor
const criteriosData = [
  { nombre: "Calidad", valor: 4.2 },
  { nombre: "Capacidad Técnica", valor: 4.1 },
  { nombre: "Comunicación", valor: 4.0 },
  { nombre: "Precio/Valor", valor: 3.9 },
  { nombre: "Puntualidad", valor: 3.8 },
  { nombre: "Documentación", valor: 3.5 },
].sort((a, b) => b.valor - a.valor)

const matrizRiesgo = [
  { x: 1, y: 3, nombre: "Seguridad Integral", size: 100 },
  { x: 2, y: 2, nombre: "IT Solutions", size: 80 },
  { x: 1, y: 2, nombre: "Alimentación Premium", size: 90 },
  { x: 3, y: 1, nombre: "Vigilancia Corp", size: 60 },
  { x: 4, y: 1, nombre: "CleanPro", size: 40 },
  { x: 4, y: 1, nombre: "ServiAseo", size: 40 },
]

function getScatterColor(x: number, y: number) {
  if (x >= 3 && y >= 2) return chartTokens.danger
  if (x >= 3 || y >= 2) return chartTokens.warning
  return chartTokens.line
}

function getScoreTone(value: number) {
  if (value >= 4) return chartTokens.success
  if (value >= 3.5) return chartTokens.line
  if (value >= 3) return chartTokens.warning
  return chartTokens.danger
}

const IMPACTO_LABELS: Record<number, string> = { 1: "Bajo", 2: "Medio", 3: "Alto", 4: "Crítico" }
const PROB_LABELS: Record<number, string> = { 1: "Baja", 2: "Media", 3: "Alta" }

const comparativeConfig = {
  anterior: { label: "Q4 2025", color: chartTokens.axis },
  actual: { label: "Q1 2026", color: chartTokens.bar },
} satisfies ChartConfig

const criteriaConfig = {
  valor: { label: "Promedio", color: chartTokens.bar },
} satisfies ChartConfig

const trendConfig = {
  evaluaciones: { label: "Evaluaciones", color: chartTokens.area },
  calificacionPromedio: { label: "Calificación promedio", color: chartTokens.line },
} satisfies ChartConfig

const riskMatrixConfig = {
  size: { label: "Peso del contrato", color: chartTokens.line },
} satisfies ChartConfig

const categoryConfig = {
  promedio: { label: "Promedio", color: chartTokens.bar },
} satisfies ChartConfig

const sedeConfig = {
  promedio: { label: "Promedio", color: chartTokens.campus },
} satisfies ChartConfig

function SummaryMetric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  hint: string
  tone?: "default" | "success" | "warning" | "danger"
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-white/55 bg-white/60 px-4 py-4 shadow-[0_16px_32px_-24px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-sm",
        tone === "success" && "bg-[color-mix(in_oklab,var(--color-success)_10%,white)]",
        tone === "warning" && "bg-[color-mix(in_oklab,var(--color-warning)_12%,white)]",
        tone === "danger" && "bg-[color-mix(in_oklab,var(--color-destructive)_10%,white)]",
      )}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/85">{label}</p>
      <p className="mt-3 font-display text-[2.35rem] leading-none tracking-[-0.05em] text-card-foreground">{value}</p>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{hint}</p>
    </div>
  )
}

function RiskMatrixTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: { nombre: string; x: number; y: number; size: number } }> }) {
  if (!active || !payload?.[0]?.payload) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="grid min-w-[12rem] gap-2 rounded-[1rem] border border-white/60 bg-white/92 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <p className="font-semibold text-card-foreground">{point.nombre}</p>
      <div className="grid gap-1 text-muted-foreground">
        <p>Impacto: {IMPACTO_LABELS[point.x]}</p>
        <p>Probabilidad: {PROB_LABELS[point.y]}</p>
        <p>Peso relativo: {point.size}</p>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const comparePatternId = React.useId().replace(/:/g, "")
  const criteriaPatternId = React.useId().replace(/:/g, "")
  const trendGradientId = React.useId().replace(/:/g, "")
  const categoryPatternId = React.useId().replace(/:/g, "")
  const sedePatternId = React.useId().replace(/:/g, "")
  const proveedoresAltos = proveedores.filter((p) => p.calificacionActual >= 4).length
  const proveedoresBajos = proveedores.filter((p) => p.calificacionActual < 3).length
  const promedioGeneral = proveedores.reduce((acc, p) => acc + p.calificacionActual, 0) / proveedores.length
  const comparativoOrdenado = [...comparativoProveedores].sort((left, right) => right.actual - left.actual)
  const proveedoresEnMejora = comparativoProveedores.filter((item) => item.actual >= item.anterior).length
  const mayorRetroceso = [...comparativoProveedores].sort((left, right) => left.actual - left.anterior - (right.actual - right.anterior))[0]
  const criterioLider = criteriosData[0]
  const criteriosBajoMeta = criteriosData.filter((item) => item.valor < 4).length
  const ultimoPeriodo = tendenciaMensual.at(-1)
  const riesgoDominante = [...distribucionRiesgo].sort((left, right) => right.cantidad - left.cantidad)[0]
  const puntosCriticos = matrizRiesgo.filter((item) => item.x >= 3 && item.y >= 2).length
  const categoriaLider = [...calificacionPorCategoria].sort((left, right) => right.promedio - left.promedio)[0]
  const sedeLider = [...calificacionPorSede].sort((left, right) => right.promedio - left.promedio)[0]
  const promedioSedes = calificacionPorSede.reduce((acc, item) => acc + item.promedio, 0) / calificacionPorSede.length

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_88%,white)_0%,var(--color-card)_62%,color-mix(in_oklab,var(--color-secondary)_46%,white)_100%)] px-6 py-6 shadow-[0_26px_70px_-42px_color-mix(in_oklab,var(--foreground)_20%,transparent)] lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
            <div className="pointer-events-none absolute -right-20 top-8 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-accent/12 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground shadow-sm hover:bg-white/70">
                    Reportes y analítica
                  </Badge>
                  <Badge variant="secondary" className="rounded-full border border-white/50 bg-white/55 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Lenguaje visual unificado con dashboard
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="font-display text-4xl leading-none tracking-[-0.05em] text-card-foreground sm:text-[3.5rem]">
                    Reportes que se leen como una mesa editorial, no como un dump de widgets.
                  </h1>
                  <p className="max-w-[60ch] text-sm leading-7 text-muted-foreground sm:text-base">
                    La vista compara cortes, expone desvíos y deja visibles los focos críticos con el mismo pulso visual que ya definimos en el dashboard principal.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <Select defaultValue="q1-2026">
                  <SelectTrigger className="h-11 min-w-[11rem] rounded-full border-white/60 bg-white/68 px-4 shadow-sm backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2026">Q1 2026</SelectItem>
                    <SelectItem value="q4-2025">Q4 2025</SelectItem>
                    <SelectItem value="anual-2025">Anual 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-11 rounded-full border-white/65 bg-white/60 px-5 shadow-sm backdrop-blur-sm">
                  <FileText className="h-4 w-4" />
                  Generar PDF
                </Button>
                <Button className="h-11 rounded-full px-5 shadow-[0_18px_30px_-18px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
                  <Download className="h-4 w-4" />
                  Exportar datos
                </Button>
              </div>
            </div>

            <div className="relative mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="Promedio general"
                value={formatScore(promedioGeneral)}
                hint="Sube 0.2 puntos respecto al corte anterior"
                tone="success"
              />
              <SummaryMetric
                label="Alto desempeño"
                value={`${proveedoresAltos}`}
                hint="Proveedores sosteniendo 4.0 o más"
                tone="success"
              />
              <SummaryMetric
                label="Bajo desempeño"
                value={`${proveedoresBajos}`}
                hint="Casos que piden intervención inmediata"
                tone="danger"
              />
              <SummaryMetric
                label="Cumplimiento"
                value="72%"
                hint="Evaluaciones cerradas en el periodo seleccionado"
                tone="warning"
              />
            </div>

            <div className="relative mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {proveedoresEnMejora} de {comparativoProveedores.length} proveedores mejoran o sostienen su nota en el periodo.
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <EditorialChartCard
              eyebrow="Comparativa de cartera"
              title="Comparativo por Proveedor"
              description="El doble bar horizontal adopta el mismo tratamiento editorial del dashboard para dejar más legibles las subas y retrocesos del corte actual."
              actionLabel="Mayor fricción"
              actionValue={mayorRetroceso ? `${(mayorRetroceso.actual - mayorRetroceso.anterior).toFixed(1)}` : "0.0"}
              actionHint={mayorRetroceso ? `${mayorRetroceso.nombre} vs trimestre previo` : "Sin variación"}
            >
              <EditorialChartFrame>
                <ChartContainer config={comparativeConfig} className="h-[350px] w-full">
                  <BarChart data={comparativoOrdenado} layout="vertical" accessibilityLayer margin={{ top: 10, right: 18, left: 16, bottom: 10 }}>
                    <defs>
                      <pattern id={`compare-bars-${comparePatternId}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                        <rect width="8" height="8" fill={chartTokens.axis} fillOpacity={0.12} />
                        <rect width="2" height="8" fill={chartTokens.axis} fillOpacity={0.6} />
                      </pattern>
                    </defs>
                    <CartesianGrid horizontal stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />
                    <XAxis type="number" domain={[0, 5]} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1)} />
                    <YAxis dataKey="nombre" type="category" width={92} stroke={chartTokens.axis} fontSize={11} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent className="bg-white/92 backdrop-blur-sm" formatter={(value, name) => [Number(value).toFixed(1), name]} />} />
                    <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-3 pt-4 text-xs text-muted-foreground" />} />
                    <Bar dataKey="anterior" fill={`url(#compare-bars-${comparePatternId})`} stroke={chartTokens.axis} strokeWidth={1} name="Q4 2025" radius={[0, 14, 14, 0]} barSize={11} />
                    <Bar dataKey="actual" name="Q1 2026" radius={[0, 16, 16, 0]} barSize={13}>
                      {comparativoOrdenado.map((entry, index) => (
                        <Cell key={`cell-actual-${index}`} fill={entry.actual >= entry.anterior ? chartTokens.success : chartTokens.danger} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </EditorialChartFrame>
            </EditorialChartCard>

            <EditorialChartCard
              eyebrow="Criterios institucionales"
              title="Desempeño por Criterios"
              description="Las barras texturadas retoman el idioma de EvilCharts para mostrar qué frentes sostienen el promedio y cuáles todavía quedan por debajo del estándar deseado."
              actionLabel="Frentes bajo meta"
              actionValue={`${criteriosBajoMeta}`}
              actionHint={criterioLider ? `Lidera ${criterioLider.nombre} con ${formatScore(criterioLider.valor)}` : "Sin criterios"}
            >
              <EditorialChartFrame>
                <ChartContainer config={criteriaConfig} className="h-[350px] w-full">
                  <BarChart layout="vertical" data={criteriosData} accessibilityLayer margin={{ top: 10, right: 22, left: 10, bottom: 10 }}>
                    <defs>
                      {criteriosData.map((entry, index) => {
                        const tone = getScoreTone(entry.valor)

                        return (
                          <pattern key={entry.nombre} id={`criteria-bars-${criteriaPatternId}-${index}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                            <rect width="8" height="8" fill={tone} fillOpacity={0.16} />
                            <rect width="2" height="8" fill={tone} fillOpacity={0.95} />
                          </pattern>
                        )
                      })}
                    </defs>
                    <CartesianGrid horizontal stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />
                    <XAxis type="number" domain={[0, 5]} tickCount={6} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1)} />
                    <YAxis type="category" dataKey="nombre" width={126} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-white/92 backdrop-blur-sm" formatter={(value) => [Number(value).toFixed(1), "Promedio"]} />} />
                    <ReferenceLine x={4} stroke={chartTokens.warning} strokeDasharray="7 5" strokeWidth={1.5} label={{ value: "Objetivo 4.0", position: "insideTopRight", fontSize: 11, fill: chartTokens.warning }} />
                    <Bar dataKey="valor" radius={[0, 16, 16, 0]} maxBarSize={20}>
                      {criteriosData.map((entry, index) => (
                        <Cell
                          key={`cell-criterio-${index}`}
                          fill={`url(#criteria-bars-${criteriaPatternId}-${index})`}
                          stroke={getScoreTone(entry.valor)}
                          strokeWidth={1.25}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </EditorialChartFrame>
            </EditorialChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <EditorialChartCard
              eyebrow="Lectura temporal"
              title="Evolución por Periodo"
              description="La combinación de área y línea replica el bloque principal del dashboard para leer volumen y calidad sin saltar entre widgets desconectados."
              actionLabel="Último corte"
              actionValue={ultimoPeriodo ? `${ultimoPeriodo.evaluaciones}` : "0"}
              actionHint={ultimoPeriodo ? `${formatScore(ultimoPeriodo.calificacionPromedio)} / 5 en ${ultimoPeriodo.mes}` : "Sin registros"}
              className="lg:col-span-2"
            >
              <EditorialChartFrame>
                <ChartContainer config={trendConfig} className="h-[320px] w-full">
                  <ComposedChart data={tendenciaMensual} accessibilityLayer margin={{ top: 18, right: 18, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id={`report-trend-${trendGradientId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartTokens.area} stopOpacity={0.34} />
                        <stop offset="55%" stopColor={chartTokens.area} stopOpacity={0.14} />
                        <stop offset="100%" stopColor={chartTokens.area} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={chartTokens.grid} strokeDasharray="4 10" />
                    <XAxis dataKey="mes" stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickMargin={12} />
                    <YAxis yAxisId="left" stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1)} />
                    <ChartTooltip cursor={{ stroke: chartTokens.axis, strokeDasharray: "4 6", strokeOpacity: 0.45 }} content={<ChartTooltipContent className="bg-white/92 backdrop-blur-sm" />} />
                    <ChartLegend content={<ChartLegendContent className="flex-wrap justify-start gap-3 pt-4 text-xs text-muted-foreground" />} />
                    <ReferenceLine yAxisId="right" y={3} stroke={chartTokens.warning} strokeDasharray="7 5" strokeWidth={1.35} label={{ value: "Meta 3.0", position: "insideTopRight", fill: chartTokens.warning, fontSize: 11 }} />
                    <Area yAxisId="left" type="monotone" dataKey="evaluaciones" stroke={chartTokens.area} strokeWidth={2.5} fill={`url(#report-trend-${trendGradientId})`} fillOpacity={1} />
                    <Line yAxisId="right" type="monotone" dataKey="calificacionPromedio" stroke={chartTokens.line} strokeWidth={3} dot={{ r: 4, fill: chartTokens.line, stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6, fill: chartTokens.line, stroke: "white", strokeWidth: 2 }} />
                  </ComposedChart>
                </ChartContainer>
              </EditorialChartFrame>
            </EditorialChartCard>

            <EditorialChartCard
              eyebrow="Mapa de criticidad"
              title="Resumen de Riesgo"
              description="Los badges suaves y los progress rails usan la misma codificación cálida del dashboard para que la jerarquía visual siga siendo consistente."
              actionLabel="Nivel dominante"
              actionValue={riesgoDominante ? formatPercent(riesgoDominante.porcentaje) : "0%"}
              actionHint={riesgoDominante ? `${riesgoDominante.nivel} · ${riesgoDominante.cantidad} proveedores` : "Sin datos"}
            >
              <div className="grid gap-3">
                {distribucionRiesgo.map((item) => {
                  const tone = getRiskTone(item.nivel)

                  return (
                    <div key={item.nivel} className="rounded-[1.25rem] border border-white/60 px-4 py-4 shadow-sm" style={{ backgroundColor: tone.soft }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {item.nivel === "Alto" && <AlertTriangle className="h-4 w-4" style={{ color: tone.solid }} />}
                          {item.nivel === "Medio" && <AlertTriangle className="h-4 w-4" style={{ color: tone.solid }} />}
                          {item.nivel === "Bajo" && <CheckCircle2 className="h-4 w-4" style={{ color: tone.solid }} />}
                          <span className="text-sm font-semibold text-card-foreground">Riesgo {item.nivel}</span>
                        </div>
                        <Badge variant="secondary" className="rounded-full border border-white/55 bg-white/72 px-2.5 py-1 text-xs font-semibold shadow-sm">
                          {item.cantidad}
                        </Badge>
                      </div>
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/65">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.porcentaje}%`, backgroundColor: tone.solid }} />
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">{formatPercent(item.porcentaje)} del total de proveedores evaluados</p>
                    </div>
                  )
                })}
              </div>
            </EditorialChartCard>
          </div>

          <EditorialChartCard
            eyebrow="Priorización visual"
            title="Matriz de Riesgo"
            description="La matriz mantiene ejes, grilla y tooltips del sistema editorial para distinguir contratos críticos sin romper el lenguaje cálido del dashboard."
            actionLabel="Puntos críticos"
            actionValue={`${puntosCriticos}`}
            actionHint="Impacto alto con probabilidad media o alta"
          >
            <EditorialChartFrame>
              <ChartContainer config={riskMatrixConfig} className="h-[340px] w-full">
                <ScatterChart margin={{ top: 20, right: 36, bottom: 32, left: 8 }}>
                  <CartesianGrid stroke={chartTokens.grid} strokeDasharray="4 10" />
                  <XAxis dataKey="x" type="number" domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={(value) => IMPACTO_LABELS[value] ?? value} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} label={{ value: "Impacto", position: "insideBottom", offset: -12, fontSize: 12, fill: chartTokens.axis }} />
                  <YAxis dataKey="y" type="number" domain={[0.5, 3.5]} ticks={[1, 2, 3]} tickFormatter={(value) => PROB_LABELS[value] ?? value} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} label={{ value: "Probabilidad", angle: -90, position: "insideLeft", offset: 2, fontSize: 12, fill: chartTokens.axis }} />
                  <ZAxis dataKey="size" range={[80, 260]} />
                  <ChartTooltip cursor={false} content={<RiskMatrixTooltip />} />
                  <Scatter
                    data={matrizRiesgo}
                    shape={(props: { cx?: number; cy?: number; payload?: { x: number; y: number; size: number } }) => {
                      const { cx = 0, cy = 0, payload } = props
                      const color = payload ? getScatterColor(payload.x, payload.y) : chartTokens.line
                      const radius = payload ? Math.max(10, payload.size / 14) : 12

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={radius + 4} fill="white" fillOpacity={0.82} />
                          <circle cx={cx} cy={cy} r={radius} fill={color} fillOpacity={0.8} stroke={color} strokeWidth={1.5} strokeOpacity={0.9} />
                          <circle cx={cx} cy={cy} r={Math.max(3, radius / 3.5)} fill="white" fillOpacity={0.88} />
                        </g>
                      )
                    }}
                  />
                </ScatterChart>
              </ChartContainer>
            </EditorialChartFrame>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-3 py-1.5 shadow-sm">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: chartTokens.danger }} />
                Riesgo crítico
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-3 py-1.5 shadow-sm">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: chartTokens.warning }} />
                Riesgo moderado
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-3 py-1.5 shadow-sm">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: chartTokens.line }} />
                Riesgo bajo
              </div>
            </div>
          </EditorialChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <EditorialChartCard
              eyebrow="Clasificación comparativa"
              title="Desempeño por Categoría"
              description="La lectura vertical adopta fills texturados, líneas de referencia y rotulación editorial para conversar con las piezas del dashboard en lugar de parecer otra librería."
              actionLabel="Categoría líder"
              actionValue={categoriaLider ? formatScore(categoriaLider.promedio) : "0.0"}
              actionHint={categoriaLider ? categoriaLider.categoria : "Sin categorías"}
            >
              <EditorialChartFrame>
                <ChartContainer config={categoryConfig} className="h-[320px] w-full">
                  <BarChart data={calificacionPorCategoria} accessibilityLayer margin={{ top: 12, right: 12, left: -6, bottom: 4 }}>
                    <defs>
                      {calificacionPorCategoria.map((entry, index) => {
                        const tone = getScoreTone(entry.promedio)

                        return (
                          <pattern key={entry.categoria} id={`category-report-${categoryPatternId}-${index}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                            <rect width="8" height="8" fill={tone} fillOpacity={0.16} />
                            <rect width="2" height="8" fill={tone} fillOpacity={0.95} />
                          </pattern>
                        )
                      })}
                    </defs>
                    <CartesianGrid stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />
                    <XAxis dataKey="categoria" stroke={chartTokens.axis} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1)} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-white/92 backdrop-blur-sm" formatter={(value) => [Number(value).toFixed(1), "Promedio"]} />} />
                    <ReferenceLine y={4} stroke={chartTokens.warning} strokeDasharray="7 5" strokeWidth={1.35} label={{ value: "Objetivo 4.0", position: "insideTopRight", fill: chartTokens.warning, fontSize: 11 }} />
                    <Bar dataKey="promedio" radius={[18, 18, 0, 0]}>
                      {calificacionPorCategoria.map((entry, index) => (
                        <Cell
                          key={`cell-category-${index}`}
                          fill={`url(#category-report-${categoryPatternId}-${index})`}
                          stroke={getScoreTone(entry.promedio)}
                          strokeWidth={1.25}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </EditorialChartFrame>
            </EditorialChartCard>

            <EditorialChartCard
              eyebrow="Lectura territorial"
              title="Desempeño por Sede"
              description="El chart por campus usa la misma textura diagonal, ejes suaves y línea de referencia para que la comparación territorial respire igual que en el dashboard."
              actionLabel="Mejor sede"
              actionValue={sedeLider ? formatScore(sedeLider.promedio) : "0.0"}
              actionHint={sedeLider ? sedeLider.sede : "Sin sedes"}
            >
              <EditorialChartFrame>
                <ChartContainer config={sedeConfig} className="h-[320px] w-full">
                  <BarChart data={calificacionPorSede} accessibilityLayer margin={{ top: 14, right: 10, left: -8, bottom: 12 }}>
                    <defs>
                      <pattern id={`sede-report-${sedePatternId}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                        <rect width="8" height="8" fill={chartTokens.campus} fillOpacity={0.14} />
                        <rect width="2" height="8" fill={chartTokens.campus} fillOpacity={0.95} />
                      </pattern>
                    </defs>
                    <CartesianGrid stroke={chartTokens.grid} strokeDasharray="4 10" vertical={false} />
                    <XAxis dataKey="sede" stroke={chartTokens.axis} fontSize={10} tickLine={false} axisLine={false} angle={-28} textAnchor="end" height={70} />
                    <YAxis domain={[0, 5]} stroke={chartTokens.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1)} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-white/92 backdrop-blur-sm" formatter={(value) => [Number(value).toFixed(1), "Promedio"]} />} />
                    <ReferenceLine y={Number(promedioSedes.toFixed(1))} stroke={chartTokens.line} strokeDasharray="7 5" strokeWidth={1.35} label={{ value: `Promedio ${formatScore(promedioSedes)}`, position: "insideTopRight", fill: chartTokens.line, fontSize: 11 }} />
                    <Bar dataKey="promedio" radius={[18, 18, 0, 0]} barSize={42} fill={`url(#sede-report-${sedePatternId})`} stroke={chartTokens.campus} strokeWidth={1.25} />
                  </BarChart>
                </ChartContainer>
              </EditorialChartFrame>
            </EditorialChartCard>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
