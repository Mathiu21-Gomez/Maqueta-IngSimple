"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { EditorialDataTable, EditorialEmptyState, EditorialToolbar } from "@/components/editorial/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Download, 
  ClipboardCheck, 
  FileWarning,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Proveedor, EstadoEvaluacion, NivelCriticidad } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface SuppliersTableProps {
  suppliers: Proveedor[]
}

const estadoStyles: Record<EstadoEvaluacion, { bg: string; text: string }> = {
  "Pendiente": { bg: "bg-muted", text: "text-muted-foreground" },
  "En evaluación": { bg: "bg-accent/15", text: "text-accent" },
  "Evaluado": { bg: "bg-[oklch(0.6_0.15_155/0.15)]", text: "text-[oklch(0.5_0.15_155)]" },
  "Con plan de acción": { bg: "bg-[oklch(0.75_0.15_70/0.15)]", text: "text-[oklch(0.65_0.15_70)]" },
  "Crítico": { bg: "bg-destructive/15", text: "text-destructive" },
}

const criticidadStyles: Record<NivelCriticidad, { bg: string; text: string }> = {
  "Alta": { bg: "bg-destructive/15", text: "text-destructive" },
  "Media": { bg: "bg-[oklch(0.75_0.15_70/0.15)]", text: "text-[oklch(0.65_0.15_70)]" },
  "Baja": { bg: "bg-[oklch(0.6_0.15_155/0.15)]", text: "text-[oklch(0.5_0.15_155)]" },
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const filterSelectTriggerClassName = "w-full sm:min-w-[10rem] sm:w-auto"

  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("todos")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [sedeFilter, setSedeFilter] = React.useState("all")

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.categoria.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || supplier.categoria.toLowerCase() === categoryFilter
    const matchesSede = sedeFilter === "all" || supplier.sede.toLowerCase().replace(/\s+/g, "-") === sedeFilter
    
    if (activeTab === "todos") return matchesSearch && matchesCategory && matchesSede
    if (activeTab === "pendientes") return matchesSearch && matchesCategory && matchesSede && supplier.estado === "Pendiente"
    if (activeTab === "criticos") return matchesSearch && matchesCategory && matchesSede && (supplier.criticidad === "Alta" || supplier.calificacionActual < 3.0)
    if (activeTab === "con-plan") return matchesSearch && matchesCategory && matchesSede && supplier.estado === "Con plan de acción"
    return matchesSearch && matchesCategory && matchesSede
  })

  const hasActiveFilters = searchQuery.trim().length > 0 || categoryFilter !== "all" || sedeFilter !== "all"

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAll = () => {
    if (selectedRows.size === filteredSuppliers.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredSuppliers.map(s => s.id)))
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-[oklch(0.5_0.15_155)]" />
    if (diff < 0) return <TrendingDown className="h-3 w-3 text-destructive" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getScoreClassName = (score: number) =>
    cn(
      "text-2xl font-semibold tabular-nums tracking-[-0.04em]",
      score >= 4 && "text-[oklch(0.5_0.15_155)]",
      score >= 3 && score < 4 && "text-[oklch(0.65_0.15_70)]",
      score < 3 && "text-destructive"
    )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto rounded-[1.15rem] border border-white/60 bg-card/75 p-1.5 shadow-sm">
          <TabsTrigger value="todos">Todos ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes ({suppliers.filter(s => s.estado === "Pendiente").length})
          </TabsTrigger>
          <TabsTrigger value="criticos">
            Críticos ({suppliers.filter(s => s.criticidad === "Alta").length})
          </TabsTrigger>
          <TabsTrigger value="con-plan">
            Con Plan ({suppliers.filter(s => s.estado === "Con plan de acción").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <EditorialToolbar
        eyebrow="Vista filtrable"
        title="Explora el padrón por estado, categoria y sede"
        description="Los filtros priorizan lectura, seleccion múltiple y salida rápida a evaluación o plan de accion."
      >
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-full border-border/70 bg-card/90 pl-9 shadow-xs"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className={`${filterSelectTriggerClassName} h-11 rounded-full border-border/70 bg-card/90 shadow-xs`}>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="seguridad">Seguridad</SelectItem>
            <SelectItem value="aseo">Aseo</SelectItem>
            <SelectItem value="mantención">Mantención</SelectItem>
            <SelectItem value="alimentación">Alimentación</SelectItem>
            <SelectItem value="tecnología">Tecnología</SelectItem>
            <SelectItem value="transporte">Transporte</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sedeFilter} onValueChange={setSedeFilter}>
          <SelectTrigger className="h-11 w-full rounded-full border-border/70 bg-card/90 shadow-xs sm:min-w-[11rem] sm:w-auto">
            <SelectValue placeholder="Sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            <SelectItem value="norte">Campus Norte</SelectItem>
            <SelectItem value="sur">Campus Sur</SelectItem>
            <SelectItem value="central">Campus Central</SelectItem>
            <SelectItem value="oriente">Campus Oriente</SelectItem>
            <SelectItem value="nivel-central">Nivel Central</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-11 rounded-full px-4"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setSedeFilter("all")
              }}
            >
              Limpiar filtros
            </Button>
          ) : null}
          {selectedRows.size > 0 && (
            <span className="rounded-full bg-primary/8 px-3 py-2 text-sm text-primary">
              {selectedRows.size} seleccionados
            </span>
          )}
          <Button variant="outline" size="sm" className="h-11 rounded-full border-primary/15 bg-card/85 gap-2 px-4">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </EditorialToolbar>

      <EditorialDataTable>
        <div className="w-full min-w-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === filteredSuppliers.length && filteredSuppliers.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado operativo</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Seguimiento</TableHead>
              <TableHead className="w-[18rem] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <EditorialEmptyState
                    icon={Search}
                    title="Sin proveedores en esta vista"
                    description="Ajustá tabs o filtros para volver a traer proveedores al panel."
                    tone="info"
                    className="border-0 bg-transparent py-6"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow 
                  key={supplier.id}
                  className={cn(
                    "group border-b border-border/45 transition-colors hover:bg-[color-mix(in_oklab,var(--color-card)_86%,white)]",
                    selectedRows.has(supplier.id) && "bg-accent/5"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(supplier.id)}
                      onCheckedChange={() => toggleRow(supplier.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[15rem] py-1">
                      <Link 
                        href={`/proveedores/${supplier.id}`}
                        className="inline-flex max-w-full items-start gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-base font-semibold text-card-foreground">
                              {supplier.nombre}
                            </span>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground/75">
                            {supplier.rut}
                          </p>
                        </div>
                      </Link>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                          {supplier.categoria}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-border/60 bg-card/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                          {supplier.sede}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 py-1">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-full px-2.5 py-1 font-medium",
                          estadoStyles[supplier.estado].bg,
                          estadoStyles[supplier.estado].text
                        )}
                      >
                        {supplier.estado}
                      </Badge>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-full border-0 px-2.5 py-1 font-medium",
                            criticidadStyles[supplier.criticidad].bg,
                            criticidadStyles[supplier.criticidad].text
                          )}
                        >
                          Criticidad {supplier.criticidad}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[10rem] py-1">
                      <div className="flex items-center gap-2">
                        <span className={getScoreClassName(supplier.calificacionActual)}>
                        {supplier.calificacionActual.toFixed(1)}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/80">
                          {getTrendIcon(supplier.calificacionActual, supplier.calificacionAnterior)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Base previa {supplier.calificacionAnterior.toFixed(1)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 py-1 text-sm">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                          Última evaluación
                        </p>
                        <p className="mt-1 text-card-foreground">{formatDate(supplier.fechaUltimaEvaluacion)}</p>
                      </div>
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                          Próxima revisión
                        </p>
                        <p className="mt-1 text-muted-foreground">{formatDate(supplier.fechaProximaEvaluacion)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2 py-1">
                      <Button variant="outline" size="sm" className="rounded-full border-primary/15 bg-card/85" asChild>
                        <Link href={`/proveedores/${supplier.id}`}>Abrir ficha</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full border border-border/60 bg-card/80" asChild>
                        <Link href={`/evaluaciones/nueva?proveedor=${supplier.id}`} aria-label={`Crear evaluación para ${supplier.nombre}`}>
                          Evaluar
                          <ClipboardCheck className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full border border-border/60 bg-card/80" asChild>
                        <Link href={`/planes-accion/nuevo?proveedor=${supplier.id}`} aria-label={`Crear plan de acción para ${supplier.nombre}`}>
                          Plan
                          <FileWarning className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </EditorialDataTable>

      <div className="flex items-center justify-between rounded-[1.35rem] border border-border/65 bg-card/70 px-4 py-3 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredSuppliers.length} de {suppliers.length} proveedores
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="min-w-8 rounded-full">1</Button>
          <Button variant="ghost" size="sm" className="min-w-8 rounded-full">2</Button>
          <Button variant="outline" size="sm" className="rounded-full">
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
