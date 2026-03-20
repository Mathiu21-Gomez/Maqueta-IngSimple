import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ClipboardCheck, Construction, CalendarDays, UserRound } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import {
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialPanel,
} from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { evaluaciones, proveedores } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default async function EvaluacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const evaluacion = evaluaciones.find((item) => item.id === id)

  if (!evaluacion) {
    notFound()
  }

  const proveedor = proveedores.find((item) => item.id === evaluacion.proveedorId)

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <EditorialPageHeader
            eyebrow="Detalle en evolucion"
            title={`Evaluacion ${evaluacion.periodo}`}
            description={`${proveedor?.nombre || "Proveedor"} · ${evaluacion.sede}. La pantalla todavia no expone el desglose completo, pero ya adopta el mismo sistema visual del resto del producto.`}
            meta={[
              { label: "Estado", value: evaluacion.estado, tone: evaluacion.estado === "Pendiente" ? "info" : evaluacion.estado === "En evaluación" ? "warning" : "success" },
              { label: "Score", value: evaluacion.calificacion.toFixed(1), tone: evaluacion.calificacion < 3 ? "danger" : evaluacion.calificacion < 4 ? "warning" : "success" },
            ]}
            actions={
              <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2" asChild>
                <Link href="/evaluaciones">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Evaluaciones
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <EditorialMetricCard
              label="Calificacion"
              value={evaluacion.calificacion.toFixed(1)}
              detail="Escala sobre 5.0"
              icon={ClipboardCheck}
              tone={evaluacion.calificacion < 3 ? "danger" : evaluacion.calificacion < 4 ? "warning" : "success"}
            />
            <EditorialMetricCard label="Evaluador" value={evaluacion.evaluador} detail="Responsable del cierre" icon={UserRound} tone="default" />
            <EditorialMetricCard
              label="Fecha"
              value={new Date(evaluacion.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
              detail="Registro mas reciente"
              icon={CalendarDays}
              tone="info"
            />
          </div>

          <EditorialPanel eyebrow="Proximamente" title="Desglose editorial de la evaluacion" description="El contenedor ya queda listo para criterios, riesgos, observaciones y evidencias cuando se implemente el detalle funcional.">
            <div className="mb-4 flex items-center gap-3">
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full px-3 py-1 font-normal",
                  evaluacion.estado === "Evaluado" && "bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)]",
                  evaluacion.estado === "En evaluación" && "bg-accent/15 text-accent",
                  evaluacion.estado === "Pendiente" && "bg-muted text-muted-foreground",
                )}
              >
                {evaluacion.estado}
              </Badge>
            </div>
            <EditorialEmptyState
              icon={Construction}
              title="Detalle en construccion"
              description="Pronto vas a poder ver criterios, riesgos operacionales y reputacionales, observaciones y evidencias adjuntas sin salir de esta vista."
              tone="warning"
            />
          </EditorialPanel>
        </div>
      </div>
    </AppShell>
  )
}
