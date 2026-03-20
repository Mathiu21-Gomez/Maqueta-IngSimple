import { z } from "zod"

// Entity schemas (for validation)
export const proveedorSchema = z.object({
  id: z.string(),
  nombre: z.string().min(2),
  rut: z.string(),
  categoria: z.enum([
    "Seguridad",
    "Aseo",
    "Mantención",
    "Alimentación",
    "Tecnología",
    "Transporte",
  ]),
  sede: z.enum([
    "Campus Norte",
    "Campus Sur",
    "Campus Central",
    "Campus Oriente",
    "Nivel Central",
  ]),
  estado: z.enum([
    "Pendiente",
    "En evaluación",
    "Evaluado",
    "Con plan de acción",
    "Crítico",
  ]),
  criticidad: z.enum(["Alta", "Media", "Baja"]),
  calificacionActual: z.number().min(0).max(5),
  calificacionAnterior: z.number().min(0).max(5),
  contratoVigente: z.boolean(),
  fechaUltimaEvaluacion: z.string(),
  fechaProximaEvaluacion: z.string(),
  contacto: z.string(),
  email: z.string().email(),
  telefono: z.string(),
})

export const evaluacionSchema = z.object({
  id: z.string(),
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  fecha: z.string().min(1, "La fecha es requerida"),
  periodo: z.string().min(1, "El periodo es requerido"),
  sede: z.enum([
    "Campus Norte",
    "Campus Sur",
    "Campus Central",
    "Campus Oriente",
    "Nivel Central",
  ]),
  calificacion: z.number().min(0).max(5),
  evaluador: z.string(),
  estado: z.enum([
    "Pendiente",
    "En evaluación",
    "Evaluado",
    "Con plan de acción",
    "Crítico",
  ]),
  riesgoOperacional: z.enum(["Alta", "Media", "Baja"]),
  riesgoReputacional: z.enum(["Alta", "Media", "Baja"]),
  observaciones: z.string(),
})

export const planAccionSchema = z.object({
  id: z.string(),
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  evaluacionId: z.string(),
  hallazgo: z.string().min(10, "El hallazgo debe tener al menos 10 caracteres"),
  accionCorrectiva: z
    .string()
    .min(10, "La acción debe tener al menos 10 caracteres"),
  responsable: z.string().min(2, "El responsable es requerido"),
  fechaCompromiso: z.string().min(1, "La fecha compromiso es requerida"),
  estado: z.enum([
    "Pendiente",
    "En progreso",
    "Completado",
    "Vencido",
    "Escalado",
  ]),
  evidencia: z.string().optional(),
  fechaCreacion: z.string(),
  fechaActualizacion: z.string(),
})

// Form schemas (used with react-hook-form)
export const evaluacionFormSchema = z.object({
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  periodo: z.string().min(1, "El periodo es requerido"),
  evaluador: z.string(),
  fecha: z.string().min(1, "La fecha es requerida"),
  criterios: z.record(z.string(), z.number().min(0).max(5)),
  riesgosOperacionales: z.record(
    z.string(),
    z.enum(["bajo", "medio", "alto"])
  ),
  riesgosReputacionales: z.record(
    z.string(),
    z.enum(["bajo", "medio", "alto"])
  ),
  observaciones: z.string().optional(),
  hallazgos: z.string().optional(),
})

export const planAccionFormSchema = z.object({
  proveedorId: z.string().min(1, "Seleccione un proveedor"),
  evaluacionId: z.string().optional().default(""),
  hallazgo: z
    .string()
    .min(10, "El hallazgo debe tener al menos 10 caracteres"),
  accionCorrectiva: z
    .string()
    .min(10, "La acción correctiva debe tener al menos 10 caracteres"),
  responsable: z.string().min(2, "El responsable es requerido"),
  fechaCompromiso: z.string().min(1, "La fecha compromiso es requerida"),
})

export const proveedorFormSchema = z.object({
  nombre: z.string().min(2, "El nombre del proveedor es requerido"),
  rut: z.string().min(8, "El RUT debe tener al menos 8 caracteres"),
  categoria: z.enum([
    "Seguridad",
    "Aseo",
    "Mantención",
    "Alimentación",
    "Tecnología",
    "Transporte",
  ]),
  sede: z.enum([
    "Campus Norte",
    "Campus Sur",
    "Campus Central",
    "Campus Oriente",
    "Nivel Central",
  ]),
  contacto: z.string().min(2, "El contacto principal es requerido"),
  email: z.string().email("Ingresá un correo válido"),
  telefono: z.string().min(8, "El teléfono es requerido"),
  criticidad: z.enum(["Alta", "Media", "Baja"]),
  contratoVigente: z.boolean(),
})

export const dashboardFiltersSchema = z.object({
  sede: z.string().optional(),
  periodo: z.string().optional(),
  categoria: z.string().optional(),
  estado: z.string().optional(),
  criticidad: z.string().optional(),
})

// Inferred types from schemas (use these in components)
export type ProveedorSchema = z.infer<typeof proveedorSchema>
export type EvaluacionSchema = z.infer<typeof evaluacionSchema>
export type PlanAccionFormValues = z.infer<typeof planAccionFormSchema>
export type EvaluacionFormValues = z.infer<typeof evaluacionFormSchema>
export type ProveedorFormValues = z.infer<typeof proveedorFormSchema>
export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>
