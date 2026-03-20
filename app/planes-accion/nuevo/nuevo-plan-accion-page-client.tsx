"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { ArrowLeft, ArrowUpRight, CalendarClock, CircleAlert, ClipboardList, Save, ShieldAlert, Target, UserRound } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { EditorialDataTable, EditorialMetricCard, EditorialPageHeader, EditorialPanel, EditorialStepper } from "@/components/editorial/ui"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { createPlanAccion } from "@/lib/services/planes-accion"
import { getProveedores } from "@/lib/services/proveedores"
import { planAccionFormSchema, type PlanAccionFormValues } from "@/lib/schemas"
import type { Proveedor } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const criticidadStyles = {
  Alta: "border-destructive/40 bg-destructive/10 text-destructive",
  Media: "border-warning/40 bg-status-warning-soft text-warning",
  Baja: "border-success/40 bg-status-success-soft text-success",
} as const

const planSteps = [
  {
    id: 1,
    name: "Origen",
    description: "Elegí proveedor y explicitá el hallazgo para no crear un correctivo huérfano.",
  },
  {
    id: 2,
    name: "Corrección",
    description: "La acción correctiva tiene que decir qué cambia, con qué evidencia y qué cierre se espera.",
  },
  {
    id: 3,
    name: "Compromiso",
    description: "Definí responsable y fecha para que el tablero pueda alertar y escalar a tiempo.",
  },
] as const

type NuevoPlanAccionPageClientProps = {
  proveedorId?: string
}

