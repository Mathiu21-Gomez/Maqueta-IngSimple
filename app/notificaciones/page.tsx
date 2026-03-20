"use client"

import * as React from "react"
import { AppShell } from "@/components/app-shell"
import {
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialPanel,
} from "@/components/editorial/ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  FileWarning,
  Settings,
  Filter,
  Check,
} from "lucide-react"
import Link from "next/link"
import { getActividades } from "@/lib/services/actividades"
import { getPlanesVencidos } from "@/lib/services/planes-accion"
import { getPlanesAccion } from "@/lib/services/planes-accion"
import { getProveedores } from "@/lib/services/proveedores"
import { getEvaluaciones } from "@/lib/services/evaluaciones"
import type { Actividad, PlanAccion, Proveedor, Evaluacion } from "@/lib/types"
import { cn } from "@/lib/utils"

type Notificacion = {
  id: string
  tipo: string
  titulo: string
  descripcion: string
  fecha: string
  leida: boolean
  prioridad: string
  accion: string
}

const notificacionesBase: Notificacion[] = [
  {
    id: "notif-4",
    tipo: "sistema",
    titulo: "Recordatorio de cierre de periodo",
    descripcion: "Quedan 12 días para el cierre del periodo Q1 2026. Asegúrese de completar todas las evaluaciones pendientes.",
    fecha: "2026-03-18T10:00:00",
    leida: false,
    prioridad: "media",
    accion: "/evaluaciones",
  },
  {
    id: "notif-5",
    tipo: "plan_accion",
    titulo: "Plan de acción actualizado",
    descripcion: "Se registró avance en el plan de capacitación de Seguridad Integral SpA.",
    fecha: "2026-03-17T16:45:00",
    leida: false,
    prioridad: "baja",
    accion: "/planes-accion",
  },
  {
    id: "notif-6",
    tipo: "evaluacion",
    titulo: "Evaluación completada",
    descripcion: "La evaluación trimestral de CleanPro Servicios ha sido completada exitosamente.",
    fecha: "2026-03-17T11:20:00",
    leida: false,
    prioridad: "baja",
    accion: "/evaluaciones",
  },
]

const getNotificationIcon = (tipo: string, prioridad: string) => {
  if (prioridad === "alta") return AlertTriangle
  switch (tipo) {
    case "evaluacion": return ClipboardCheck
    case "plan_accion": return FileWarning
    case "alerta": return AlertTriangle
    default: return Bell
  }
}

const getNotificationStyles = (tipo: string, prioridad: string) => {
  if (prioridad === "alta") {
    return {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/20",
    }
  }
  switch (tipo) {
    case "evaluacion":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
        border: "border-accent/20",
      }
    case "plan_accion":
      return {
        bg: "bg-[oklch(0.75_0.15_70/0.1)]",
        text: "text-[oklch(0.65_0.15_70)]",
        border: "border-[oklch(0.75_0.15_70/0.2)]",
      }
    default:
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
      }
  }
}

