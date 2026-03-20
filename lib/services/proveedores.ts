import { getStore, persistStore } from '@/lib/store'
import type { Proveedor } from '@/lib/types'

type CreateProveedorInput = Omit<Proveedor, 'id'>
type UpdateProveedorInput = Partial<Omit<Proveedor, 'id'>>

export async function getProveedores(): Promise<Proveedor[]> {
  return Array.from(getStore().proveedores.values())
}

export async function getProveedorById(id: string): Promise<Proveedor | null> {
  return getStore().proveedores.get(id) ?? null
}

export async function createProveedor(data: CreateProveedorInput): Promise<Proveedor> {
  const store = getStore()
  const proveedor: Proveedor = { ...data, id: `prov-${Date.now()}` }
  store.proveedores.set(proveedor.id, proveedor)
  persistStore()
  return proveedor
}

export async function updateProveedor(id: string, data: UpdateProveedorInput): Promise<Proveedor> {
  const store = getStore()
  const existing = store.proveedores.get(id)
  if (!existing) throw new Error(`Proveedor ${id} no encontrado`)
  const updated = { ...existing, ...data }
  store.proveedores.set(id, updated)
  persistStore()
  return updated
}

export async function getProveedoresCriticos(): Promise<Proveedor[]> {
  const all = await getProveedores()
  return all.filter(p => p.criticidad === "Alta" || p.calificacionActual < 3.0)
}
