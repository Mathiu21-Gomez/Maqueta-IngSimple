"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, BadgeCheck, Building2, FileText, Save, ShieldCheck, Sparkles, Users } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { EditorialInset, EditorialMetricCard, EditorialPageHeader, EditorialPanel, EditorialStepper } from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { createProveedor } from "@/lib/services/proveedores"
import { proveedorFormSchema, type ProveedorFormValues } from "@/lib/schemas"
import { toast } from "sonner"

const categorias = ["Seguridad", "Aseo", "Mantención", "Alimentación", "Tecnología", "Transporte"] as const
const sedes = ["Campus Norte", "Campus Sur", "Campus Central", "Campus Oriente", "Nivel Central"] as const
const criticidades = ["Alta", "Media", "Baja"] as const
const altaSteps = [
  {
    id: 1,
    name: "Identificación",
    description: "Nombre, RUT, categoría y sede definen cómo entra al padrón y a los filtros base.",
  },
  {
    id: 2,
    name: "Contacto",
    description: "La contraparte operativa deja lista la activación de evaluaciones, alertas y seguimiento.",
  },
  {
    id: 3,
    name: "Seguimiento",
    description: "Criticidad y contrato vigente ajustan la lectura inicial del proveedor dentro del circuito.",
  },
] as const

function addDays(baseDate: Date, days: number) {
  const nextDate = new Date(baseDate)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate.toISOString().split("T")[0]
}

