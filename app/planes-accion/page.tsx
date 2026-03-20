"use client"

import * as React from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { planAccionFormSchema, type PlanAccionFormValues } from "@/lib/schemas"
import {
  EditorialDataTable,
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialToolbar,
} from "@/components/editorial/ui"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createPlanAccion } from "@/lib/services/planes-accion"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpRight,
} from "lucide-react"
import { getPlanesAccion } from "@/lib/services/planes-accion"
import { getProveedores } from "@/lib/services/proveedores"
import type { PlanAccion, Proveedor } from "@/lib/types"
import type { EstadoPlanAccion } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const estadoConfig: Record<EstadoPlanAccion, { bg: string; text: string; icon: React.ElementType }> = {
  "Pendiente": { bg: "bg-muted", text: "text-muted-foreground", icon: Clock },
  "En progreso": { bg: "bg-accent/15", text: "text-accent", icon: ArrowUpRight },
  "Completado": { bg: "bg-[oklch(0.6_0.15_155/0.15)]", text: "text-[oklch(0.5_0.15_155)]", icon: CheckCircle2 },
  "Vencido": { bg: "bg-destructive/15", text: "text-destructive", icon: AlertTriangle },
  "Escalado": { bg: "bg-destructive/15", text: "text-destructive", icon: AlertTriangle },
}

