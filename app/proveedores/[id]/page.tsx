"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { notFound } from "next/navigation"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  FileWarning,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react"

import { AppShell } from "@/components/app-shell"
import {
  EditorialDataTable,
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialPanel,
} from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { evaluaciones, planesAccion, proveedores } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const historicalScores = [
  { periodo: "Q2 2025", calificacion: 3.8 },
  { periodo: "Q3 2025", calificacion: 3.5 },
  { periodo: "Q4 2025", calificacion: 3.2 },
  { periodo: "Q1 2026", calificacion: 2.8 },
]

const bitacora = [
  {
    id: "log-1",
    fecha: "2026-03-15T14:30:00",
    usuario: "Ana Martínez",
    accion: "Evaluación completada",
    detalle: "Se finalizó evaluación trimestral con calificación 2.8",
  },
  {
    id: "log-2",
    fecha: "2026-03-10T10:15:00",
    usuario: "Carlos Ramírez",
    accion: "Plan de acción actualizado",
    detalle: "Se registró avance en capacitación del personal",
  },
  {
    id: "log-3",
    fecha: "2026-02-28T16:45:00",
    usuario: "Sistema",
    accion: "Alerta generada",
    detalle: "Proveedor marcado como crítico por baja calificación",
  },
  {
    id: "log-4",
    fecha: "2026-02-16T09:00:00",
    usuario: "Ana Martínez",
    accion: "Plan de acción creado",
    detalle: "Se crearon 2 planes de acción correctiva",
  },
]

const criticidadBadgeClass = {
  Alta: "border-destructive/40 bg-destructive/10 text-destructive",
  Media: "border-warning/40 bg-status-warning-soft text-warning",
  Baja: "border-success/40 bg-status-success-soft text-success",
} as const

const estadoBadgeClass = {
  "Pendiente": "bg-muted text-muted-foreground",
  "En evaluación": "bg-accent/15 text-accent",
  "Evaluado": "bg-status-success-soft text-success",
  "Con plan de acción": "bg-status-warning-soft text-warning",
  "Crítico": "bg-destructive/15 text-destructive",
} as const

const planBadgeClass = {
  "Pendiente": "border-border/70 bg-card/80 text-muted-foreground",
  "En progreso": "border-warning/40 bg-status-warning-soft text-warning",
  "Completado": "border-success/40 bg-status-success-soft text-success",
  "Vencido": "border-destructive/40 bg-destructive/10 text-destructive",
  "Escalado": "border-destructive/40 bg-destructive/10 text-destructive",
} as const

