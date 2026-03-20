"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { evaluacionFormSchema, type EvaluacionFormValues } from "@/lib/schemas"
import { useFormDraft } from "@/lib/hooks/use-form-draft"
import { createEvaluacion } from "@/lib/services/evaluaciones"
import { updateProveedor } from "@/lib/services/proveedores"
import { createPlanAccion } from "@/lib/services/planes-accion"
import { AppShell } from "@/components/app-shell"
import { EditorialMetricCard, EditorialPageHeader, EditorialPanel, EditorialStepper } from "@/components/editorial/ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Upload,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { proveedores } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const steps = [
  { id: 1, name: "Datos Generales", description: "Información básica de la evaluación" },
  { id: 2, name: "Criterios de Evaluación", description: "Evaluación de criterios principales" },
  { id: 3, name: "Riesgo Operacional", description: "Evaluación de riesgos operativos" },
  { id: 4, name: "Riesgo Reputacional", description: "Evaluación de riesgos de imagen" },
  { id: 5, name: "Observaciones", description: "Comentarios y evidencias" },
  { id: 6, name: "Resultado Final", description: "Resumen y confirmación" },
]

const criterios = [
  { id: "calidad", nombre: "Calidad del Servicio", peso: 25, descripcion: "Cumplimiento de estándares de calidad" },
  { id: "puntualidad", nombre: "Puntualidad", peso: 20, descripcion: "Cumplimiento de plazos acordados" },
  { id: "comunicacion", nombre: "Comunicación", peso: 15, descripcion: "Efectividad en la comunicación" },
  { id: "documentacion", nombre: "Documentación", peso: 15, descripcion: "Entrega de documentos requeridos" },
  { id: "capacidad", nombre: "Capacidad Técnica", peso: 15, descripcion: "Competencias técnicas del personal" },
  { id: "precio", nombre: "Relación Precio/Valor", peso: 10, descripcion: "Competitividad del servicio" },
]

const riesgosOperacionales = [
  { id: "continuidad", nombre: "Continuidad del Servicio", descripcion: "Capacidad de mantener el servicio sin interrupciones" },
  { id: "personal", nombre: "Gestión de Personal", descripcion: "Rotación, capacitación y disponibilidad" },
  { id: "recursos", nombre: "Recursos y Equipamiento", descripcion: "Disponibilidad de herramientas y equipos" },
  { id: "procesos", nombre: "Procesos Internos", descripcion: "Madurez y documentación de procesos" },
]

const riesgosReputacionales = [
  { id: "imagen", nombre: "Impacto en Imagen Institucional", descripcion: "Posible afectación a la reputación" },
  { id: "legal", nombre: "Cumplimiento Legal", descripcion: "Adherencia a normativas vigentes" },
  { id: "etico", nombre: "Conducta Ética", descripcion: "Comportamiento ético y transparente" },
]

const riskSeverityRank = { bajo: 0, medio: 1, alto: 2 } as const
const riskSeverityLabel: Record<keyof typeof riskSeverityRank, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
}

function getRiskToneClass(value: keyof typeof riskSeverityRank) {
  if (value === "alto") return "bg-destructive/15 text-destructive border-destructive/30"
  if (value === "medio") return "bg-[oklch(0.75_0.15_70/0.15)] text-[oklch(0.65_0.15_70)] border-[oklch(0.75_0.15_70/0.3)]"
  return "bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)] border-[oklch(0.6_0.15_155/0.3)]"
}

