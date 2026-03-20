import Link from "next/link"
import { ArrowLeft, Construction, Settings, ShieldCheck, SlidersHorizontal, Users } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import {
  EditorialEmptyState,
  EditorialMetricCard,
  EditorialPageHeader,
  EditorialPanel,
} from "@/components/editorial/ui"
import { Button } from "@/components/ui/button"

export default function ConfiguracionPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <EditorialPageHeader
            eyebrow="Gobierno de la plataforma"
            title="Configuracion"
            description="La pantalla deja de ser un placeholder plano y pasa a anticipar el sistema de usuarios, criterios y parametros con el mismo tono editorial del resto del producto."
            meta={[
              { label: "Usuarios", value: "Proximo" },
              { label: "Criterios", value: "Proximo" },
              { label: "Sedes", value: "Proximo" },
            ]}
            actions={
              <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <EditorialMetricCard label="Usuarios y roles" value="IAM" detail="Perfiles, permisos y acceso" icon={Users} tone="default" />
            <EditorialMetricCard label="Criterios" value="QA" detail="Matrices y ponderaciones" icon={ShieldCheck} tone="info" />
            <EditorialMetricCard label="Parametros" value="OPS" detail="Sedes, periodos y alertas" icon={SlidersHorizontal} tone="warning" />
          </div>

          <EditorialPanel eyebrow="Roadmap" title="Modulo en consolidacion" description="La estructura ya sugiere que areas van a vivir aca cuando el equipo avance con la implementacion funcional.">
            <EditorialEmptyState
              icon={Construction}
              title="Configuracion en construccion"
              description="Pronto vas a poder administrar usuarios, roles, criterios de evaluación, sedes y parámetros generales del sistema desde un workspace coherente con el resto del producto."
              tone="warning"
              action={
                <Button className="rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]">
                  <Settings className="h-4 w-4" />
                  Definir prioridades
                </Button>
              }
            />
          </EditorialPanel>
        </div>
      </div>
    </AppShell>
  )
}
