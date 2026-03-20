import { getStore, persistStore } from '@/lib/store'
import type { Evaluacion } from '@/lib/types'

type CreateEvaluacionInput = Omit<Evaluacion, 'id'>

export async function getEvaluaciones(): Promise<Evaluacion[]> {
  return Array.from(getStore().evaluaciones.values())
}

export async function getEvaluacionById(id: string): Promise<Evaluacion | null> {
  return getStore().evaluaciones.get(id) ?? null
}

export async function getEvaluacionesByProveedor(proveedorId: string): Promise<Evaluacion[]> {
  const all = await getEvaluaciones()
  return all.filter(e => e.proveedorId === proveedorId)
}

export async function createEvaluacion(data: CreateEvaluacionInput): Promise<Evaluacion> {
  const store = getStore()
  const evaluacion: Evaluacion = { ...data, id: `eval-${Date.now()}` }
  store.evaluaciones.set(evaluacion.id, evaluacion)
  persistStore()
  return evaluacion
}

export async function updateEvaluacion(id: string, data: Partial<Evaluacion>): Promise<Evaluacion> {
  const store = getStore()
  const existing = store.evaluaciones.get(id)
  if (!existing) throw new Error(`Evaluacion ${id} no encontrada`)
  const updated = { ...existing, ...data }
  store.evaluaciones.set(id, updated)
  persistStore()
  return updated
}