export default function NuevaEvaluacionPage() {
  const searchParams = useSearchParams()
  const proveedorId = searchParams.get("proveedor")
  const proveedor = proveedores.find(p => p.id === proveedorId) || proveedores[0]
  const router = useRouter()

  const [currentStep, setCurrentStep] = React.useState(1)

  const form = useForm<EvaluacionFormValues>({
    resolver: zodResolver(evaluacionFormSchema),
    defaultValues: {
      proveedorId: proveedor.id,
      periodo: "Q1 2026",
      evaluador: "Ana Martínez",
      fecha: new Date().toISOString().split("T")[0],
      criterios: {},
      riesgosOperacionales: {},
      riesgosReputacionales: {},
      observaciones: "",
      hallazgos: "",
    },
  })

  const { saveDraft, clearDraft } = useFormDraft("evaluacion-nueva", form)

  const progress = (currentStep / steps.length) * 100

  const calcularCalificacion = () => {
    const criteriosValues = form.watch("criterios")
    let total = 0
    let pesoTotal = 0
    criterios.forEach((criterio) => {
      const valor = criteriosValues[criterio.id] || 0
      total += valor * (criterio.peso / 100)
      if (valor > 0) pesoTotal += criterio.peso
    })
    return pesoTotal > 0 ? (total / (pesoTotal / 100)).toFixed(1) : "0.0"
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    saveDraft()
    toast.success("Borrador guardado", {
      description: "La evaluación se ha guardado como borrador.",
    })
  }

  const updateCriterio = (criterioId: string, valor: number[]) => {
    form.setValue("criterios", { ...form.getValues("criterios"), [criterioId]: valor[0] })
  }

  const updateRiesgoOperacional = (riesgoId: string, valor: string) => {
    form.setValue("riesgosOperacionales", { ...form.getValues("riesgosOperacionales"), [riesgoId]: valor as "bajo" | "medio" | "alto" })
  }

  const updateRiesgoReputacional = (riesgoId: string, valor: string) => {
    form.setValue("riesgosReputacionales", { ...form.getValues("riesgosReputacionales"), [riesgoId]: valor as "bajo" | "medio" | "alto" })
  }

  const handleSubmit = async (values: EvaluacionFormValues) => {
    // Compute weighted score
    let total = 0
    let pesoTotal = 0
    criterios.forEach((criterio) => {
      const valor = values.criterios[criterio.id] || 0
      total += valor * (criterio.peso / 100)
      if (valor > 0) pesoTotal += criterio.peso
    })
    const calificacion = pesoTotal > 0 ? parseFloat((total / (pesoTotal / 100)).toFixed(1)) : 0

    // Compute riesgo summary (take highest risk from each category)
    const riesgoMap = { bajo: 0, medio: 1, alto: 2 } as const
    const riesgosOpValues = Object.values(values.riesgosOperacionales)
    const riesgosRepValues = Object.values(values.riesgosReputacionales)
    const maxRiesgoOp = riesgosOpValues.reduce(
      (max, v) => riesgoMap[v as keyof typeof riesgoMap] > riesgoMap[max as keyof typeof riesgoMap] ? v : max,
      "bajo"
    )
    const maxRiesgoRep = riesgosRepValues.reduce(
      (max, v) => riesgoMap[v as keyof typeof riesgoMap] > riesgoMap[max as keyof typeof riesgoMap] ? v : max,
      "bajo"
    )
    const riesgoToNivel = (r: string) =>
      r === "alto" ? "Alta" as const : r === "medio" ? "Media" as const : "Baja" as const

    try {
      const newEvaluacion = await createEvaluacion({
        proveedorId: values.proveedorId,
        fecha: values.fecha,
        periodo: values.periodo,
        sede: proveedor.sede,
        calificacion,
        evaluador: values.evaluador,
        estado: "Evaluado",
        riesgoOperacional: riesgoToNivel(maxRiesgoOp),
        riesgoReputacional: riesgoToNivel(maxRiesgoRep),
        observaciones: values.observaciones || "",
      })

      // Update proveedor score
      await updateProveedor(values.proveedorId, {
        calificacionAnterior: proveedor.calificacionActual,
        calificacionActual: calificacion,
        fechaUltimaEvaluacion: values.fecha,
        estado: calificacion < 3 ? "Crítico" : "Evaluado",
      })

      // Auto-generate plan de acción if calificacion < 3
      if (calificacion < 3) {
        await createPlanAccion({
          proveedorId: values.proveedorId,
          evaluacionId: newEvaluacion.id,
          hallazgo: "Calificación inferior a 3.0 — requiere plan de acción correctiva",
          accionCorrectiva: "Definir acciones correctivas con el proveedor en un plazo de 15 días hábiles",
          responsable: values.evaluador || "Por asignar",
          fechaCompromiso: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          estado: "Pendiente",
        })
        clearDraft()
        toast.success("Evaluación creada. Se generó un plan de acción automático.")
      } else {
        clearDraft()
        toast.success("Evaluación enviada", {
          description: "La evaluación ha sido registrada exitosamente.",
        })
      }

      router.push("/evaluaciones")
    } catch {
      toast.error("Error al guardar", {
        description: "No se pudo registrar la evaluación.",
      })
    }
  }

  const currentStepConfig = steps[currentStep - 1]
  const scoreValue = parseFloat(calcularCalificacion())
  const riesgosOpValues = Object.values(form.getValues("riesgosOperacionales"))
  const riesgosRepValues = Object.values(form.getValues("riesgosReputacionales"))
  const maxRiesgoOp = riesgosOpValues.reduce(
    (max, value) => riskSeverityRank[value as keyof typeof riskSeverityRank] > riskSeverityRank[max as keyof typeof riskSeverityRank] ? value : max,
    "bajo",
  ) as keyof typeof riskSeverityRank
  const maxRiesgoRep = riesgosRepValues.reduce(
    (max, value) => riskSeverityRank[value as keyof typeof riskSeverityRank] > riskSeverityRank[max as keyof typeof riskSeverityRank] ? value : max,
    "bajo",
  ) as keyof typeof riskSeverityRank

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <EditorialPageHeader
            eyebrow="Evaluación guiada"
            title="Nueva evaluación"
            description="El flujo conserva la lógica actual, pero ahora ordena pasos, contexto del proveedor y resultados con el mismo lenguaje editorial del resto del producto."
            meta={[
              { label: "Proveedor", value: proveedor.nombre },
              { label: "Paso", value: `${currentStep}/${steps.length}`, tone: "info" },
              { label: "Avance", value: `${Math.round(progress)}%`, tone: currentStep === steps.length ? "success" : "warning" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" asChild>
                  <Link href="/evaluaciones">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a evaluaciones
                  </Link>
                </Button>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar borrador
                </Button>
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
            <div className="space-y-6">
              <EditorialStepper
                eyebrow="Recorrido"
                title="Paso actual y navegación"
                description="Compacta el estado del flujo, da contexto editorial al bloque activo y te deja saltar entre etapas sin ruido visual."
                steps={steps}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />

              <EditorialPanel
                eyebrow="Trabajo activo"
                title={currentStepConfig.name}
                description={currentStepConfig.description}
              >
                <div key={currentStep} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Step 1: Datos Generales */}
              {currentStep === 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Proveedor</Label>
                    <Select value={form.watch("proveedorId")} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedores.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Periodo de Evaluación</Label>
                    <Select value={form.watch("periodo")} onValueChange={(v) => form.setValue("periodo", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                        <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                        <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Evaluador</Label>
                    <Input value={form.watch("evaluador")} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Evaluación</Label>
                    <Input type="date" value={form.watch("fecha")} onChange={(e) => form.setValue("fecha", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 rounded-[1.35rem] border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-accent">Información del Proveedor</p>
                        <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                          <div>
                            <span className="text-card-foreground font-medium">Categoría:</span> {proveedor.categoria}
                          </div>
                          <div>
                            <span className="text-card-foreground font-medium">Sede:</span> {proveedor.sede}
                          </div>
                          <div>
                            <span className="text-card-foreground font-medium">Calificación anterior:</span> {proveedor.calificacionAnterior.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Criterios de Evaluación */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-[1.35rem] border border-border/65 bg-card/75 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calificación Ponderada</span>
                      <span className={cn(
                        "text-2xl font-bold",
                        scoreValue >= 4 && "text-[oklch(0.5_0.15_155)]",
                        scoreValue >= 3 && scoreValue < 4 && "text-[oklch(0.65_0.15_70)]",
                        scoreValue < 3 && "text-destructive"
                      )}>
                        {calcularCalificacion()} / 5.0
                      </span>
                    </div>
                  </div>

                  {criterios.map((criterio) => (
                    <div key={criterio.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">{criterio.nombre}</Label>
                          <p className="text-sm text-muted-foreground">{criterio.descripcion}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          Peso: {criterio.peso}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[form.watch("criterios")[criterio.id] || 0]}
                          onValueChange={(v) => updateCriterio(criterio.id, v)}
                          max={5}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className={cn(
                          "w-12 text-center text-lg font-bold",
                          (form.watch("criterios")[criterio.id] || 0) >= 4 && "text-[oklch(0.5_0.15_155)]",
                          (form.watch("criterios")[criterio.id] || 0) >= 3 && (form.watch("criterios")[criterio.id] || 0) < 4 && "text-[oklch(0.65_0.15_70)]",
                          (form.watch("criterios")[criterio.id] || 0) < 3 && (form.watch("criterios")[criterio.id] || 0) > 0 && "text-destructive"
                        )}>
                          {form.watch("criterios")[criterio.id]?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Riesgo Operacional */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {riesgosOperacionales.map((riesgo) => (
                    <div key={riesgo.id} className="space-y-3">
                      <div>
                        <Label className="text-base">{riesgo.nombre}</Label>
                        <p className="text-sm text-muted-foreground">{riesgo.descripcion}</p>
                      </div>
                      <RadioGroup
                        value={form.watch("riesgosOperacionales")[riesgo.id] || ""}
                        onValueChange={(v) => updateRiesgoOperacional(riesgo.id, v)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bajo" id={`${riesgo.id}-bajo`} />
                          <Label htmlFor={`${riesgo.id}-bajo`} className="text-[oklch(0.5_0.15_155)] cursor-pointer">Bajo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medio" id={`${riesgo.id}-medio`} />
                          <Label htmlFor={`${riesgo.id}-medio`} className="text-[oklch(0.65_0.15_70)] cursor-pointer">Medio</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="alto" id={`${riesgo.id}-alto`} />
                          <Label htmlFor={`${riesgo.id}-alto`} className="text-destructive cursor-pointer">Alto</Label>
                        </div>
                      </RadioGroup>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Riesgo Reputacional */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {riesgosReputacionales.map((riesgo) => (
                    <div key={riesgo.id} className="space-y-3">
                      <div>
                        <Label className="text-base">{riesgo.nombre}</Label>
                        <p className="text-sm text-muted-foreground">{riesgo.descripcion}</p>
                      </div>
                      <RadioGroup
                        value={form.watch("riesgosReputacionales")[riesgo.id] || ""}
                        onValueChange={(v) => updateRiesgoReputacional(riesgo.id, v)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bajo" id={`rep-${riesgo.id}-bajo`} />
                          <Label htmlFor={`rep-${riesgo.id}-bajo`} className="text-[oklch(0.5_0.15_155)] cursor-pointer">Bajo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medio" id={`rep-${riesgo.id}-medio`} />
                          <Label htmlFor={`rep-${riesgo.id}-medio`} className="text-[oklch(0.65_0.15_70)] cursor-pointer">Medio</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="alto" id={`rep-${riesgo.id}-alto`} />
                          <Label htmlFor={`rep-${riesgo.id}-alto`} className="text-destructive cursor-pointer">Alto</Label>
                        </div>
                      </RadioGroup>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Observaciones */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Observaciones Generales</Label>
                    <Textarea
                      placeholder="Ingrese observaciones generales sobre el desempeño del proveedor..."
                      value={form.watch("observaciones") || ""}
                      onChange={(e) => form.setValue("observaciones", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hallazgos y Oportunidades de Mejora</Label>
                    <Textarea
                      placeholder="Describa los hallazgos identificados y oportunidades de mejora..."
                      value={form.watch("hallazgos") || ""}
                      onChange={(e) => form.setValue("hallazgos", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Evidencias</Label>
                    <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 font-medium">Arrastre archivos aquí o haga clic para subir</p>
                      <p className="text-sm text-muted-foreground">PDF, imágenes, documentos (máx. 10MB)</p>
                      <Button variant="outline" className="mt-4">
                        Seleccionar archivos
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Resultado Final */}
              {currentStep === 6 && (
                <div className="space-y-6">
                    <div className="rounded-[1.5rem] border border-border/65 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Calificación Final</p>
                        <p className={cn(
                          "mt-2 text-5xl font-bold",
                          scoreValue >= 4 && "text-[oklch(0.5_0.15_155)]",
                          scoreValue >= 3 && scoreValue < 4 && "text-[oklch(0.65_0.15_70)]",
                          scoreValue < 3 && "text-destructive"
                        )}>
                          {calcularCalificacion()}
                        </p>
                      <p className="text-muted-foreground">de 5.0 puntos</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {(() => {
                      const riesgosOpValues = Object.values(form.getValues("riesgosOperacionales"))
                      const riesgosRepValues = Object.values(form.getValues("riesgosReputacionales"))
                      const maxRiesgoOp = riesgosOpValues.reduce(
                        (max, v) => riskSeverityRank[v as keyof typeof riskSeverityRank] > riskSeverityRank[max as keyof typeof riskSeverityRank] ? v : max,
                        "bajo"
                      )
                      const maxRiesgoRep = riesgosRepValues.reduce(
                        (max, v) => riskSeverityRank[v as keyof typeof riskSeverityRank] > riskSeverityRank[max as keyof typeof riskSeverityRank] ? v : max,
                        "bajo"
                      )
                      const labelMap: Record<string, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto" }
                      const opLabel = labelMap[maxRiesgoOp] ?? "Sin datos"
                      const repLabel = labelMap[maxRiesgoRep] ?? "Sin datos"

                      return (
                        <>
                          <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-[oklch(0.65_0.15_70)]" />
                              <span className="font-medium">Riesgo Operacional</span>
                            </div>
                            <Badge variant="outline" className={cn("mt-2", getRiskToneClass(maxRiesgoOp as keyof typeof riskSeverityRank))}>
                              {opLabel}
                            </Badge>
                          </div>
                          <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-[oklch(0.5_0.15_155)]" />
                              <span className="font-medium">Riesgo Reputacional</span>
                            </div>
                            <Badge variant="outline" className={cn("mt-2", getRiskToneClass(maxRiesgoRep as keyof typeof riskSeverityRank))}>
                              {repLabel}
                            </Badge>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="rounded-[1.35rem] border border-border/65 bg-card/75 p-4">
                    <h4 className="font-medium">Resumen de Criterios</h4>
                    <div className="mt-4 space-y-2">
                      {criterios.map((criterio) => (
                        <div key={criterio.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{criterio.nombre}</span>
                          <span className="font-medium">
                            {form.watch("criterios")[criterio.id]?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {scoreValue < 3 && (
                    <div className="rounded-[1.35rem] border border-destructive/30 bg-destructive/10 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                        <div>
                          <p className="font-medium text-destructive">Requiere Plan de Acción</p>
                          <p className="mt-1 text-sm text-destructive/80">
                            La calificación es inferior a 3.0. Se generará automáticamente un plan de acción correctiva.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>
              </EditorialPanel>

              <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-card/70 px-4 py-4 shadow-sm">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                {currentStep < steps.length ? (
                  <Button className="rounded-full" onClick={handleNext}>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => form.handleSubmit(handleSubmit)()} className="rounded-full bg-accent hover:bg-accent/90">
                    <Check className="mr-2 h-4 w-4" />
                    Enviar evaluación
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <EditorialMetricCard label="Calificación viva" value={calcularCalificacion()} detail="Promedio ponderado actual" tone={scoreValue < 3 ? "danger" : scoreValue < 4 ? "warning" : "success"} />
                <EditorialMetricCard label="Borrador" value={currentStepConfig.name} detail="Bloque activo de trabajo" tone="info" />
              </div>

              <EditorialPanel
                eyebrow="Contexto del proveedor"
                title={proveedor.nombre}
                description="La ficha lateral evita que evalúes a ciegas mientras recorrés criterios, riesgos y hallazgos."
              >
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Categoría</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{proveedor.categoria}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Sede</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{proveedor.sede}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Estado actual</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{proveedor.estado}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Calificación previa</p>
                      <p className="mt-2 text-sm font-semibold text-card-foreground">{proveedor.calificacionAnterior.toFixed(1)} / 5.0</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Riesgo operacional</p>
                      <Badge variant="outline" className={cn("mt-2", getRiskToneClass(maxRiesgoOp))}>
                        {riskSeverityLabel[maxRiesgoOp]}
                      </Badge>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/65 bg-card/75 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">Riesgo reputacional</p>
                      <Badge variant="outline" className={cn("mt-2", getRiskToneClass(maxRiesgoRep))}>
                        {riskSeverityLabel[maxRiesgoRep]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </EditorialPanel>

              <EditorialPanel
                eyebrow="Guía"
                title="Qué se espera de esta evaluación"
                description="Una evaluación útil describe realidad operativa, no maquillaje para que el tablero se vea prolijo."
              >
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    Registrá evidencia concreta en observaciones y hallazgos, no frases genéricas que después nadie puede accionar.
                  </div>
                  <div className="rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    Si la calificación cae bajo 3.0, el sistema mantiene la lógica actual y genera un plan correctivo automático.
                  </div>
                  <div className="rounded-[1.2rem] border border-border/65 bg-card/70 p-4">
                    El resumen lateral te ayuda a decidir con contexto antes de cerrar el resultado final.
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
