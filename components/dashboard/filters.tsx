"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Filter, RotateCcw, X } from "lucide-react"

const sedes = [
  { value: "all", label: "Todas las sedes" },
  { value: "Campus Norte", label: "Campus Norte" },
  { value: "Campus Sur", label: "Campus Sur" },
  { value: "Campus Central", label: "Campus Central" },
  { value: "Campus Oriente", label: "Campus Oriente" },
  { value: "Nivel Central", label: "Nivel Central" },
]

const periodos = [
  { value: "all", label: "Todos los periodos" },
  { value: "q1-2026", label: "Q1 2026" },
  { value: "q4-2025", label: "Q4 2025" },
  { value: "q3-2025", label: "Q3 2025" },
  { value: "q2-2025", label: "Q2 2025" },
]

const categorias = [
  { value: "all", label: "Todas las categorías" },
  { value: "Seguridad", label: "Seguridad" },
  { value: "Aseo", label: "Aseo" },
  { value: "Mantención", label: "Mantención" },
  { value: "Alimentación", label: "Alimentación" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "Transporte", label: "Transporte" },
]

const estados = [
  { value: "all", label: "Todos los estados" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "En evaluación", label: "En evaluación" },
  { value: "Evaluado", label: "Evaluado" },
  { value: "Con plan de acción", label: "Con plan de acción" },
  { value: "Crítico", label: "Crítico" },
]

const criticidades = [
  { value: "all", label: "Todas las criticidades" },
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
]

interface FilterState {
  sede: string
  periodo: string
  categoria: string
  estado: string
  criticidad: string
}

interface DashboardFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const filterLabels: Record<keyof FilterState, Record<string, string>> = {
  sede: Object.fromEntries(sedes.map(s => [s.value, s.label])),
  periodo: Object.fromEntries(periodos.map(p => [p.value, p.label])),
  categoria: Object.fromEntries(categorias.map(c => [c.value, c.label])),
  estado: Object.fromEntries(estados.map(e => [e.value, e.label])),
  criticidad: Object.fromEntries(criticidades.map(c => [c.value, c.label])),
}

export function DashboardFilters({ filters, onFilterChange }: DashboardFiltersProps) {
  const selectTriggerClassNames: Record<keyof FilterState, string> = {
    sede: "h-10 w-full rounded-xl border-border/70 bg-card/90 shadow-xs sm:min-w-[12rem] sm:w-auto",
    periodo: "h-10 w-full rounded-xl border-border/70 bg-card/90 shadow-xs sm:min-w-[9.5rem] sm:w-auto",
    categoria: "h-10 w-full rounded-xl border-border/70 bg-card/90 shadow-xs sm:min-w-[11.5rem] sm:w-auto",
    estado: "h-10 w-full rounded-xl border-border/70 bg-card/90 shadow-xs sm:min-w-[12.5rem] sm:w-auto",
    criticidad: "h-10 w-full rounded-xl border-border/70 bg-card/90 shadow-xs sm:min-w-[10rem] sm:w-auto",
  }

  const update = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleClear = () => {
    onFilterChange({ sede: "all", periodo: "all", categoria: "all", estado: "all", criticidad: "all" })
  }

  const activeFilters = (Object.keys(filters) as (keyof FilterState)[]).filter(
    key => filters[key] !== "all"
  )

  return (
    <div className="space-y-3">
      <div className="rounded-[1.5rem] border border-border/70 bg-linear-to-br from-card via-card to-secondary/40 p-4 shadow-[0_18px_40px_-34px_hsl(var(--foreground)/0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Ajuste del panel
              </p>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                Filtrá la vista por sede, periodo y riesgo
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl border-primary/18 bg-card/80 px-4 text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
            onClick={handleClear}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">

          <Select value={filters.sede} onValueChange={(v) => update("sede", v)}>
            <SelectTrigger className={selectTriggerClassNames.sede}>
              <SelectValue placeholder="Sede" />
            </SelectTrigger>
            <SelectContent>
              {sedes.map((sede) => (
                <SelectItem key={sede.value} value={sede.value}>
                  {sede.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.periodo} onValueChange={(v) => update("periodo", v)}>
            <SelectTrigger className={selectTriggerClassNames.periodo}>
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((periodo) => (
                <SelectItem key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.categoria} onValueChange={(v) => update("categoria", v)}>
            <SelectTrigger className={selectTriggerClassNames.categoria}>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.estado} onValueChange={(v) => update("estado", v)}>
            <SelectTrigger className={selectTriggerClassNames.estado}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.criticidad} onValueChange={(v) => update("criticidad", v)}>
            <SelectTrigger className={selectTriggerClassNames.criticidad}>
              <SelectValue placeholder="Criticidad" />
            </SelectTrigger>
            <SelectContent>
              {criticidades.map((criticidad) => (
                <SelectItem key={criticidad.value} value={criticidad.value}>
                  {criticidad.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(key => (
            <Badge
              key={key}
              variant="secondary"
              className="animate-in fade-in zoom-in-95 duration-200 gap-1.5 border-primary/15 bg-primary/10 text-primary pr-1.5"
            >
              {filterLabels[key][filters[key]]}
              <button
                onClick={() => update(key, "all")}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/12"
                aria-label={`Quitar filtro ${filterLabels[key][filters[key]]}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
