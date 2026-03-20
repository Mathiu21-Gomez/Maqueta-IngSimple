// Mock data for Supplier Evaluation Platform

import type {
  Sede,
  Categoria,
  EstadoEvaluacion,
  EstadoPlanAccion,
  NivelCriticidad,
  Proveedor,
  Evaluacion,
  PlanAccion,
  Actividad,
} from "./types"

export type {
  Sede,
  Categoria,
  EstadoEvaluacion,
  EstadoPlanAccion,
  NivelCriticidad,
  Proveedor,
  Evaluacion,
  PlanAccion,
  Actividad,
}

export const proveedores: Proveedor[] = [
  {
    id: "prov-001",
    nombre: "Seguridad Integral SpA",
    rut: "76.543.210-K",
    categoria: "Seguridad",
    sede: "Campus Norte",
    estado: "Crítico",
    criticidad: "Alta",
    calificacionActual: 2.8,
    calificacionAnterior: 3.5,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-02-15",
    fechaProximaEvaluacion: "2026-05-15",
    contacto: "Roberto Méndez",
    email: "rmendez@seguridadintegral.cl",
    telefono: "+56 9 8765 4321"
  },
  {
    id: "prov-002",
    nombre: "CleanPro Servicios Ltda",
    rut: "77.891.234-5",
    categoria: "Aseo",
    sede: "Campus Sur",
    estado: "Evaluado",
    criticidad: "Baja",
    calificacionActual: 4.5,
    calificacionAnterior: 4.3,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-02-28",
    fechaProximaEvaluacion: "2026-05-28",
    contacto: "María González",
    email: "mgonzalez@cleanpro.cl",
    telefono: "+56 9 1234 5678"
  },
  {
    id: "prov-003",
    nombre: "TechSolutions Chile SA",
    rut: "78.456.789-1",
    categoria: "Tecnología",
    sede: "Nivel Central",
    estado: "En evaluación",
    criticidad: "Media",
    calificacionActual: 3.8,
    calificacionAnterior: 4.0,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-01-20",
    fechaProximaEvaluacion: "2026-04-20",
    contacto: "Carlos Fuentes",
    email: "cfuentes@techsolutions.cl",
    telefono: "+56 9 9876 5432"
  },
  {
    id: "prov-004",
    nombre: "Alimentación Premium SpA",
    rut: "79.123.456-7",
    categoria: "Alimentación",
    sede: "Campus Central",
    estado: "Con plan de acción",
    criticidad: "Alta",
    calificacionActual: 3.2,
    calificacionAnterior: 3.8,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-02-10",
    fechaProximaEvaluacion: "2026-05-10",
    contacto: "Patricia Soto",
    email: "psoto@alimentacionpremium.cl",
    telefono: "+56 9 5555 1234"
  },
  {
    id: "prov-005",
    nombre: "Mantención Industrial Ltda",
    rut: "80.234.567-8",
    categoria: "Mantención",
    sede: "Campus Oriente",
    estado: "Evaluado",
    criticidad: "Media",
    calificacionActual: 4.1,
    calificacionAnterior: 3.9,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-03-01",
    fechaProximaEvaluacion: "2026-06-01",
    contacto: "Juan Pérez",
    email: "jperez@mantencionindustrial.cl",
    telefono: "+56 9 4444 5678"
  },
  {
    id: "prov-006",
    nombre: "TransporteRápido SA",
    rut: "81.345.678-9",
    categoria: "Transporte",
    sede: "Campus Norte",
    estado: "Pendiente",
    criticidad: "Baja",
    calificacionActual: 4.3,
    calificacionAnterior: 4.2,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2025-12-15",
    fechaProximaEvaluacion: "2026-03-15",
    contacto: "Luis Araya",
    email: "laraya@transporterapido.cl",
    telefono: "+56 9 3333 9876"
  },
  {
    id: "prov-007",
    nombre: "ServiAseo Total SpA",
    rut: "82.456.789-0",
    categoria: "Aseo",
    sede: "Campus Central",
    estado: "Evaluado",
    criticidad: "Baja",
    calificacionActual: 4.7,
    calificacionAnterior: 4.5,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-03-05",
    fechaProximaEvaluacion: "2026-06-05",
    contacto: "Andrea Muñoz",
    email: "amunoz@serviaseototal.cl",
    telefono: "+56 9 2222 3456"
  },
  {
    id: "prov-008",
    nombre: "Vigilancia Corporativa Ltda",
    rut: "83.567.890-1",
    categoria: "Seguridad",
    sede: "Campus Sur",
    estado: "Con plan de acción",
    criticidad: "Media",
    calificacionActual: 3.5,
    calificacionAnterior: 3.7,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-02-20",
    fechaProximaEvaluacion: "2026-05-20",
    contacto: "Fernando Rojas",
    email: "frojas@vigilanciacorp.cl",
    telefono: "+56 9 1111 7890"
  },
  {
    id: "prov-009",
    nombre: "Catering Gourmet SA",
    rut: "84.678.901-2",
    categoria: "Alimentación",
    sede: "Campus Oriente",
    estado: "Evaluado",
    criticidad: "Baja",
    calificacionActual: 4.4,
    calificacionAnterior: 4.1,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-03-10",
    fechaProximaEvaluacion: "2026-06-10",
    contacto: "Daniela Vargas",
    email: "dvargas@cateringgourmet.cl",
    telefono: "+56 9 8888 2345"
  },
  {
    id: "prov-010",
    nombre: "IT Solutions Pro SpA",
    rut: "85.789.012-3",
    categoria: "Tecnología",
    sede: "Campus Norte",
    estado: "Crítico",
    criticidad: "Alta",
    calificacionActual: 2.5,
    calificacionAnterior: 3.2,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-02-25",
    fechaProximaEvaluacion: "2026-05-25",
    contacto: "Marcos Silva",
    email: "msilva@itsolutionspro.cl",
    telefono: "+56 9 7777 6543"
  },
  {
    id: "prov-011",
    nombre: "Mantención Express Ltda",
    rut: "86.890.123-4",
    categoria: "Mantención",
    sede: "Campus Sur",
    estado: "Pendiente",
    criticidad: "Media",
    calificacionActual: 3.9,
    calificacionAnterior: 4.0,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2025-12-20",
    fechaProximaEvaluacion: "2026-03-20",
    contacto: "Ricardo Torres",
    email: "rtorres@mantencionexpress.cl",
    telefono: "+56 9 6666 4321"
  },
  {
    id: "prov-012",
    nombre: "Buses del Valle SA",
    rut: "87.901.234-5",
    categoria: "Transporte",
    sede: "Campus Central",
    estado: "Evaluado",
    criticidad: "Baja",
    calificacionActual: 4.6,
    calificacionAnterior: 4.4,
    contratoVigente: true,
    fechaUltimaEvaluacion: "2026-03-12",
    fechaProximaEvaluacion: "2026-06-12",
    contacto: "Cristina Herrera",
    email: "cherrera@busesdelvalle.cl",
    telefono: "+56 9 5555 8765"
  }
]