export default function PlanesAccionPage() {
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [planesAccion, setPlanesAccion] = React.useState<PlanAccion[]>([])
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterEstado, setFilterEstado] = React.useState("all")
  const [filterProveedor, setFilterProveedor] = React.useState("all")

  React.useEffect(() => {
    Promise.all([getPlanesAccion(), getProveedores()]).then(([planes, provs]) => {
      setPlanesAccion(planes)
      setProveedores(provs)
    })
  }, [])

  const filteredPlanes = React.useMemo(() => {
    return planesAccion.filter(p => {
      if (filterEstado !== "all" && p.estado.toLowerCase().replace(/ /g, "-") !== filterEstado) return false
      if (filterProveedor !== "all" && p.proveedorId !== filterProveedor) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const prov = proveedores.find(pr => pr.id === p.proveedorId)
        const matchHallazgo = p.hallazgo.toLowerCase().includes(query)
        const matchNombre = prov?.nombre.toLowerCase().includes(query)
        const matchResponsable = p.responsable.toLowerCase().includes(query)
        if (!matchHallazgo && !matchNombre && !matchResponsable) return false
      }
      return true
    })
  }, [planesAccion, filterEstado, filterProveedor, searchQuery, proveedores])

  const form = useForm<PlanAccionFormValues>({
    resolver: zodResolver(planAccionFormSchema),
    defaultValues: {
      proveedorId: "",
      evaluacionId: "",
      hallazgo: "",
      accionCorrectiva: "",
      responsable: "",
      fechaCompromiso: "",
    },
  })

  const selectedDialogProveedorId = useWatch({ control: form.control, name: "proveedorId" })
  const selectedDialogProveedor = proveedores.find((item) => item.id === selectedDialogProveedorId)

  const onSubmit = async (values: PlanAccionFormValues) => {
    try {
      await createPlanAccion({
        proveedorId: values.proveedorId,
        evaluacionId: values.evaluacionId || "",
        hallazgo: values.hallazgo,
        accionCorrectiva: values.accionCorrectiva,
        responsable: values.responsable,
        fechaCompromiso: values.fechaCompromiso,
      })
      toast.success("Plan de acción creado", {
        description: "El plan ha sido registrado exitosamente.",
      })
      setDialogOpen(false)
      form.reset()
      // Reload data from store
      const [planes, provs] = await Promise.all([getPlanesAccion(), getProveedores()])
      setPlanesAccion(planes)
      setProveedores(provs)
    } catch {
      toast.error("Error al crear el plan", {
        description: "No se pudo registrar el plan de acción.",
      })
    }
  }

  const plansByStatus = {
    pendiente: filteredPlanes.filter(p => p.estado === "Pendiente"),
    enProgreso: filteredPlanes.filter(p => p.estado === "En progreso"),
    completado: filteredPlanes.filter(p => p.estado === "Completado"),
    vencido: filteredPlanes.filter(p => p.estado === "Vencido" || p.estado === "Escalado"),
  }

  const stats = {
    total: filteredPlanes.length,
    pendientes: plansByStatus.pendiente.length,
    enProgreso: plansByStatus.enProgreso.length,
    completados: plansByStatus.completado.length,
    vencidos: plansByStatus.vencido.length,
    cumplimiento: filteredPlanes.length > 0
      ? Math.round((plansByStatus.completado.length / filteredPlanes.length) * 100)
      : 0
  }

  const formatDate = React.useCallback(
    (date: string) =>
      new Date(date).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [],
  )

  const getCommitmentLabel = React.useCallback((plan: PlanAccion) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const commitmentDate = new Date(plan.fechaCompromiso)
    commitmentDate.setHours(0, 0, 0, 0)

    const diffInDays = Math.ceil((commitmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (plan.estado === "Completado") {
      return `Cerrado el ${formatDate(plan.fechaActualizacion)}`
    }

    if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} d atrasado`
    }

    if (diffInDays === 0) {
      return "Vence hoy"
    }

    if (diffInDays === 1) {
      return "Vence manana"
    }

    return `Vence en ${diffInDays} d`
  }, [formatDate])

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <EditorialPageHeader
            eyebrow="Correccion y seguimiento"
            title="Planes de Accion"
            description="El modulo consolida backlog correctivo, responsables y vencimientos con la misma presencia editorial del dashboard."
            meta={[
              { label: "Planes", value: planesAccion.length },
              { label: "Vencidos", value: stats.vencidos, tone: "danger" },
              { label: "Cumplimiento", value: `${stats.cumplimiento}%`, tone: "success" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 gap-2 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]">
                      <Plus className="h-4 w-4" />
                      Nuevo Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px] rounded-[1.9rem] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_96%,white)_0%,color-mix(in_oklab,var(--color-secondary)_18%,white)_100%)] p-0 shadow-[0_32px_80px_-42px_color-mix(in_oklab,var(--foreground)_24%,transparent)]">
                    <DialogHeader className="px-6 pt-6">
                      <DialogTitle className="font-display text-[1.6rem] tracking-[-0.04em]">Crear plan de acción</DialogTitle>
                      <DialogDescription className="max-w-[48ch] text-sm leading-6">
                        Resolvé un correctivo rápido sin salir del tablero, pero con el mismo lenguaje visual del flujo dedicado.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 px-6 py-5">
                        <div className="rounded-[1.35rem] border border-border/70 bg-card/75 p-4 text-sm text-muted-foreground">
                          El alta rápida deja el plan en estado pendiente. Si necesitás más contexto o selección asistida de proveedor, seguí con el flujo completo en <Link href="/planes-accion/nuevo" className="font-medium text-primary underline-offset-4 hover:underline">crear plan</Link>.
                        </div>
                        <FormField
                          control={form.control}
                          name="proveedorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Proveedor</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85">
                                    <SelectValue placeholder="Seleccione un proveedor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {proveedores.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedDialogProveedor ? (
                                <div className="rounded-[1.15rem] border border-border/70 bg-card/75 px-4 py-3 text-sm text-muted-foreground">
                                  <span className="font-medium text-card-foreground">{selectedDialogProveedor.nombre}</span>
                                  {` · ${selectedDialogProveedor.categoria} · ${selectedDialogProveedor.sede}`}
                                </div>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hallazgo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hallazgo</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-24 rounded-[1.35rem] border-border/70 bg-card/85" placeholder="Describa el hallazgo identificado..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="accionCorrectiva"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acción Correctiva</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-28 rounded-[1.35rem] border-border/70 bg-card/85" placeholder="Describa la acción correctiva a implementar..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="responsable"
                            render={({ field }) => (
                              <FormItem>
                              <FormLabel>Responsable</FormLabel>
                              <FormControl>
                                  <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="Nombre del responsable" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="fechaCompromiso"
                            render={({ field }) => (
                              <FormItem>
                              <FormLabel>Fecha Compromiso</FormLabel>
                              <FormControl>
                                  <Input className="h-11 rounded-2xl border-border/70 bg-card/85" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        </div>
                        <DialogFooter className="border-t border-border/60 px-6 py-5">
                          <Button variant="outline" className="rounded-full" type="button" onClick={() => { setDialogOpen(false); form.reset() }}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="rounded-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Creando..." : "Crear Plan"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <EditorialMetricCard label="Total" value={stats.total} detail="Backlog visible" tone="default" />
            <EditorialMetricCard label="Pendientes" value={stats.pendientes} detail="Pendientes de arranque" tone="info" />
            <EditorialMetricCard label="En progreso" value={stats.enProgreso} detail="Con seguimiento activo" tone="warning" />
            <EditorialMetricCard label="Vencidos" value={stats.vencidos} detail="Necesitan escalamiento" tone="danger" />
            <Card className="border-border/65 rounded-[1.55rem] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_30%,white)_100%)] shadow-[0_18px_45px_-38px_color-mix(in_oklab,var(--foreground)_28%,transparent)]">
              <CardContent className="p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/82">Cumplimiento</p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="font-display text-[2rem] leading-none tracking-[-0.05em] text-success">{stats.cumplimiento}%</p>
                  <Progress value={stats.cumplimiento} className="h-2 flex-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <EditorialToolbar
            eyebrow="Exploracion"
            title="Cruza estado, proveedor y vista del tablero"
            description="El selector alterna entre lista editorial y tablero de columnas sin perder continuidad visual."
          >
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar plan de acción..."
                className="h-11 rounded-full border-border/70 bg-card/90 pl-9 shadow-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/90 shadow-xs sm:min-w-[10rem] sm:w-auto">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en-progreso">En progreso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProveedor} onValueChange={setFilterProveedor}>
              <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/90 shadow-xs sm:min-w-[12rem] sm:w-auto">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {proveedores.slice(0, 5).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-1 rounded-full border border-border/70 bg-card/85 p-1 shadow-sm">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                aria-label="Vista de lista"
                className="rounded-full gap-2 px-3"
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                aria-label="Vista de tablero"
                className="rounded-full gap-2 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
                Tablero
              </Button>
            </div>
          </EditorialToolbar>

          {/* Content */}
          {viewMode === "list" ? (
            <EditorialDataTable key="list" className="animate-in fade-in duration-200">
              <div className="p-0">
                {filteredPlanes.length === 0 ? (
                  <EditorialEmptyState
                    icon={Search}
                    title="Sin planes en esta vista"
                    description="No hay planes de accion que coincidan con los filtros activos. Probá abrir proveedor o estado."
                    tone="info"
                    className="border-0 bg-transparent py-14"
                  />
                ) : (
                <div className="w-full min-w-0 overflow-x-auto">
                  <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Plan</TableHead>
                       <TableHead>Contexto</TableHead>
                       <TableHead>Seguimiento</TableHead>
                       <TableHead>Estado</TableHead>
                       <TableHead className="w-[16rem] text-right">Acciones</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredPlanes.map((plan) => {
                        const proveedor = proveedores.find(p => p.id === plan.proveedorId)
                        const StatusIcon = estadoConfig[plan.estado].icon
                        const commitmentDate = new Date(plan.fechaCompromiso)
                        commitmentDate.setHours(0, 0, 0, 0)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isOverdue = commitmentDate < today && plan.estado !== "Completado"

                       return (
                         <TableRow
                           key={plan.id}
                            className="group border-b border-border/45 transition-colors hover:bg-[color-mix(in_oklab,var(--color-card)_86%,white)]"
                         >
                            <TableCell>
                              <div className="min-w-[15rem] py-1">
                                <Link
                                  href={`/planes-accion/${plan.id}`}
                                  className="group inline-flex max-w-full items-start gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                     <span className="truncate text-base font-semibold text-card-foreground">
                                       {proveedor?.nombre || "Proveedor"}
                                     </span>
                                     <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                   </div>
                                   <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                     {plan.hallazgo}
                                   </p>
                                 </div>
                               </Link>

                               <div className="mt-3 flex flex-wrap gap-2">
                                 <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                                   {proveedor?.categoria || "Sin categoria"}
                                 </Badge>
                                 <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                                   {formatDate(plan.fechaCreacion)}
                                 </Badge>
                               </div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="space-y-2 py-1">
                               <Link
                                 href={`/proveedores/${plan.proveedorId}`}
                                 className="inline-flex rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
                               >
                                 {proveedor?.nombre || "Ver proveedor"}
                               </Link>
                               <p className="max-w-[28rem] text-sm leading-6 text-card-foreground line-clamp-2">
                                 {plan.accionCorrectiva}
                               </p>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="space-y-2 py-1 text-sm">
                               <div className="flex items-center gap-2 text-card-foreground">
                                 <User className="h-4 w-4 text-muted-foreground" />
                                 <span>{plan.responsable}</span>
                               </div>
                               <div className="flex items-center gap-2 text-muted-foreground">
                                 <Calendar className="h-4 w-4" />
                                 <span className={cn(isOverdue && "text-destructive")}>{formatDate(plan.fechaCompromiso)}</span>
                               </div>
                               <p className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                 {getCommitmentLabel(plan)}
                               </p>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="space-y-2 py-1">
                               <Badge
                                 variant="secondary"
                                 className={cn(
                                   "gap-1 rounded-full px-2.5 py-1 font-medium",
                                   estadoConfig[plan.estado].bg,
                                   estadoConfig[plan.estado].text
                                 )}
                               >
                                 <StatusIcon className="h-3 w-3" />
                                 {plan.estado}
                               </Badge>
                               <p className="text-xs text-muted-foreground">
                                 Actualizado {formatDate(plan.fechaActualizacion)}
                               </p>
                             </div>
                           </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2 py-1">
                                <Button variant="outline" size="sm" className="rounded-full border-primary/15 bg-card/85" asChild>
                                  <Link href={`/planes-accion/${plan.id}`}>Detalle</Link>
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full border border-border/60 bg-card/80" asChild>
                                  <Link href={`/proveedores/${plan.proveedorId}`} aria-label={`Ver proveedor ${proveedor?.nombre || "asociado"}`}>
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
              </div>
            </EditorialDataTable>
          ) : (
            <div key="kanban" className="grid gap-4 lg:grid-cols-4 animate-in fade-in duration-200">
              {/* Pendiente */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-muted-foreground">Pendiente</h3>
                  <Badge variant="secondary">{plansByStatus.pendiente.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plansByStatus.pendiente.map((plan) => {
                    const proveedor = proveedores.find(p => p.id === plan.proveedorId)
                    return (
                       <Card key={plan.id} className="rounded-[1.35rem] border-border/65 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-secondary)_18%,white)_100%)]">
                         <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2">{plan.hallazgo}</p>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            {plan.accionCorrectiva}
                          </p>
                           <div className="mt-3 flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">{proveedor?.nombre}</span>
                             <span className="text-muted-foreground">
                               {new Date(plan.fechaCompromiso).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                             </span>
                           </div>
                           <div className="mt-4 flex items-center justify-between gap-2">
                             <Button variant="outline" size="sm" className="rounded-full" asChild>
                               <Link href={`/planes-accion/${plan.id}`}>Abrir plan</Link>
                             </Button>
                             <Button variant="ghost" size="sm" className="rounded-full" asChild>
                               <Link href={`/proveedores/${plan.proveedorId}`}>Proveedor</Link>
                             </Button>
                           </div>
                         </CardContent>
                       </Card>
                    )
                  })}
                </div>
              </div>

              {/* En Progreso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-accent">En Progreso</h3>
                  <Badge variant="secondary" className="bg-accent/15 text-accent">{plansByStatus.enProgreso.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plansByStatus.enProgreso.map((plan) => {
                    const proveedor = proveedores.find(p => p.id === plan.proveedorId)
                    return (
                       <Card key={plan.id} className="rounded-[1.35rem] border-accent/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-accent)_12%,white)_100%)]">
                         <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2">{plan.hallazgo}</p>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            {plan.accionCorrectiva}
                          </p>
                           <div className="mt-3 flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">{proveedor?.nombre}</span>
                             <span className="text-muted-foreground">
                               {new Date(plan.fechaCompromiso).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                             </span>
                           </div>
                           <div className="mt-4 flex items-center justify-between gap-2">
                             <Button variant="outline" size="sm" className="rounded-full" asChild>
                               <Link href={`/planes-accion/${plan.id}`}>Abrir plan</Link>
                             </Button>
                             <Button variant="ghost" size="sm" className="rounded-full" asChild>
                               <Link href={`/proveedores/${plan.proveedorId}`}>Proveedor</Link>
                             </Button>
                           </div>
                         </CardContent>
                       </Card>
                    )
                  })}
                </div>
              </div>

              {/* Vencido/Escalado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-destructive">Vencido</h3>
                  <Badge variant="secondary" className="bg-destructive/15 text-destructive">{plansByStatus.vencido.length}</Badge>
                </div>
                <div className="space-y-3">
                  {plansByStatus.vencido.map((plan) => {
                    const proveedor = proveedores.find(p => p.id === plan.proveedorId)
                    return (
                       <Card key={plan.id} className="rounded-[1.35rem] border-destructive/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-destructive)_10%,white)_100%)]">
                         <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium line-clamp-2">{plan.hallazgo}</p>
                            {plan.estado === "Escalado" && (
                              <Badge variant="destructive" className="shrink-0 text-[10px]">Escalado</Badge>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            {plan.accionCorrectiva}
                          </p>
                           <div className="mt-3 flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">{proveedor?.nombre}</span>
                             <span className="text-destructive font-medium">
                               {new Date(plan.fechaCompromiso).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                             </span>
                           </div>
                           <div className="mt-4 flex items-center justify-between gap-2">
                             <Button variant="outline" size="sm" className="rounded-full" asChild>
                               <Link href={`/planes-accion/${plan.id}`}>Abrir plan</Link>
                             </Button>
                             <Button variant="ghost" size="sm" className="rounded-full" asChild>
                               <Link href={`/proveedores/${plan.proveedorId}`}>Proveedor</Link>
                             </Button>
                           </div>
                         </CardContent>
                       </Card>
                    )
                  })}
                </div>
              </div>

              {/* Completado */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[oklch(0.5_0.15_155)]">Completado</h3>
                  <Badge variant="secondary" className="bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)]">{plansByStatus.completado.length}</Badge>
                </div>
               <div className="space-y-3">
                  {plansByStatus.completado.map((plan) => {
                    const proveedor = proveedores.find(p => p.id === plan.proveedorId)
                    return (
                      <Card key={plan.id} className="rounded-[1.35rem] border-[oklch(0.6_0.15_155/0.25)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,oklch(0.6_0.15_155)_10%,white)_100%)]">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium line-clamp-2">{plan.hallazgo}</p>
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            {plan.accionCorrectiva}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{proveedor?.nombre}</span>
                            <span className="text-[oklch(0.5_0.15_155)] font-medium">
                              {new Date(plan.fechaActualizacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                              <Link href={`/planes-accion/${plan.id}`}>Abrir plan</Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                              <Link href={`/proveedores/${plan.proveedorId}`}>Proveedor</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  {plansByStatus.completado.length === 0 && (
                    <Card className="rounded-[1.35rem] border-dashed border-border/70 bg-card/60">
                      <CardContent className="p-8 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">Sin planes completados</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
