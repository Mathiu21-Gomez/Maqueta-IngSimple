"use client"

import { EditorialMetricCard } from "@/components/editorial/ui"
import {
  Users,
  ClipboardList,
  AlertTriangle,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon: LucideIcon
  variant?: "default" | "warning" | "danger" | "success"
}

function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  variant = "default",
}: KPICardProps) {
  const trendLabel =
    trend && trendValue
      ? `${trend === "up" ? "Sube" : trend === "down" ? "Baja" : "Estable"} ${trendValue}`
      : undefined

  const detail = [trendLabel, subtitle].filter(Boolean).join(" · ")

  return (
    <EditorialMetricCard label={title} value={value} detail={detail} icon={Icon} tone={variant} />
  )
}

interface KPICardsProps {
  data: {
    proveedoresEvaluados: number
    evaluacionesPendientes: number
    proveedoresBajaCalificacion: number
    planesAccionActivos: number
    cumplimientoPeriodo: number
  }
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KPICard
        title="Proveedores Evaluados"
        value={data.proveedoresEvaluados}
        trend="up"
        trendValue="+12%"
        subtitle="vs. periodo anterior"
        icon={Users}
        variant="success"
      />
      <KPICard
        title="Evaluaciones Pendientes"
        value={data.evaluacionesPendientes}
        trend="down"
        trendValue="-3"
        subtitle="este mes"
        icon={ClipboardList}
        variant="warning"
      />
      <KPICard
        title="Proveedores Baja Calificación"
        value={data.proveedoresBajaCalificacion}
        trend="up"
        trendValue="+1"
        subtitle="requieren atención"
        icon={AlertTriangle}
        variant="danger"
      />
      <KPICard
        title="Planes de Acción Activos"
        value={data.planesAccionActivos}
        trend="neutral"
        trendValue="0"
        subtitle="en seguimiento"
        icon={Target}
        variant="default"
      />
      <KPICard
        title="Cumplimiento del Periodo"
        value={`${data.cumplimientoPeriodo}%`}
        trend="up"
        trendValue="+5%"
        subtitle="Q1 2026"
        icon={TrendingUp}
        variant="success"
      />
    </div>
  )
}