export default function NuevoProveedorPage() {
  const router = useRouter()
  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorFormSchema),
    defaultValues: {
      nombre: "",
      rut: "",
      categoria: "Seguridad",
      sede: "Campus Norte",
      contacto: "",
      email: "",
      telefono: "",
      criticidad: "Media",
      contratoVigente: true,
    },
  })

  const onSubmit = async (values: ProveedorFormValues) => {
    const today = new Date()

    try {
      const proveedor = await createProveedor({
        ...values,
        estado: "Pendiente",
        calificacionActual: 0,
        calificacionAnterior: 0,
        fechaUltimaEvaluacion: today.toISOString().split("T")[0],
        fechaProximaEvaluacion: addDays(today, 90),
      })

      toast.success("Proveedor creado", {
        description: "El alta quedó registrada con defaults operativos listos para evaluar.",
      })
      router.push(`/proveedores/${proveedor.id}`)
    } catch {
      toast.error("No pudimos crear el proveedor", {
        description: "Revisá los datos obligatorios e intentá nuevamente.",
      })
    }
  }

  const watchedValues = useWatch({ control: form.control })
  const previewName = watchedValues.nombre?.trim() || "Proveedor sin nombre"
  const completedHighlights = [
    watchedValues.nombre,
    watchedValues.rut,
    watchedValues.contacto,
    watchedValues.email,
    watchedValues.telefono,
  ].filter((value) => value?.trim()).length

  const currentStep = !watchedValues.nombre?.trim() || !watchedValues.rut?.trim() ? 1 : !watchedValues.contacto?.trim() || !watchedValues.email?.trim() || !watchedValues.telefono?.trim() ? 2 : 3

  const jumpToSection = (stepId: number) => {
    const sectionId = stepId === 1 ? "proveedor-identificacion" : stepId === 2 ? "proveedor-contacto" : "proveedor-seguimiento"
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <EditorialPageHeader
            eyebrow="Alta operativa"
            title="Nuevo proveedor"
            description="Armá el alta con el mismo lenguaje editorial del sistema y dejá lista la base operativa para futuras evaluaciones y planes de acción."
            meta={[
              { label: "Estado inicial", value: "Pendiente", tone: "warning" },
              { label: "Primera revisión", value: "90 días", tone: "info" },
              { label: "Flujo", value: "Alta + seguimiento" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" asChild>
                  <Link href="/proveedores">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al padrón
                  </Link>
                </Button>
                <Button
                  className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={form.formState.isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Guardando..." : "Crear proveedor"}
                </Button>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EditorialMetricCard
              label="Paso activo"
              value={`${currentStep}/3`}
              detail={altaSteps[currentStep - 1]?.name}
              icon={Sparkles}
              tone="info"
            />
            <EditorialMetricCard
              label="Campos clave"
              value={`${completedHighlights}/5`}
              detail="Nombre, RUT y contacto operativo"
              icon={FileText}
              tone={completedHighlights >= 4 ? "success" : "warning"}
            />
            <EditorialMetricCard
              label="Cobertura"
              value={watchedValues.sede || "Sin sede"}
              detail={watchedValues.categoria || "Categoría pendiente"}
              icon={Building2}
            />
            <EditorialMetricCard
              label="Seguimiento"
              value={watchedValues.contratoVigente ? "Contrato ok" : "Sin contrato"}
              detail={`Criticidad ${watchedValues.criticidad}`}
              icon={Users}
              tone={watchedValues.contratoVigente ? "success" : "warning"}
            />
          </div>

          <EditorialStepper
            eyebrow="Ruta del alta"
            title="Orden editorial del ingreso"
            description="La ficha se arma en tres bloques claros para que padrón, detalle y seguimiento lean lo mismo desde el día uno."
            steps={[...altaSteps]}
            currentStep={currentStep}
            onStepChange={jumpToSection}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <EditorialPanel
                  className="scroll-mt-6"
                  contentClassName="space-y-5"
                  eyebrow="Ficha base"
                  title="Identificación y cobertura"
                  description="Estos datos alimentan listados, filtros y cruces por sede desde el minuto cero."
                >
                  <div id="proveedor-identificacion" className="grid gap-3 sm:grid-cols-3">
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Nombre</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.nombre?.trim() || "Pendiente"}</p>
                    </EditorialInset>
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Categoría</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.categoria}</p>
                    </EditorialInset>
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Sede</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.sede}</p>
                    </EditorialInset>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del proveedor</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="Ej: Servicios Norte SPA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RUT</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="76.123.456-7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85">
                                <SelectValue placeholder="Seleccioná una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem key={categoria} value={categoria}>
                                  {categoria}
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
                      name="sede"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sede principal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85">
                                <SelectValue placeholder="Seleccioná una sede" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sedes.map((sede) => (
                                <SelectItem key={sede} value={sede}>
                                  {sede}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </EditorialPanel>

                <EditorialPanel
                  className="scroll-mt-6"
                  eyebrow="Contacto"
                  title="Responsables y canales"
                  description="Dejá lista la contraparte para disparar evaluaciones, recordatorios y seguimiento sin pasos extra."
                >
                  <div id="proveedor-contacto" className="grid gap-3 sm:grid-cols-3">
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Responsable</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.contacto?.trim() || "Pendiente"}</p>
                    </EditorialInset>
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Correo</p>
                      <p className="mt-2 truncate text-sm font-semibold text-card-foreground">{watchedValues.email?.trim() || "Pendiente"}</p>
                    </EditorialInset>
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Teléfono</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.telefono?.trim() || "Pendiente"}</p>
                    </EditorialInset>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contacto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contacto principal</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="Nombre y apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="+56 9 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Correo de contacto</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-2xl border-border/70 bg-card/85" placeholder="contacto@proveedor.cl" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </EditorialPanel>

                <EditorialPanel
                  className="scroll-mt-6"
                  eyebrow="Preparación"
                  title="Contexto inicial de seguimiento"
                  description="Definí señales base para que el proveedor entre al circuito de monitoreo con contexto y sin maquillaje."
                >
                  <div id="proveedor-seguimiento" className="grid gap-3 sm:grid-cols-2">
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Lectura inicial</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">Criticidad {watchedValues.criticidad}</p>
                    </EditorialInset>
                    <EditorialInset className="border-border/65 bg-card/72 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Respaldo</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{watchedValues.contratoVigente ? "Contrato vigente informado" : "Contrato pendiente de validar"}</p>
                    </EditorialInset>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="criticidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Criticidad inicial</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-card/85">
                                <SelectValue placeholder="Seleccioná un nivel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {criticidades.map((criticidad) => (
                                <SelectItem key={criticidad} value={criticidad}>
                                  {criticidad}
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
                      name="contratoVigente"
                      render={({ field }) => (
                        <FormItem className="rounded-[1.35rem] border border-border/70 bg-card/70 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-semibold text-card-foreground">Contrato vigente</FormLabel>
                              <p className="text-sm leading-6 text-muted-foreground">
                                Marcá si el proveedor ya entra con respaldo contractual activo.
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                          <FormMessage className="pt-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </EditorialPanel>
              </form>
            </Form>

            <div className="space-y-6">
              <EditorialPanel
                eyebrow="Lectura rápida"
                title="Cómo entra al sistema"
                description="La vista previa evita un alta ciega y deja claro cómo se va a leer la ficha desde padrón, detalle y seguimiento."
              >
                <div className="space-y-4">
                  <EditorialInset className="space-y-4 border-border/70 bg-card/78">
                    <div className="space-y-1">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Vista previa editorial</p>
                      <p className="font-display text-[1.7rem] leading-none tracking-[-0.04em] text-card-foreground">{previewName}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        La ficha nace lista para listados, navegación al detalle y disparo de acciones correctivas sin cambiar el lenguaje visual.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs font-medium">
                        {watchedValues.categoria}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs font-medium">
                        {watchedValues.sede}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/70 px-3 py-1 text-xs font-medium"
                      >
                        Criticidad {watchedValues.criticidad}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs font-medium">
                        {watchedValues.contratoVigente ? "Contrato vigente" : "Sin contrato"}
                      </Badge>
                    </div>
                  </EditorialInset>

                  <EditorialInset className="border-border/70 bg-card/75">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-card-foreground">Alta lista para padrón</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Queda visible en listados, filtros por sede y acciones rápidas hacia evaluación o plan de acción.
                        </p>
                      </div>
                    </div>
                  </EditorialInset>
                  <EditorialInset tone="success" className="border-success/20 bg-status-success-soft/60">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-5 w-5 text-success" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-card-foreground">Estado inicial controlado</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Se registra como pendiente con calificación base en cero para evitar lecturas engañosas antes de evaluar.
                        </p>
                      </div>
                    </div>
                  </EditorialInset>
                  <EditorialInset tone="info" className="border-info/20 bg-status-info-soft/65">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-info" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-card-foreground">Próxima revisión sugerida</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          La próxima evaluación queda proyectada a 90 días para sostener consistencia con el resto del circuito.
                        </p>
                      </div>
                    </div>
                  </EditorialInset>
                </div>
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Checklist"
                title="Datos mínimos esperados"
                description="Antes de guardar, asegurate de que la ficha tenga contexto operativo real y no solo identidad legal."
              >
                <div className="space-y-3 text-sm text-muted-foreground">
                  <EditorialInset className="flex items-start gap-3 border-border/65 bg-card/70 p-4">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Nombre, RUT, categoría y sede dejan el proveedor listo para filtros y reportes.</span>
                  </EditorialInset>
                  <EditorialInset className="flex items-start gap-3 border-border/65 bg-card/70 p-4">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Contacto, correo y teléfono permiten iniciar seguimiento sin volver a pedir datos básicos.</span>
                  </EditorialInset>
                  <EditorialInset className="flex items-start gap-3 border-border/65 bg-card/70 p-4">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Criticidad y contrato vigente ajustan la lectura inicial del tablero sin alterar la lógica actual.</span>
                  </EditorialInset>
                </div>
              </EditorialPanel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