export const evaluaciones: Evaluacion[] = [
  {
    id: "eval-001",
    proveedorId: "prov-001",
    fecha: "2026-02-15",
    periodo: "Q1 2026",
    sede: "Campus Norte",
    calificacion: 2.8,
    evaluador: "Ana Martínez",
    estado: "Evaluado",
    riesgoOperacional: "Alta",
    riesgoReputacional: "Media",
    observaciones: "Se detectaron múltiples incidentes de seguridad no reportados. Personal sin capacitación actualizada."
  },
  {
    id: "eval-002",
    proveedorId: "prov-002",
    fecha: "2026-02-28",
    periodo: "Q1 2026",
    sede: "Campus Sur",
    calificacion: 4.5,
    evaluador: "Carlos Ramírez",
    estado: "Evaluado",
    riesgoOperacional: "Baja",
    riesgoReputacional: "Baja",
    observaciones: "Excelente servicio. Cumplimiento total de protocolos de limpieza."
  },
  {
    id: "eval-003",
    proveedorId: "prov-003",
    fecha: "2026-03-15",
    periodo: "Q1 2026",
    sede: "Nivel Central",
    calificacion: 3.8,
    evaluador: "Mónica Sánchez",
    estado: "En evaluación",
    riesgoOperacional: "Media",
    riesgoReputacional: "Baja",
    observaciones: "Pendiente verificación de licencias de software."
  },
  {
    id: "eval-004",
    proveedorId: "prov-004",
    fecha: "2026-02-10",
    periodo: "Q1 2026",
    sede: "Campus Central",
    calificacion: 3.2,
    evaluador: "Pedro Guzmán",
    estado: "Evaluado",
    riesgoOperacional: "Alta",
    riesgoReputacional: "Alta",
    observaciones: "Incumplimiento en estándares de higiene. Se requiere plan de acción inmediato."
  },
  {
    id: "eval-005",
    proveedorId: "prov-010",
    fecha: "2026-02-25",
    periodo: "Q1 2026",
    sede: "Campus Norte",
    calificacion: 2.5,
    evaluador: "Laura Vega",
    estado: "Evaluado",
    riesgoOperacional: "Alta",
    riesgoReputacional: "Media",
    observaciones: "Tiempos de respuesta excesivos. Falta de personal técnico calificado."
  }
]

