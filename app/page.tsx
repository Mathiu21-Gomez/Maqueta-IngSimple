"use client"

import * as React from "react"
import { AppShell } from "@/components/app-shell"
import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { DashboardFilters } from "@/components/dashboard/filters"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { TrendChart, RiskDistributionChart, CategoryChart, SedeChart } from "@/components/dashboard/charts"
import { CriticalSuppliers } from "@/components/dashboard/critical-suppliers"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { tendenciaMensual } from "@/lib/mock-data"
import { getProveedores } from "@/lib/services/proveedores"
import { getPlanesVencidos, getPlanesAccion } from "@/lib/services/planes-accion"
import type { Proveedor, PlanAccion } from "@/lib/types"

interface FilterState {
  sede: string
  periodo: string
  categoria: string
  estado: string
  criticidad: string
}

export default function DashboardPage() {
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [planesVencidos, setPlanesVencidos] = React.useState<PlanAccion[]>([])
  const [planesAccion, setPlanesAccion] = React.useState<PlanAccion[]>([])
  const [filters, setFilters] = React.useState<FilterState>({
    sede: "all",
    periodo: "all",
    categoria: "all",
    estado: "all",
    criticidad: "all",
  })

  React.useEffect(() => {
    getProveedores().then(setProveedores)
    getPlanesVencidos().then(setPlanesVencidos)
    getPlanesAccion().then(setPlanesAccion)
  }, [])

  const filteredProveedores = React.useMemo(() => {
    return proveedores.filter(p => {
      if (filters.sede !== "all" && p.sede !== filters.sede) return false
      if (filters.categoria !== "all" && p.categoria !== filters.categoria) return false
      if (filters.estado !== "all" && p.estado !== filters.estado) return false
      if (filters.criticidad !== "all" && p.criticidad !== filters.criticidad) return false
      return true
    })
  }, [proveedores, filters])

  const kpis = React.useMemo(() => {
    const evaluados = filteredProveedores.filter(p =>
      p.estado === "Evaluado" || p.estado === "Con plan de acción" || p.estado === "Crítico"
    ).length
    const pendientes = filteredProveedores.filter(p => p.estado === "Pendiente").length
    const bajaCalificacion = filteredProveedores.filter(p => p.calificacionActual < 3.0).length
    const planesActivos = planesAccion.filter(p => p.estado === "Pendiente" || p.estado === "En progreso").length
    return {
      proveedoresEvaluados: evaluados,
      evaluacionesPendientes: pendientes,
      proveedoresBajaCalificacion: bajaCalificacion,
      planesAccionActivos: planesActivos,
      cumplimientoPeriodo:
        filteredProveedores.length > 0
          ? Math.round((evaluados / filteredProveedores.length) * 100)
          : 0,
    }
  }, [filteredProveedores, planesAccion])

  const criticalSuppliers = filteredProveedores.filter(
    p => p.criticidad === "Alta" || p.calificacionActual < 3.0
  )

  const pendingEvaluations = filteredProveedores.filter(p => p.estado === "Pendiente")

  const distribucionRiesgo = React.useMemo(() => {
    const total = filteredProveedores.length || 1
    const counts = {
      baja: filteredProveedores.filter(p => p.criticidad === "Baja").length,
      media: filteredProveedores.filter(p => p.criticidad === "Media").length,
      alta: filteredProveedores.filter(p => p.criticidad === "Alta").length,
    }
    return [
      { nivel: "Bajo", cantidad: counts.baja, porcentaje: Math.round((counts.baja / total) * 100) },
      { nivel: "Medio", cantidad: counts.media, porcentaje: Math.round((counts.media / total) * 100) },
      { nivel: "Alto", cantidad: counts.alta, porcentaje: Math.round((counts.alta / total) * 100) },
    ]
  }, [filteredProveedores])

  const calificacionPorCategoria = React.useMemo(() => {
    const byCategoria = new Map<string, number[]>()
    for (const p of filteredProveedores) {
      if (!byCategoria.has(p.categoria)) byCategoria.set(p.categoria, [])
      byCategoria.get(p.categoria)!.push(p.calificacionActual)
    }
    return Array.from(byCategoria.entries()).map(([categoria, scores]) => ({
      categoria,
      promedio: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
  }, [filteredProveedores])

  const calificacionPorSede = React.useMemo(() => {
    const bySede = new Map<string, number[]>()
    for (const p of filteredProveedores) {
      if (!bySede.has(p.sede)) bySede.set(p.sede, [])
      bySede.get(p.sede)!.push(p.calificacionActual)
    }
    return Array.from(bySede.entries()).map(([sede, scores]) => ({
      sede,
      promedio: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
  }, [filteredProveedores])

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <WelcomeHeader
            proveedoresActivos={filteredProveedores.length}
            planesPendientes={kpis.planesAccionActivos}
            evaluacionesPendientes={kpis.evaluacionesPendientes}
          />
          <DashboardFilters filters={filters} onFilterChange={setFilters} />
          <div className="grid gap-6 lg:grid-cols-2">
            <CriticalSuppliers suppliers={criticalSuppliers} />
            <AlertsPanel overdueActions={planesVencidos} pendingEvaluations={pendingEvaluations} />
          </div>
          <KPICards data={kpis} />
          <div className="grid gap-6 lg:grid-cols-3">
            <TrendChart data={tendenciaMensual} />
            <RiskDistributionChart data={distribucionRiesgo} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <CategoryChart data={calificacionPorCategoria} />
            <SedeChart data={calificacionPorSede} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
