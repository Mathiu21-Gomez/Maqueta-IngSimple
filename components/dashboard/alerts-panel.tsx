"use client"

import { EditorialEmptyState, EditorialPanel, EditorialTextAction } from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Calendar
} from "lucide-react"
import Link from "next/link"
import type { PlanAccion, Proveedor } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface AlertsPanelProps {
  overdueActions: PlanAccion[]
  pendingEvaluations: Proveedor[]
}

export function AlertsPanel({ overdueActions, pendingEvaluations }: AlertsPanelProps) {
  const alerts = [
    ...overdueActions.map(action => ({
      id: action.id,
      type: "action" as const,
      title: "Plan de acción vencido",
      description: action.hallazgo,
      date: action.fechaCompromiso,
      severity: action.estado === "Escalado" ? "critical" : "warning",
      link: `/planes-accion/${action.id}`
    })),
    ...pendingEvaluations.map(supplier => ({
      id: supplier.id,
      type: "evaluation" as const,
      title: "Evaluación pendiente",
      description: supplier.nombre,
      date: supplier.fechaProximaEvaluacion,
      severity: new Date(supplier.fechaProximaEvaluacion) < new Date() ? "critical" : "info",
      link: `/evaluaciones/nueva?proveedor=${supplier.id}`
    }))
  ].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
  })

  const getIcon = (type: string, severity: string) => {
    if (severity === "critical") return AlertCircle
    if (type === "action") return Clock
    return Calendar
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-destructive/20 bg-status-destructive-soft text-destructive"
      case "warning":
        return "border-warning/20 bg-status-warning-soft text-warning"
      default:
        return "border-info/20 bg-status-info-soft text-info"
    }
  }

  return (
    <EditorialPanel
      eyebrow="Bandeja prioritaria"
      title="Alertas y Recordatorios"
      description={`${alerts.length} alertas activas para seguimiento operativo y cierre de pendientes.`}
      action={
        <Button variant="ghost" size="sm" className="rounded-full px-0 hover:bg-transparent" asChild>
          <Link href="/notificaciones">
            <EditorialTextAction>Ver todas</EditorialTextAction>
          </Link>
        </Button>
      }
    >
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <EditorialEmptyState
                icon={CheckCircle2}
                title="Sin alertas pendientes"
                description="Todas las tareas visibles estan al dia. Cuando aparezcan nuevos desvíos o recordatorios, se consolidan aca."
                tone="success"
                className="border-white/60 bg-white/30 py-10"
              />
            ) : (
              alerts.map((alert) => {
                const Icon = getIcon(alert.type, alert.severity)
                return (
                  <Link
                    key={alert.id}
                    href={alert.link}
                    className={cn(
                      "flex items-start gap-3 rounded-[1.2rem] border p-4 transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:bg-white/55",
                      getSeverityStyles(alert.severity)
                    )}
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-current/12 bg-white/60">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "shrink-0 rounded-full px-2.5 text-[10px] uppercase tracking-[0.16em]",
                            alert.severity === "critical" && "bg-destructive/20 text-destructive",
                            alert.severity === "warning" && "bg-status-warning-soft text-warning",
                            alert.severity === "info" && "bg-status-info-soft text-info"
                          )}
                        >
                          {alert.type === "action" ? "Plan de acción" : "Evaluación"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs line-clamp-1 opacity-80">
                        {alert.description}
                      </p>
                      <p className="mt-1 text-xs opacity-60">
                        {new Date(alert.date).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </ScrollArea>
    </EditorialPanel>
  )
}
