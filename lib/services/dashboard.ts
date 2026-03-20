import { getProveedores, getProveedoresCriticos } from './proveedores'
import { getEvaluaciones } from './evaluaciones'
import { getPlanesAccion, getPlanesVencidos } from './planes-accion'

export async function getDashboardKPIs() {
  const [proveedores, evaluaciones, planes, planesVencidos, criticos] = await Promise.all([
    getProveedores(),
    getEvaluaciones(),
    getPlanesAccion(),
    getPlanesVencidos(),
    getProveedoresCriticos(),
  ])

  const evaluados = proveedores.filter(p =>
    p.estado === "Evaluado" || p.estado === "Con plan de acción" || p.estado === "Crítico"
  ).length

  const pendientes = proveedores.filter(p => p.estado === "Pendiente").length

  const bajaCalificacion = proveedores.filter(p => p.calificacionActual < 3.0).length

  const planesActivos = planes.filter(p =>
    p.estado === "Pendiente" || p.estado === "En progreso"
  ).length

  const planesCompletados = planes.filter(p => p.estado === "Completado").length
  const cumplimiento = planes.length > 0
    ? Math.round((planesCompletados / planes.length) * 100)
    : 0

  return {
    proveedoresEvaluados: evaluados,
    evaluacionesPendientes: pendientes,
    proveedoresBajaCalificacion: bajaCalificacion,
    planesAccionActivos: planesActivos,
    cumplimientoPeriodo: cumplimiento,
    totalProveedores: proveedores.length,
    proveedoresCriticos: criticos.length,
  }
}

export async function getCalificacionPorCategoria() {
  const proveedores = await getProveedores()
  const byCategoria = new Map<string, number[]>()

  for (const p of proveedores) {
    if (!byCategoria.has(p.categoria)) byCategoria.set(p.categoria, [])
    byCategoria.get(p.categoria)!.push(p.calificacionActual)
  }

  return Array.from(byCategoria.entries()).map(([categoria, scores]) => ({
    categoria,
    promedio: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
  }))
}

export async function getCalificacionPorSede() {
  const proveedores = await getProveedores()
  const bySede = new Map<string, number[]>()

  for (const p of proveedores) {
    if (!bySede.has(p.sede)) bySede.set(p.sede, [])
    bySede.get(p.sede)!.push(p.calificacionActual)
  }

  return Array.from(bySede.entries()).map(([sede, scores]) => ({
    sede,
    promedio: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
  }))
}

export async function getDistribucionRiesgo() {
  const proveedores = await getProveedores()
  const total = proveedores.length
  const counts = {
    baja: proveedores.filter(p => p.criticidad === "Baja").length,
    media: proveedores.filter(p => p.criticidad === "Media").length,
    alta: proveedores.filter(p => p.criticidad === "Alta").length,
  }

  return [
    { nivel: "Bajo", cantidad: counts.baja, porcentaje: Math.round((counts.baja / total) * 100) },
    { nivel: "Medio", cantidad: counts.media, porcentaje: Math.round((counts.media / total) * 100) },
    { nivel: "Alto", cantidad: counts.alta, porcentaje: Math.round((counts.alta / total) * 100) },
  ]
}