export const planesAccion: PlanAccion[] = [
  {
    id: "pa-001",
    proveedorId: "prov-001",
    evaluacionId: "eval-001",
    hallazgo: "Personal sin capacitación actualizada en protocolos de seguridad",
    accionCorrectiva: "Realizar capacitación integral de todo el personal en normativas vigentes",
    responsable: "Roberto Méndez",
    fechaCompromiso: "2026-04-30",
    estado: "En progreso",
    fechaCreacion: "2026-02-16",
    fechaActualizacion: "2026-03-10"
  },
  {
    id: "pa-002",
    proveedorId: "prov-001",
    evaluacionId: "eval-001",
    hallazgo: "Sistema de reportes de incidentes deficiente",
    accionCorrectiva: "Implementar sistema digital de gestión de incidentes con alertas automáticas",
    responsable: "Roberto Méndez",
    fechaCompromiso: "2026-05-15",
    estado: "Pendiente",
    fechaCreacion: "2026-02-16",
    fechaActualizacion: "2026-02-16"
  },
  {
    id: "pa-003",
    proveedorId: "prov-004",
    evaluacionId: "eval-004",
    hallazgo: "Incumplimiento en estándares de higiene alimentaria",
    accionCorrectiva: "Auditoría externa de procesos y certificación de manipuladores de alimentos",
    responsable: "Patricia Soto",
    fechaCompromiso: "2026-03-31",
    estado: "Vencido",
    fechaCreacion: "2026-02-11",
    fechaActualizacion: "2026-03-15"
  },
  {
    id: "pa-004",
    proveedorId: "prov-008",
    evaluacionId: "eval-001",
    hallazgo: "Rotación excesiva de personal",
    accionCorrectiva: "Plan de retención y mejora de condiciones laborales",
    responsable: "Fernando Rojas",
    fechaCompromiso: "2026-06-30",
    estado: "En progreso",
    fechaCreacion: "2026-02-21",
    fechaActualizacion: "2026-03-05"
  },
  {
    id: "pa-005",
    proveedorId: "prov-010",
    evaluacionId: "eval-005",
    hallazgo: "Tiempos de respuesta superiores a lo establecido en SLA",
    accionCorrectiva: "Contratación de personal adicional y mejora en sistema de tickets",
    responsable: "Marcos Silva",
    fechaCompromiso: "2026-04-15",
    estado: "Escalado",
    fechaCreacion: "2026-02-26",
    fechaActualizacion: "2026-03-18"
  }
]

