import { getStore, persistStore } from '@/lib/store'
import type { PlanAccion } from '@/lib/types'

type CreatePlanAccionInput = Omit<PlanAccion, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado'> & { estado?: PlanAccion['estado'] }

export async function getPlanesAccion(): Promise<PlanAccion[]> {
  return Array.from(getStore().planesAccion.values())
}

export async function getPlanAccionById(id: string): Promise<PlanAccion | null> {
  return getStore().planesAccion.get(id) ?? null
}

export async function getPlanesAccionByProveedor(proveedorId: string): Promise<PlanAccion[]> {
  const all = await getPlanesAccion()
  return all.filter(p => p.proveedorId === proveedorId)
}

export async function createPlanAccion(data: CreatePlanAccionInput): Promise<PlanAccion> {
  const store = getStore()
  const now = new Date().toISOString().split('T')[0]
  const plan: PlanAccion = {
    ...data,
    id: `pa-${Date.now()}`,
    estado: "Pendiente",
    fechaCreacion: now,
    fechaActualizacion: now,
  }
  store.planesAccion.set(plan.id, plan)
  persistStore()
  return plan
}

export async function updatePlanAccion(id: string, data: Partial<PlanAccion>): Promise<PlanAccion> {
  const store = getStore()
  const existing = store.planesAccion.get(id)
  if (!existing) throw new Error(`Plan de acción ${id} no encontrado`)
  const updated = { ...existing, ...data, fechaActualizacion: new Date().toISOString().split('T')[0] }
  store.planesAccion.set(id, updated)
  persistStore()
  return updated
}

export async function getPlanesVencidos(): Promise<PlanAccion[]> {
  const all = await getPlanesAccion()
  return all.filter(p => p.estado === "Vencido" || p.estado === "Escalado")
}