function scoreClass(value: number) {
  if (value >= 4) return "text-[oklch(0.5_0.15_155)]"
  if (value >= 3) return "text-[oklch(0.65_0.15_70)]"
  return "text-destructive"
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supplier = proveedores.find((item) => item.id === id)

  if (!supplier) {
    notFound()
  }

  const supplierEvaluations = evaluaciones.filter((item) => item.proveedorId === supplier.id)
  const supplierActions = planesAccion.filter((item) => item.proveedorId === supplier.id)
  const scoreDiff = supplier.calificacionActual - supplier.calificacionAnterior
  const isDecreasing = scoreDiff < 0

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/proveedores" className="transition-colors hover:text-foreground">
              Proveedores
            </Link>
            <span>/</span>
            <span className="text-foreground">{supplier.nombre}</span>
          </div>

          <EditorialPageHeader
            eyebrow="Ficha de seguimiento"
            title={supplier.nombre}
            description="La vista ordena criticidad, evaluaciones, hallazgos y acciones con el mismo sistema editorial del resto de la operación para que el detalle no vuelva a parecer otra app."
            meta={[
              { label: "RUT", value: supplier.rut },
              { label: "Estado", value: supplier.estado, tone: supplier.estado === "Crítico" ? "danger" : supplier.estado === "Con plan de acción" ? "warning" : "success" },
              { label: "Criticidad", value: supplier.criticidad, tone: supplier.criticidad === "Alta" ? "danger" : supplier.criticidad === "Media" ? "warning" : "success" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" asChild>
                  <Link href="/proveedores">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al padrón
                  </Link>
                </Button>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" asChild>
                  <Link href={`/planes-accion/nuevo?proveedor=${supplier.id}`}>
                    <FileWarning className="mr-2 h-4 w-4" />
                    Crear plan de acción
                  </Link>
                </Button>
                <Button className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]" asChild>
                  <Link href={`/evaluaciones/nueva?proveedor=${supplier.id}`}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Nueva evaluación
                  </Link>
                </Button>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EditorialMetricCard
              label="Calificación actual"
              value={supplier.calificacionActual.toFixed(1)}
              detail={`Variación ${scoreDiff > 0 ? "+" : ""}${scoreDiff.toFixed(1)} vs. corte anterior`}
              icon={isDecreasing ? TrendingDown : TrendingUp}
              tone={supplier.calificacionActual < 3 ? "danger" : supplier.calificacionActual < 4 ? "warning" : "success"}
            />
            <EditorialMetricCard label="Evaluaciones" value={supplierEvaluations.length} detail="Historial disponible" icon={ClipboardCheck} tone="info" />
            <EditorialMetricCard label="Planes activos" value={supplierActions.filter((item) => item.estado !== "Completado").length} detail="Pendientes y en progreso" icon={FileWarning} tone="warning" />
            <EditorialMetricCard label="Próxima revisión" value={formatLongDate(supplier.fechaProximaEvaluacion)} detail="Próxima fecha comprometida" icon={Calendar} tone="default" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              <Tabs defaultValue="resumen" className="space-y-4">
                <TabsList className="h-auto flex-wrap rounded-[1.3rem] border border-white/60 bg-card/75 p-1.5 shadow-sm">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
                  <TabsTrigger value="hallazgos">Hallazgos</TabsTrigger>
                  <TabsTrigger value="planes">Planes</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="bitacora">Bitácora</TabsTrigger>
                </TabsList>

                <TabsContent value="resumen" className="space-y-6">
                  <EditorialPanel
                    eyebrow="Evolución"
                    title="Tendencia de calificación"
                    description="La serie histórica usa la misma lectura editorial que reportes y dashboard para no romper continuidad visual."
                  >
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalScores} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="supplier-score" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.55 0.15 180)" stopOpacity={0.28} />
                              <stop offset="95%" stopColor="oklch(0.55 0.15 180)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.005 240)" />
                          <XAxis dataKey="periodo" stroke="oklch(0.45 0.02 250)" fontSize={12} />
                          <YAxis domain={[0, 5]} stroke="oklch(0.45 0.02 250)" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "oklch(1 0 0)",
                              border: "1px solid oklch(0.9 0.005 240)",
                              borderRadius: "16px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="calificacion"
                            stroke="oklch(0.55 0.15 180)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#supplier-score)"
                            name="Calificación"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </EditorialPanel>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <EditorialPanel eyebrow="Exposición" title="Riesgo operacional" description="Personal, continuidad y procesos que hoy presionan la operación.">
                      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">
                        Alto
                      </Badge>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        Personal sin capacitación actualizada y sistema de reportes todavía inestable.
                      </p>
                      <Progress value={75} className="mt-4 h-2 bg-destructive/20" />
                    </EditorialPanel>
                    <EditorialPanel eyebrow="Exposición" title="Riesgo reputacional" description="Impacto en imagen y cumplimiento percibido frente a stakeholders.">
                      <Badge variant="outline" className="bg-status-warning-soft text-warning border-warning/30">
                        Medio
                      </Badge>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        Incidentes no reportados todavía pueden arrastrar ruido reputacional si no se corrigen rápido.
                      </p>
                      <Progress value={50} className="mt-4 h-2 bg-warning/20" />
                    </EditorialPanel>
                  </div>
                </TabsContent>

                <TabsContent value="evaluaciones">
                  <EditorialPanel
                    eyebrow="Historial"
                    title="Evaluaciones registradas"
                    description="Mantené a mano periodos, evaluador y score sin perder el tono editorial del módulo."
                    contentClassName="p-0"
                  >
                    <EditorialDataTable className="rounded-none border-0 shadow-none">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Evaluador</TableHead>
                            <TableHead className="text-center">Calificación</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierEvaluations.length > 0 ? (
                            supplierEvaluations.map((evaluation) => (
                              <TableRow key={evaluation.id}>
                                <TableCell>{new Date(evaluation.fecha).toLocaleDateString("es-CL")}</TableCell>
                                <TableCell>{evaluation.periodo}</TableCell>
                                <TableCell>{evaluation.evaluador}</TableCell>
                                <TableCell className="text-center">
                                  <span className={cn("font-bold", scoreClass(evaluation.calificacion))}>
                                    {evaluation.calificacion.toFixed(1)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={cn("font-normal", estadoBadgeClass[evaluation.estado])}>
                                    {evaluation.estado}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                                No hay evaluaciones registradas
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </EditorialDataTable>
                  </EditorialPanel>
                </TabsContent>

                <TabsContent value="hallazgos">
                  <EditorialPanel
                    eyebrow="Hallazgos"
                    title="Desvíos activos"
                    description="Cada hallazgo conversa con el estado del plan y deja visible cuándo entró a seguimiento."
                  >
                    <div className="space-y-4">
                      {supplierActions.map((action) => (
                        <div key={action.id} className="rounded-[1.35rem] border border-border/70 bg-card/75 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-card-foreground">{action.hallazgo}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Identificado el {new Date(action.fechaCreacion).toLocaleDateString("es-CL")}
                              </p>
                            </div>
                            <Badge variant="outline" className={cn("font-normal", planBadgeClass[action.estado])}>
                              {action.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditorialPanel>
                </TabsContent>

                <TabsContent value="planes">
                  <EditorialPanel
                    eyebrow="Corrección"
                    title="Planes de acción"
                    description="Responsables, plazos y estado quedan claros sin volver a un layout viejo de tabla plana."
                    contentClassName="p-0"
                  >
                    <EditorialDataTable className="rounded-none border-0 shadow-none">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Acción correctiva</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Fecha compromiso</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierActions.map((action) => (
                            <TableRow key={action.id}>
                              <TableCell className="max-w-[340px]">
                                <p className="truncate">{action.accionCorrectiva}</p>
                              </TableCell>
                              <TableCell>{action.responsable}</TableCell>
                              <TableCell>{new Date(action.fechaCompromiso).toLocaleDateString("es-CL")}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("font-normal", planBadgeClass[action.estado])}>
                                  {action.estado}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </EditorialDataTable>
                  </EditorialPanel>
                </TabsContent>

                <TabsContent value="documentos">
                  <EditorialPanel
                    eyebrow="Adjuntos"
                    title="Documentos del proveedor"
                    description="Cuando todavía no hay respaldo documental, mejor mostrarlo con honestidad que simular completitud."
                  >
                    <EditorialEmptyState
                      icon={Paperclip}
                      title="Sin documentos"
                      description="No hay archivos adjuntos para este proveedor. Cuando el flujo soporte uploads reales, este bloque ya tiene su lugar dentro del sistema editorial."
                      action={<Button variant="outline" className="rounded-full">Subir documento</Button>}
                      tone="info"
                    />
                  </EditorialPanel>
                </TabsContent>

                <TabsContent value="bitacora">
                  <EditorialPanel
                    eyebrow="Actividad"
                    title="Bitácora"
                    description="El timeline retoma el tono editorial y deja visibles eventos, usuario y contexto en una sola lectura."
                  >
                    <ScrollArea className="h-[420px] pr-4">
                      <div className="space-y-4">
                        {bitacora.map((entry, index) => (
                          <div key={entry.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80">
                                {entry.usuario === "Sistema" ? (
                                  <Clock className="h-4 w-4 text-accent" />
                                ) : (
                                  <User className="h-4 w-4 text-accent" />
                                )}
                              </div>
                              {index < bitacora.length - 1 ? <div className="mt-2 w-px flex-1 bg-border" /> : null}
                            </div>
                            <div className="flex-1 rounded-[1.2rem] border border-border/65 bg-card/75 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-semibold text-card-foreground">{entry.accion}</p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.fecha).toLocaleDateString("es-CL", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{entry.detalle}</p>
                              <p className="mt-2 text-xs text-muted-foreground">Por {entry.usuario}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </EditorialPanel>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <EditorialPanel
                eyebrow="Ficha de contacto"
                title="Canales activos"
                description="La información lateral acompaña el seguimiento sin competir con el cuerpo principal."
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/65 bg-card/75 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/85">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contacto principal</p>
                      <p className="font-semibold text-card-foreground">{supplier.contacto}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/65 bg-card/75 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/85">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Correo</p>
                      <p className="font-semibold text-card-foreground">{supplier.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/65 bg-card/75 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/85">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-semibold text-card-foreground">{supplier.telefono}</p>
                    </div>
                  </div>
                </div>
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Acciones rápidas"
                title="Siguientes movimientos"
                description="Los CTA hablan el mismo idioma visual que el resto del circuito en vez de parecer botones heredados."
              >
                <div className="space-y-2">
                  <Button variant="outline" className="h-11 w-full justify-start rounded-full border-primary/15 bg-card/85" asChild>
                    <Link href={`/evaluaciones/nueva?proveedor=${supplier.id}`}>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Iniciar evaluación
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-11 w-full justify-start rounded-full border-primary/15 bg-card/85" asChild>
                    <Link href={`/planes-accion/nuevo?proveedor=${supplier.id}`}>
                      <FileWarning className="mr-2 h-4 w-4" />
                      Crear plan de acción
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-11 w-full justify-start rounded-full border-primary/15 bg-card/85">
                    <Calendar className="mr-2 h-4 w-4" />
                    Programar reunión
                  </Button>
                  <Button variant="outline" className="h-11 w-full justify-start rounded-full border-primary/15 bg-card/85">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Agregar comentario
                  </Button>
                </div>
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Lectura rápida"
                title="Resumen de acciones"
                description="Contadores compactos para saber si el proveedor necesita empuje, escalamiento o cierre."
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-[1.15rem] border border-border/65 bg-card/75 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Planes activos</span>
                    <Badge variant="secondary">{supplierActions.filter((item) => item.estado === "En progreso").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.15rem] border border-border/65 bg-card/75 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Pendientes</span>
                    <Badge variant="secondary">{supplierActions.filter((item) => item.estado === "Pendiente").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.15rem] border border-border/65 bg-card/75 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Vencidos o escalados</span>
                    <Badge variant="destructive">{supplierActions.filter((item) => item.estado === "Vencido" || item.estado === "Escalado").length}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.15rem] border border-border/65 bg-card/75 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Completados</span>
                    <Badge className="bg-status-success-soft text-success">{supplierActions.filter((item) => item.estado === "Completado").length}</Badge>
                  </div>
                  <div className="rounded-[1.2rem] border border-border/65 bg-card/70 p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                      <p>
                        Categoría <span className="font-semibold text-card-foreground">{supplier.categoria}</span> · sede <span className="font-semibold text-card-foreground">{supplier.sede}</span> · contrato {supplier.contratoVigente ? "vigente" : "sin contrato vigente"}.
                      </p>
                    </div>
                  </div>
                </div>
              </EditorialPanel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