export const actividades: Actividad[] = [
  {
    id: "act-001",
    tipo: "evaluacion",
    titulo: "Evaluación completada",
    descripcion: "Se completó la evaluación trimestral de CleanPro Servicios",
    fecha: "2026-03-19T10:30:00",
    usuario: "Carlos Ramírez",
    entidad: "CleanPro Servicios Ltda"
  },
  {
    id: "act-002",
    tipo: "alerta",
    titulo: "Plan de acción vencido",
    descripcion: "El plan de acción de Alimentación Premium ha superado la fecha compromiso",
    fecha: "2026-03-19T09:15:00",
    entidad: "Alimentación Premium SpA"
  },
  {
    id: "act-003",
    tipo: "plan_accion",
    titulo: "Actualización de plan de acción",
    descripcion: "Se registró avance en el plan de capacitación de Seguridad Integral",
    fecha: "2026-03-18T16:45:00",
    usuario: "Ana Martínez",
    entidad: "Seguridad Integral SpA"
  },
  {
    id: "act-004",
    tipo: "sistema",
    titulo: "Recordatorio de evaluación",
    descripcion: "TransporteRápido SA tiene evaluación programada para hoy",
    fecha: "2026-03-18T08:00:00",
    entidad: "TransporteRápido SA"
  },
  {
    id: "act-005",
    tipo: "evaluacion",
    titulo: "Evaluación iniciada",
    descripcion: "Se inició proceso de evaluación para TechSolutions Chile",
    fecha: "2026-03-17T11:20:00",
    usuario: "Mónica Sánchez",
    entidad: "TechSolutions Chile SA"
  },
  {
    id: "act-006",
    tipo: "alerta",
    titulo: "Proveedor crítico detectado",
    descripcion: "IT Solutions Pro SpA ha sido marcado como proveedor crítico",
    fecha: "2026-03-16T14:30:00",
    entidad: "IT Solutions Pro SpA"
  }
]

// Dashboard KPIs
export const kpis = {
  proveedoresEvaluados: 8,
  evaluacionesPendientes: 4,
  proveedoresBajaCalificacion: 3,
  planesAccionActivos: 5,
  cumplimientoPeriodo: 72
}

// Trend data for charts
export const tendenciaMensual = [
  { mes: "Oct", evaluaciones: 12, calificacionPromedio: 3.8 },
  { mes: "Nov", evaluaciones: 15, calificacionPromedio: 3.9 },
  { mes: "Dic", evaluaciones: 10, calificacionPromedio: 3.7 },
  { mes: "Ene", evaluaciones: 14, calificacionPromedio: 3.6 },
  { mes: "Feb", evaluaciones: 18, calificacionPromedio: 3.8 },
  { mes: "Mar", evaluaciones: 8, calificacionPromedio: 3.9 }
]

export const distribucionRiesgo = [
  { nivel: "Bajo", cantidad: 6, porcentaje: 50 },
  { nivel: "Medio", cantidad: 3, porcentaje: 25 },
  { nivel: "Alto", cantidad: 3, porcentaje: 25 }
]

export const calificacionPorCategoria = [
  { categoria: "Aseo", promedio: 4.6 },
  { categoria: "Transporte", promedio: 4.4 },
  { categoria: "Alimentación", promedio: 3.8 },
  { categoria: "Mantención", promedio: 4.0 },
  { categoria: "Tecnología", promedio: 3.2 },
  { categoria: "Seguridad", promedio: 3.2 }
]

export const calificacionPorSede = [
  { sede: "Campus Norte", promedio: 3.2 },
  { sede: "Campus Sur", promedio: 4.0 },
  { sede: "Campus Central", promedio: 4.2 },
  { sede: "Campus Oriente", promedio: 4.0 },
  { sede: "Nivel Central", promedio: 3.8 }
]

// Helpers
export function getProveedoresCriticos() {
  return proveedores.filter(p => p.criticidad === "Alta" || p.calificacionActual < 3.0)
}

export function getPlanesVencidos() {
  return planesAccion.filter(p => p.estado === "Vencido" || p.estado === "Escalado")
}

export function getEvaluacionesPendientes() {
  return proveedores.filter(p => p.estado === "Pendiente")
}
