"use client"

import { EditorialPanel, EditorialTextAction } from "@/components/editorial/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, TrendingDown } from "lucide-react"
import Link from "next/link"
import type { Proveedor } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CriticalSuppliersProps {
  suppliers: Proveedor[]
}

export function CriticalSuppliers({ suppliers }: CriticalSuppliersProps) {
  return (
    <EditorialPanel
      eyebrow="Foco inmediato"
      title="Proveedores Críticos"
      description="Lectura rápida de los casos con mayor exposición operativa y caída de desempeño."
      action={
        <Button variant="ghost" size="sm" className="rounded-full px-0 hover:bg-transparent" asChild>
          <Link href="/proveedores">
            <EditorialTextAction>Ver todos</EditorialTextAction>
          </Link>
        </Button>
      }
    >
        <div className="space-y-4">
          {suppliers.slice(0, 4).map((supplier) => {
            const scoreDiff = supplier.calificacionActual - supplier.calificacionAnterior
            const isDecreasing = scoreDiff < 0

            return (
              <div
                key={supplier.id}
                className="flex items-center gap-4 rounded-[1.35rem] border border-white/60 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_26%,white)_100%)] p-4 shadow-[0_16px_30px_-28px_color-mix(in_oklab,var(--foreground)_22%,transparent)] transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_20px_36px_-28px_color-mix(in_oklab,var(--foreground)_26%,transparent)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/15 bg-status-destructive-soft">
                  <span className="font-display text-[1.4rem] leading-none text-destructive">
                    {supplier.calificacionActual.toFixed(1)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-card-foreground">{supplier.nombre}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                        supplier.criticidad === "Alta" && "border-destructive/50 text-destructive",
                        supplier.criticidad === "Media" && "border-warning/40 text-warning"
                      )}
                    >
                      {supplier.criticidad}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{supplier.categoria}</span>
                    <span className="text-border">|</span>
                    <span>{supplier.sede}</span>
                  </div>
                </div>
                {isDecreasing && (
                  <div className="flex items-center gap-1 rounded-full bg-status-destructive-soft px-2.5 py-1 text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">{scoreDiff.toFixed(1)}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="rounded-full border-primary/15 bg-card/80 px-4" asChild>
                  <Link href={`/proveedores/${supplier.id}`}>
                    Ver detalle
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>
    </EditorialPanel>
  )
}
