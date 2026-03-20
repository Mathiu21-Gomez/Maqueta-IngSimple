"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Calendar, Download, Plus, Search } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import {
  EditorialDataTable,
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialToolbar,
} from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getEvaluaciones } from "@/lib/services/evaluaciones"
import { getProveedores } from "@/lib/services/proveedores"
import type { Evaluacion, Proveedor } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = React.useState<Evaluacion[]>([])
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterEstado, setFilterEstado] = React.useState("all")
  const [filterPeriodo, setFilterPeriodo] = React.useState("all")

  React.useEffect(() => {
    Promise.all([getEvaluaciones(), getProveedores()]).then(([evaluacionesData, proveedoresData]) => {
      setEvaluaciones(evaluacionesData)
      setProveedores(proveedoresData)
    })
  }, [])

  const filteredEvaluaciones = React.useMemo(() => {
    return evaluaciones.filter((evaluacion) => {
      if (filterEstado !== "all" && evaluacion.estado.toLowerCase().replace(/ /g, "-") !== filterEstado) {
        return false
      }

      if (filterPeriodo !== "all") {
        const periodoMap: Record<string, string> = {
          "q1-2026": "Q1 2026",
          "q4-2025": "Q4 2025",
          "q3-2025": "Q3 2025",
        }

        if (evaluacion.periodo !== periodoMap[filterPeriodo]) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const proveedor = proveedores.find((item) => item.id === evaluacion.proveedorId)
        const query = searchQuery.toLowerCase()
        const matchNombre = proveedor?.nombre.toLowerCase().includes(query)
        const matchEvaluador = evaluacion.evaluador.toLowerCase().includes(query)
        const matchPeriodo = evaluacion.periodo.toLowerCase().includes(query)

        if (!matchNombre && !matchEvaluador && !matchPeriodo) {
          return false
        }
      }

      return true
    })
  }, [evaluaciones, filterEstado, filterPeriodo, searchQuery, proveedores])

  const kpis = React.useMemo(
    () => ({
      total: filteredEvaluaciones.length,
      completadas: filteredEvaluaciones.filter((evaluacion) => evaluacion.estado === "Evaluado").length,
      enProceso: filteredEvaluaciones.filter((evaluacion) => evaluacion.estado === "En evaluación").length,
      pendientes: filteredEvaluaciones.filter((evaluacion) => evaluacion.estado === "Pendiente").length,
    }),
    [filteredEvaluaciones],
  )

  const formatDate = React.useCallback(
    (date: string) =>
      new Date(date).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [],
  )

  const riskBadgeClassName = React.useCallback(
    (risk: Evaluacion["riesgoOperacional"]) =>
      cn(
        "rounded-full border-0 px-2.5 py-1 text-[0.68rem] font-medium",
        risk === "Alta" && "bg-destructive/15 text-destructive",
        risk === "Media" && "bg-[oklch(0.75_0.15_70/0.15)] text-[oklch(0.65_0.15_70)]",
        risk === "Baja" && "bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)]",
      ),
    [],
  )

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <EditorialPageHeader
            eyebrow="Seguimiento institucional"
            title="Gestion de Evaluaciones"
            description="Mismo tono editorial para leer volumen, estado y contexto sin caer en una grilla generica."
            meta={[
              { label: "Evaluaciones", value: evaluaciones.length },
              { label: "En evaluacion", value: evaluaciones.filter((evaluacion) => evaluacion.estado === "En evaluación").length, tone: "warning" },
              { label: "Pendientes", value: evaluaciones.filter((evaluacion) => evaluacion.estado === "Pendiente").length, tone: "info" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 gap-2 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]" asChild>
                  <Link href="/evaluaciones/nueva">
                    <Plus className="h-4 w-4" />
                    Nueva Evaluacion
                  </Link>
                </Button>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EditorialMetricCard label="Total" value={kpis.total} detail="Vista actual" tone="default" />
            <EditorialMetricCard label="Completadas" value={kpis.completadas} detail="Listas para auditoria" tone="success" />
            <EditorialMetricCard label="En proceso" value={kpis.enProceso} detail="Con captura activa" tone="warning" />
            <EditorialMetricCard label="Pendientes" value={kpis.pendientes} detail="Requieren calendarizacion" tone="info" />
          </div>

          <EditorialToolbar
            eyebrow="Filtros operativos"
            title="Acota la lista por periodo, estado o busqueda abierta"
            description="Las acciones se mantienen visibles para revisar lotes sin perder contexto."
          >
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar evaluacion..."
                className="h-11 rounded-full border-border/70 bg-card/90 pl-9 shadow-xs"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/90 shadow-xs sm:min-w-[9.5rem] sm:w-auto">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="q1-2026">Q1 2026</SelectItem>
                <SelectItem value="q4-2025">Q4 2025</SelectItem>
                <SelectItem value="q3-2025">Q3 2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/90 shadow-xs sm:min-w-[10.5rem] sm:w-auto">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="evaluado">Evaluado</SelectItem>
                <SelectItem value="en-evaluación">En evaluación</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </EditorialToolbar>

          <EditorialDataTable>
            {filteredEvaluaciones.length === 0 ? (
              <EditorialEmptyState
                icon={Search}
                title="Sin evaluaciones visibles"
                description="No hay registros que coincidan con los filtros activos. Proba abrir el periodo o limpiar el estado."
                tone="info"
                className="border-0 bg-transparent py-14"
              />
            ) : (
              <div className="w-full min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluación</TableHead>
                      <TableHead>Contexto</TableHead>
                      <TableHead>Riesgo</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="w-[14rem] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluaciones.map((evaluation) => {
                      const proveedor = proveedores.find((item) => item.id === evaluation.proveedorId)

                      return (
                        <TableRow className="border-b border-border/45 transition-colors hover:bg-[color-mix(in_oklab,var(--color-card)_86%,white)]" key={evaluation.id}>
                          <TableCell>
                            <div className="min-w-[15rem] py-1">
                              <Link
                                href={`/evaluaciones/${evaluation.id}`}
                                className="group inline-flex max-w-full items-start gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-base font-semibold text-card-foreground">
                                      {proveedor?.nombre || "Proveedor"}
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                  </div>
                                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground/75">
                                    {evaluation.periodo}
                                  </p>
                                </div>
                              </Link>

                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                                  {proveedor?.categoria || "Sin categoría"}
                                </Badge>
                                <Link
                                  href={`/proveedores/${evaluation.proveedorId}`}
                                  className="rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
                                >
                                  Ver proveedor
                                </Link>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5 py-1">
                              <p className="text-sm text-card-foreground">{evaluation.evaluador}</p>
                              <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                                {evaluation.sede}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2 py-1">
                              <Badge variant="outline" className={riskBadgeClassName(evaluation.riesgoOperacional)}>
                                Operacional {evaluation.riesgoOperacional}
                              </Badge>
                              <div>
                                <Badge variant="outline" className={riskBadgeClassName(evaluation.riesgoReputacional)}>
                                  Reputacional {evaluation.riesgoReputacional}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[8rem] py-1">
                              <span
                                className={cn(
                                  "text-2xl font-semibold tabular-nums tracking-[-0.04em]",
                                  evaluation.calificacion >= 4 && "text-[oklch(0.5_0.15_155)]",
                                  evaluation.calificacion >= 3 && evaluation.calificacion < 4 && "text-[oklch(0.65_0.15_70)]",
                                  evaluation.calificacion < 3 && "text-destructive",
                                )}
                              >
                                {evaluation.calificacion.toFixed(1)}
                              </span>
                              <div className="mt-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "rounded-full px-2.5 py-1 font-medium",
                                    evaluation.estado === "Evaluado" && "bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)]",
                                    evaluation.estado === "En evaluación" && "bg-accent/15 text-accent",
                                    evaluation.estado === "Pendiente" && "bg-muted text-muted-foreground",
                                  )}
                                >
                                  {evaluation.estado}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 py-1 text-sm">
                              <p className="text-card-foreground">{formatDate(evaluation.fecha)}</p>
                              <p className="text-muted-foreground">Registro {evaluation.periodo}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 py-1">
                              <Button variant="outline" size="sm" className="rounded-full border-primary/15 bg-card/85" asChild>
                                <Link href={`/evaluaciones/${evaluation.id}`}>Detalle</Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="rounded-full border border-border/60 bg-card/80" asChild>
                                <Link href={`/proveedores/${evaluation.proveedorId}`}>
                                  Proveedor
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </EditorialDataTable>
        </div>
      </div>
    </AppShell>
  )
}