export function NuevoPlanAccionPageClient({ proveedorId }: NuevoPlanAccionPageClientProps) {
  const router = useRouter()

  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])

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

  React.useEffect(() => {
    getProveedores().then((items) => {
      setProveedores(items)

      if (proveedorId && items.some((item) => item.id === proveedorId)) {
        form.setValue("proveedorId", proveedorId)
      }
    })
  }, [form, proveedorId])

  const watchedProveedorId = useWatch({ control: form.control, name: "proveedorId" })

  const selectedProveedor = React.useMemo(
    () => proveedores.find((item) => item.id === watchedProveedorId) ?? null,
    [proveedores, watchedProveedorId],
  )

  const watchedValues = useWatch({ control: form.control })
  const currentStep = !watchedValues.proveedorId || !watchedValues.hallazgo?.trim() ? 1 : !watchedValues.accionCorrectiva?.trim() ? 2 : 3
  const completedSignals = [
    watchedValues.proveedorId,
    watchedValues.hallazgo,
    watchedValues.accionCorrectiva,
    watchedValues.responsable,
    watchedValues.fechaCompromiso,
  ].filter((value) => value?.trim()).length

  const jumpToStep = (stepId: number) => {
    const sectionId = stepId === 1 ? "plan-origen" : stepId === 2 ? "plan-correccion" : "plan-compromiso"
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const proveedoresPrioritarios = React.useMemo(
    () => [...proveedores]
      .sort((left, right) => {
        const criticidadRank = { Alta: 0, Media: 1, Baja: 2 }
        return criticidadRank[left.criticidad] - criticidadRank[right.criticidad]
      })
      .slice(0, 6),
    [proveedores],
  )

  const onSubmit = async (values: PlanAccionFormValues) => {
    try {
      await createPlanAccion({
        ...values,
        evaluacionId: values.evaluacionId || "",
      })

      toast.success("Plan de acción creado", {
        description: "El seguimiento correctivo ya quedó disponible en el tablero operativo.",
      })
      router.push(values.proveedorId ? `/proveedores/${values.proveedorId}` : "/planes-accion")
    } catch {
      toast.error("No pudimos registrar el plan", {
        description: "Verificá proveedor, hallazgo y fecha compromiso antes de reintentar.",
      })
    }
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <EditorialPageHeader
            eyebrow="Corrección guiada"
            title="Nuevo plan de acción"
            description="Ordená hallazgo, responsable y fecha compromiso dentro del mismo sistema editorial que ya usa proveedores, reportes y seguimiento operativo."
            meta={[
              { label: "Proveedor", value: selectedProveedor ? selectedProveedor.nombre : "A definir", tone: selectedProveedor ? "default" : "warning" },
              { label: "Estado inicial", value: "Pendiente", tone: "warning" },
              { label: "Flujo", value: "Correctivo" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" asChild>
                  <Link href={selectedProveedor ? `/proveedores/${selectedProveedor.id}` : "/planes-accion"}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Link>
                </Button>
                <Button
                  className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={form.formState.isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Guardando..." : "Crear plan"}
                </Button>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EditorialMetricCard
              label="Paso activo"
              value={`${currentStep}/3`}
              detail={planSteps[currentStep - 1]?.name}
              icon={Target}
              tone="info"
            />
            <EditorialMetricCard
              label="Campos críticos"
              value={`${completedSignals}/5`}
              detail="Proveedor, hallazgo, acción, responsable y fecha"
              icon={ClipboardList}
              tone={completedSignals >= 4 ? "success" : "warning"}
            />
            <EditorialMetricCard
              label="Proveedor"
              value={selectedProveedor ? selectedProveedor.nombre : "A definir"}
              detail={selectedProveedor ? `${selectedProveedor.categoria} · ${selectedProveedor.sede}` : "Todavía sin contexto asociado"}
              icon={ShieldAlert}
              tone={selectedProveedor?.criticidad === "Alta" ? "danger" : selectedProveedor ? "default" : "warning"}
            />
            <EditorialMetricCard
              label="Compromiso"
              value={watchedValues.fechaCompromiso || "Sin fecha"}
              detail={watchedValues.responsable?.trim() || "Responsable pendiente"}
              icon={CalendarClock}
              tone={watchedValues.fechaCompromiso ? "success" : "warning"}
            />
          </div>

          <EditorialStepper
            eyebrow="Secuencia correctiva"
            title="Tres decisiones, un plan accionable"
            description="El formulario baja el ruido: primero contexto, después corrección y recién al final compromiso operativo."
            steps={[...planSteps]}
            currentStep={currentStep}
            onStepChange={jumpToStep}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <EditorialPanel
                  className="scroll-mt-6"
                  eyebrow="Asignación"
                  title="Proveedor y contexto del hallazgo"
                  description="El plan puede nacer desde un proveedor puntual o desde esta vista general sin perder trazabilidad."
                >
                  <div id="plan-origen" className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Proveedor seleccionado</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{selectedProveedor?.nombre || "Pendiente"}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Hallazgo</p>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold text-card-foreground">
                        {watchedValues.hallazgo?.trim() || "Todavía sin descripción operativa"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="proveedorId"
                      render={({ field }) => (
                        <FormItem className="lg:col-span-2">
                          <FormLabel>Proveedor responsable</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85">
                                <SelectValue placeholder="Seleccioná un proveedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {proveedores.map((proveedor) => (
                                <SelectItem key={proveedor.id} value={proveedor.id}>
                                  {proveedor.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hallazgo"
                      render={({ field }) => (
                        <FormItem className="lg:col-span-2">
                          <FormLabel>Hallazgo identificado</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-28 rounded-[1.4rem] border-border/70 bg-card/85"
                              placeholder="Describí el incumplimiento, desvío o incidente que activa este plan."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accionCorrectiva"
                      render={({ field }) => (
                        <FormItem className="lg:col-span-2" id="plan-correccion">
                          <FormLabel>Acción correctiva</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-32 rounded-[1.4rem] border-border/70 bg-card/85"
                              placeholder="Explicá qué debe pasar, con qué evidencia y qué resultado se espera ver."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </EditorialPanel>

                <EditorialPanel
                  className="scroll-mt-6"
                  eyebrow="Ejecución"
                  title="Responsable y ventana de cumplimiento"
                  description="La idea no es decorar un backlog: es dejar claro quién mueve esto y para cuándo."
                >
                  <div id="plan-compromiso" className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Responsable</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.responsable?.trim() || "Pendiente"}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Fecha compromiso</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.fechaCompromiso || "Sin fecha"}</p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="responsable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsable</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="Nombre o rol responsable" {...field} />
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
                          <FormLabel>Fecha compromiso</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </EditorialPanel>
              </form>
            </Form>

            <div className="space-y-6">
              <EditorialPanel
                eyebrow="Proveedor activo"
                title={selectedProveedor ? selectedProveedor.nombre : "Seleccioná un proveedor"}
                description={
                  selectedProveedor
                    ? `${selectedProveedor.categoria} · ${selectedProveedor.sede}. El resumen te da contexto antes de comprometer responsables.`
                    : "Elegí un proveedor para ver criticidad, sede y estado antes de crear el plan."
                }
              >
                {selectedProveedor ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Estado</p>
                        <p className="mt-2 text-sm font-semibold text-card-foreground">{selectedProveedor.estado}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-border/70 bg-card/75 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Criticidad</p>
                        <span className={cn("mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium", criticidadStyles[selectedProveedor.criticidad])}>
                          {selectedProveedor.criticidad}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-[1.35rem] border border-border/70 bg-card/75 p-4 text-sm text-muted-foreground">
                      <div className="flex items-start gap-3">
                        <CircleAlert className="mt-0.5 h-4 w-4 text-primary" />
                        <p>
                          Calificación actual <span className="font-semibold text-card-foreground">{selectedProveedor.calificacionActual.toFixed(1)}</span>.
                          Si el hallazgo viene de una evaluación crítica, dejalo explícito en la acción correctiva.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-border/75 px-5 py-8 text-center text-sm text-muted-foreground">
                    Primero definí el proveedor. Recién ahí tiene sentido comprometer hallazgo, responsable y fecha.
                  </div>
                )}
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Selección rápida"
                title="Lista priorizada de proveedores"
                description="Te dejo a mano los más sensibles para no obligarte a saltar entre pantallas cuando estás armando un correctivo."
                contentClassName="p-0"
              >
                <EditorialDataTable className="rounded-none border-0 shadow-none">
                  <div className="w-full min-w-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Criticidad</TableHead>
                          <TableHead className="w-[10.5rem] text-right">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proveedoresPrioritarios.map((proveedor) => (
                          <TableRow
                            key={proveedor.id}
                            className={cn("border-b border-border/45 transition-colors hover:bg-[color-mix(in_oklab,var(--color-card)_86%,white)]", watchedProveedorId === proveedor.id && "bg-primary/6")}
                            onClick={() => form.setValue("proveedorId", proveedor.id, { shouldValidate: true, shouldDirty: true })}
                          >
                            <TableCell>
                              <div className="min-w-[15rem] py-1">
                                <p className="font-medium text-card-foreground">{proveedor.nombre}</p>
                                <p className="text-xs text-muted-foreground">{proveedor.categoria} · {proveedor.sede}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-card-foreground">{proveedor.estado}</span>
                            </TableCell>
                            <TableCell>
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", criticidadStyles[proveedor.criticidad])}>
                                {proveedor.criticidad}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2 py-1">
                                <Button
                                  variant={watchedProveedorId === proveedor.id ? "secondary" : "outline"}
                                  size="sm"
                                  className="rounded-full"
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    form.setValue("proveedorId", proveedor.id, { shouldValidate: true, shouldDirty: true })
                                  }}
                                >
                                  {watchedProveedorId === proveedor.id ? "Seleccionado" : "Usar"}
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full" asChild>
                                  <Link
                                    href={`/proveedores/${proveedor.id}`}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    Ver ficha
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </EditorialDataTable>
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Checklist"
                title="Qué debe quedar claro"
                description="Si el plan no hace esto evidente, después se transforma en ruido administrativo."
              >
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3 rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    <ClipboardList className="mt-0.5 h-4 w-4 text-primary" />
                    <span>El hallazgo tiene que explicar el desvío con lenguaje operativo, no genérico.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    <UserRound className="mt-0.5 h-4 w-4 text-primary" />
                    <span>El responsable tiene que ser accionable: nombre, rol o equipo concreto.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                    <span>La fecha compromiso define seguimiento, alertas y vencimientos del tablero.</span>
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
