"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, Plus } from "lucide-react"
import Link from "next/link"

interface WelcomeHeaderProps {
  proveedoresActivos?: number
  planesPendientes?: number
  evaluacionesPendientes?: number
}

export function WelcomeHeader({
  proveedoresActivos = 0,
  planesPendientes = 0,
  evaluacionesPendientes = 0,
}: WelcomeHeaderProps) {
  const currentDate = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-linear-to-br from-card via-card to-secondary/60 p-6 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.22)] lg:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-border/70 to-transparent lg:block hidden" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-card-foreground lg:text-3xl">
            Panel de Control
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">{proveedoresActivos}</span> proveedores activos
            {" · "}
            <span className="font-medium text-card-foreground">{planesPendientes}</span> planes pendientes
            {" · "}
            <span className="font-medium text-card-foreground">{evaluacionesPendientes}</span> evaluaciones pendientes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            className="h-11 rounded-xl border border-primary/20 bg-linear-to-r from-primary via-primary to-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_16px_30px_-18px_hsl(var(--primary)/0.72)] transition-transform duration-200 hover:-translate-y-0.5 hover:from-primary/95 hover:via-primary hover:to-accent/95 hover:shadow-[0_20px_36px_-18px_hsl(var(--primary)/0.8)]"
            asChild
          >
            <Link href="/evaluaciones/nueva">
              <Plus className="h-4 w-4" />
              Nueva Evaluación
              <ArrowUpRight className="h-4 w-4 opacity-80" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
