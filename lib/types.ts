// Core domain types for Supplier Evaluation Platform

export type Sede =
  | "Campus Norte"
  | "Campus Sur"
  | "Campus Central"
  | "Campus Oriente"
  | "Nivel Central"

export type Categoria =
  | "Seguridad"
  | "Aseo"
  | "Mantención"
  | "Alimentación"
  | "Tecnología"
  | "Transporte"

export type EstadoEvaluacion =
  | "Pendiente"
  | "En evaluación"
  | "Evaluado"
  | "Con plan de acción"
  | "Crítico"

export type EstadoPlanAccion =
  | "Pendiente"
  | "En progreso"
  | "Completado"
  | "Vencido"
  | "Escalado"

export type NivelCriticidad = "Alta" | "Media" | "Baja"

export interface Proveedor {
  id: string
  nombre: string
  rut: string
  categoria: Categoria
  sede: Sede
  estado: EstadoEvaluacion
  criticidad: NivelCriticidad
  calificacionActual: number
  calificacionAnterior: number
  contratoVigente: boolean
  fechaUltimaEvaluacion: string
  fechaProximaEvaluacion: string
  contacto: string
  email: string
  telefono: string
}

export interface Evaluacion {
  id: string
  proveedorId: string
  fecha: string
  periodo: string
  sede: Sede
  calificacion: number
  evaluador: string
  estado: EstadoEvaluacion
  riesgoOperacional: NivelCriticidad
  riesgoReputacional: NivelCriticidad
  observaciones: string
}

export interface PlanAccion {
  id: string
  proveedorId: string
  evaluacionId: string
  hallazgo: string
  accionCorrectiva: string
  responsable: string
  fechaCompromiso: string
  estado: EstadoPlanAccion
  evidencia?: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface Actividad {
  id: string
  tipo: "evaluacion" | "plan_accion" | "alerta" | "sistema"
  titulo: string
  descripcion: string
  fecha: string
  usuario?: string
  entidad?: string
}

// Input types for create operations
export type CreateProveedorInput = Omit<Proveedor, "id">
export type CreateEvaluacionInput = Omit<Evaluacion, "id">
export type CreatePlanAccionInput = Omit<
  PlanAccion,
  "id" | "fechaCreacion" | "fechaActualizacion"
>
export type CreateActividadInput = Omit<Actividad, "id">
