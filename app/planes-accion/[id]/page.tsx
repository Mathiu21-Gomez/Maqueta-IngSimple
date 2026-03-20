import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Construction, FileWarning, History } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import {
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialPanel,
} from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { planesAccion, proveedores } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const estadoStyles: Record<string, string> = {
  Pendiente: "bg-muted text-muted-foreground",
  "En progreso": "bg-accent/15 text-accent",
  Completado: "bg-[oklch(0.6_0.15_155/0.15)] text-[oklch(0.5_0.15_155)]",
  Vencido: "bg-destructive/15 text-destructive",
  Escalado: "bg-destructive/15 text-destructive",
}

export default async function PlanAccionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = planesAccion.find((item) => item.id === id)

  if (!plan) {
    notFound()
  }

  const proveedor = proveedores.find((item) => item.id === plan.proveedorId)

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <EditorialPageHeader
            eyebrow="Seguimiento correctivo"
            title="Plan de Accion"
            description={`${proveedor?.nombre || "Proveedor"} · ${plan.responsable}. La vista todavía no tiene workflow completo, pero ya habla el mismo idioma visual que el dashboard.`}
            meta={[
              { label: "Estado", value: plan.estado, tone: plan.estado === "Completado" ? "success" : plan.estado === "En progreso" ? "warning" : plan.estado === "Pendiente" ? "info" : "danger" },
              { label: "Compromiso", value: new Date(plan.fechaCompromiso).toLocaleDateString("es-CL", { day: "numeric", month: "short" }) },
            ]}
            actions={
              <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2" asChild>
                <Link href="/planes-accion">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Planes
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <EditorialMetricCard label="Hallazgo" value={plan.hallazgo} detail="Punto de origen" icon={FileWarning} tone="danger" />
            <EditorialMetricCard
              label="Fecha compromiso"
              value={new Date(plan.fechaCompromiso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
              detail="Fecha objetivo"
              icon={CalendarDays}
              tone="warning"
            />
            <EditorialMetricCard
              label="Ultima actualizacion"
              value={new Date(plan.fechaActualizacion).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
              detail="Seguimiento mas reciente"
              icon={History}
              tone="info"
            />
          </div>

          <EditorialPanel eyebrow="Proximamente" title="Gestion detallada del plan" description="Este bloque queda listo para avances, evidencias, escalamiento y cierre cuando entre la capa funcional.">
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="secondary" className={cn("rounded-full px-3 py-1 font-normal", estadoStyles[plan.estado] || "")}>{plan.estado}</Badge>
            </div>
            <EditorialEmptyState
              icon={Construction}
              title="Gestion en construccion"
              description="La próxima iteración va a registrar avances, subir evidencias, escalar y cerrar planes sin salir de este espacio."
              tone="warning"
            />
          </EditorialPanel>
        </div>
      </div>
    </AppShell>
  )
}
