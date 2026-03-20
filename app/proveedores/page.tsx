"use client"

import * as React from "react"
import { AppShell } from "@/components/app-shell"
import { EditorialPageHeader } from "@/components/editorial/ui"
import { SuppliersTable } from "@/components/proveedores/suppliers-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"
import { getProveedores } from "@/lib/services/proveedores"
import type { Proveedor } from "@/lib/types"

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])

  React.useEffect(() => {
    getProveedores().then(setProveedores)
  }, [])

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <EditorialPageHeader
            eyebrow="Base operativa"
            title="Gestion de Proveedores"
            description="Ordena el padrón, filtra criticidad y dispara acciones sin romper el lenguaje editorial del dashboard."
            meta={[
              { label: "Proveedores", value: proveedores.length },
              { label: "Criticos", value: proveedores.filter((proveedor) => proveedor.criticidad === "Alta").length, tone: "danger" },
              { label: "Pendientes", value: proveedores.filter((proveedor) => proveedor.estado === "Pendiente").length, tone: "warning" },
            ]}
            actions={
              <>
                <Button variant="outline" className="h-11 rounded-full border-primary/15 bg-card/80 px-5 gap-2">
                <Upload className="h-4 w-4" />
                Importar
                </Button>
                <Button className="h-11 rounded-full border border-primary/15 bg-linear-to-r from-primary via-primary to-accent px-5 gap-2 shadow-[0_18px_36px_-20px_color-mix(in_oklab,var(--primary)_72%,transparent)]" asChild>
                <Link href="/proveedores/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo Proveedor
                </Link>
                </Button>
              </>
            }
          />

          <SuppliersTable suppliers={proveedores} />
        </div>
      </div>
    </AppShell>
  )
}