export default function NotificacionesPage() {
  const [actividades, setActividades] = React.useState<Actividad[]>([])
  const [planesVencidos, setPlanesVencidos] = React.useState<PlanAccion[]>([])
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [evaluaciones, setEvaluaciones] = React.useState<Evaluacion[]>([])
  const [notificaciones, setNotificaciones] = React.useState<Notificacion[]>(notificacionesBase)

  React.useEffect(() => {
    Promise.all([getActividades(), getPlanesVencidos(), getProveedores(), getEvaluaciones()]).then(
      ([acts, planes, provs, evals]) => {
        setActividades(acts)
        setPlanesVencidos(planes)
        setProveedores(provs)
        setEvaluaciones(evals)

        // Generar notificaciones dinámicas desde el store
        const dinamicas: Notificacion[] = []

        // Planes vencidos → alerta alta
        planes.forEach((plan, i) => {
          const prov = provs.find(p => p.id === plan.proveedorId)
          dinamicas.push({
            id: `dyn-plan-${plan.id}`,
            tipo: "alerta",
            titulo: "Plan de acción vencido",
            descripcion: `El plan de acción${prov ? ` de ${prov.nombre}` : ""} ha superado la fecha compromiso sin completarse.`,
            fecha: plan.fechaActualizacion + "T09:00:00",
            leida: false,
            prioridad: "alta",
            accion: "/planes-accion",
          })
        })

        // Proveedores críticos → alerta alta
        provs.filter(p => p.criticidad === "Alta" || p.calificacionActual < 3.0).forEach((prov) => {
          dinamicas.push({
            id: `dyn-prov-${prov.id}`,
            tipo: "alerta",
            titulo: "Proveedor crítico detectado",
            descripcion: `${prov.nombre} requiere atención inmediata (calificación: ${prov.calificacionActual.toFixed(1)}).`,
            fecha: prov.fechaUltimaEvaluacion + "T14:00:00",
            leida: false,
            prioridad: "alta",
            accion: `/proveedores/${prov.id}`,
          })
        })

        // Evaluaciones pendientes → evaluacion media
        evals.filter(e => e.estado === "Pendiente").forEach((ev) => {
          const prov = provs.find(p => p.id === ev.proveedorId)
          dinamicas.push({
            id: `dyn-eval-${ev.id}`,
            tipo: "evaluacion",
            titulo: "Evaluación pendiente",
            descripcion: `${prov ? prov.nombre : "Un proveedor"} tiene una evaluación pendiente para el periodo ${ev.periodo}.`,
            fecha: ev.fecha + "T08:00:00",
            leida: false,
            prioridad: "media",
            accion: `/evaluaciones/nueva?proveedor=${ev.proveedorId}`,
          })
        })

        // Merge: dinámicas primero, luego las base
        setNotificaciones([...dinamicas, ...notificacionesBase])
      }
    )
  }, [])

  const marcarLeida = (id: string) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const marcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <EditorialPageHeader
            eyebrow="Centro operativo"
            title="Notificaciones"
            description="Alertas, recordatorios y actividad reciente bajo una misma jerarquía visual, sin paneles utilitarios sueltos."
            meta={[
              { label: "No leidas", value: noLeidas, tone: noLeidas > 0 ? "danger" : "success" },
              { label: "Alertas", value: notificaciones.filter((item) => item.tipo === "alerta").length, tone: "warning" },
              { label: "Actividad", value: actividades.length, tone: "info" },
            ]}
            actions={
              <>
                <Button variant="outline" size="sm" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2" onClick={marcarTodasLeidas}>
                  <Check className="h-4 w-4" />
                  Marcar todas como leidas
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-primary/15 bg-card/80" aria-label="Configuración de notificaciones">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <EditorialMetricCard label="Pendientes" value={noLeidas} detail="Items sin revisar" tone={noLeidas > 0 ? "danger" : "success"} />
            <EditorialMetricCard label="Planes vencidos" value={planesVencidos.length} detail="Casos con urgencia operativa" tone="danger" />
            <EditorialMetricCard label="Proveedores criticos" value={proveedores.filter((item) => item.criticidad === "Alta").length} detail="Casos con seguimiento continuo" tone="warning" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="todas" className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="todas" className="gap-2">
                      Todas
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {notificaciones.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="no-leidas" className="gap-2">
                      No leídas
                      {noLeidas > 0 && (
                        <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-accent">
                          {noLeidas}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="alertas">Alertas</TabsTrigger>
                    <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </Button>
                </div>

                <TabsContent value="todas" className="space-y-0">
                  <Card className="border-border/50">
                    <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <div className="divide-y divide-border">
                          {notificaciones.map((notif) => {
                            const Icon = getNotificationIcon(notif.tipo, notif.prioridad)
                            const styles = getNotificationStyles(notif.tipo, notif.prioridad)
                            return (
                              <Link
                                key={notif.id}
                                href={notif.accion}
                                onClick={() => marcarLeida(notif.id)}
                                className={cn(
                                  "flex gap-4 p-4 transition-colors duration-300 hover:bg-muted/50",
                                  !notif.leida ? "bg-accent/5" : "bg-transparent"
                                )}
                              >
                                <div className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                  styles.bg
                                )}>
                                  <Icon className={cn("h-5 w-5", styles.text)} />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <p className={cn(
                                        "font-medium",
                                        !notif.leida && "text-foreground",
                                        notif.leida && "text-muted-foreground"
                                      )}>
                                        {notif.titulo}
                                      </p>
                                      {!notif.leida && (
                                        <span className="inline-block h-2 w-2 rounded-full bg-accent shrink-0" />
                                      )}
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {new Date(notif.fecha).toLocaleDateString("es-CL", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notif.descripcion}
                                  </p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs", styles.border, styles.text)}
                                    >
                                      {notif.tipo === "evaluacion" && "Evaluación"}
                                      {notif.tipo === "plan_accion" && "Plan de acción"}
                                      {notif.tipo === "alerta" && "Alerta"}
                                      {notif.tipo === "sistema" && "Sistema"}
                                    </Badge>
                                    {notif.prioridad === "alta" && (
                                      <Badge variant="destructive" className="text-xs">
                                        Urgente
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="no-leidas">
                  <Card className="rounded-[1.6rem] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_94%,white)_0%,color-mix(in_oklab,var(--color-secondary)_20%,white)_100%)]">
                    <CardContent className="p-0">
                      {notificaciones.filter(n => !n.leida).length === 0 ? (
                        <EditorialEmptyState
                          icon={Check}
                          title="Todo al dia"
                          description="No hay notificaciones sin leer en este momento."
                          tone="success"
                          className="border-0 bg-transparent py-14"
                        />
                      ) : (
                      <div className="divide-y divide-border">
                        {notificaciones.filter(n => !n.leida).map((notif) => {
                          const Icon = getNotificationIcon(notif.tipo, notif.prioridad)
                          const styles = getNotificationStyles(notif.tipo, notif.prioridad)
                          return (
                            <Link
                              key={notif.id}
                              href={notif.accion}
                              onClick={() => marcarLeida(notif.id)}
                              className="flex gap-4 p-4 transition-colors hover:bg-muted/50 bg-accent/5"
                            >
                              <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                styles.bg
                              )}>
                                <Icon className={cn("h-5 w-5", styles.text)} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium">{notif.titulo}</p>
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {new Date(notif.fecha).toLocaleDateString("es-CL", {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{notif.descripcion}</p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alertas">
                  <EditorialPanel title="Alertas del sistema" description="Resumen concentrado de desvíos y eventos que requieren respuesta rápida." eyebrow="Vista filtrada">
                    <EditorialEmptyState
                      icon={AlertTriangle}
                      title={`${notificaciones.filter(n => n.tipo === "alerta").length} alertas activas`}
                      description="Las alertas criticas se siguen priorizando en la vista principal y en la bandeja de no leidas."
                      tone="warning"
                      className="border-0 bg-transparent py-6"
                    />
                  </EditorialPanel>
                </TabsContent>

                <TabsContent value="evaluaciones">
                  <EditorialPanel title="Notificaciones de evaluaciones" description="Seguimiento corto para aperturas, pendientes y cierres del periodo." eyebrow="Vista filtrada">
                    <EditorialEmptyState
                      icon={ClipboardCheck}
                      title={`${notificaciones.filter(n => n.tipo === "evaluacion").length} notificaciones`}
                      description="Las evaluaciones siguen el mismo patrón visual para que el equipo lea prioridad y contexto de un vistazo."
                      tone="info"
                      className="border-0 bg-transparent py-6"
                    />
                  </EditorialPanel>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Activity Log */}
            <div className="space-y-6">
              <EditorialPanel eyebrow="Bitacora" title="Actividad Reciente" description="Historial de cambios del sistema">
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {actividades.map((actividad, index) => {
                        const getActivityIcon = () => {
                          switch (actividad.tipo) {
                            case "evaluacion": return ClipboardCheck
                            case "plan_accion": return FileWarning
                            case "alerta": return AlertTriangle
                            default: return Clock
                          }
                        }
                        const ActivityIcon = getActivityIcon()

                        return (
                          <div key={actividad.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                actividad.tipo === "alerta" ? "bg-destructive/10" : "bg-accent/10"
                              )}>
                                <ActivityIcon className={cn(
                                  "h-4 w-4",
                                  actividad.tipo === "alerta" ? "text-destructive" : "text-accent"
                                )} />
                              </div>
                              {index < actividades.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium">{actividad.titulo}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {actividad.descripcion}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(actividad.fecha).toLocaleDateString("es-CL", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                                {actividad.usuario && ` · ${actividad.usuario}`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                </ScrollArea>
              </EditorialPanel>

              <EditorialPanel eyebrow="Pulso diario" title="Resumen del Dia" contentClassName="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alertas sin leer</span>
                    <Badge variant="destructive">{noLeidas}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Planes vencidos</span>
                    <Badge variant="destructive">{planesVencidos.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Evaluaciones hoy</span>
                    <Badge variant="secondary" className="bg-accent/15 text-accent">1</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Proveedores críticos</span>
                    <Badge variant="destructive">
                      {proveedores.filter(p => p.criticidad === "Alta").length}
                    </Badge>
                  </div>
              </EditorialPanel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
