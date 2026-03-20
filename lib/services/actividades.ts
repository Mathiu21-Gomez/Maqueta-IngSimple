import { getStore, persistStore } from '@/lib/store'
import type { Actividad } from '@/lib/types'

type CreateActividadInput = Omit<Actividad, 'id'>

export async function getActividades(): Promise<Actividad[]> {
  const all = Array.from(getStore().actividades.values())
  return all.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export async function createActividad(data: CreateActividadInput): Promise<Actividad> {
  const store = getStore()
  const actividad: Actividad = { ...data, id: `act-${Date.now()}` }
  store.actividades.set(actividad.id, actividad)
  persistStore()
  return actividad
}
