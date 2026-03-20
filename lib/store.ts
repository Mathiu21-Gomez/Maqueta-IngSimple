import type { Proveedor, Evaluacion, PlanAccion, Actividad } from "./types"
import {
  proveedores as seedProveedores,
  evaluaciones as seedEvaluaciones,
  planesAccion as seedPlanesAccion,
  actividades as seedActividades,
} from "./mock-data"

const STORAGE_KEY = "evalpro-store"

interface StoreState {
  proveedores: Map<string, Proveedor>
  evaluaciones: Map<string, Evaluacion>
  planesAccion: Map<string, PlanAccion>
  actividades: Map<string, Actividad>
}

let _store: StoreState | null = null

function createStore(): StoreState {
  return {
    proveedores: new Map(seedProveedores.map((p) => [p.id, p])),
    evaluaciones: new Map(seedEvaluaciones.map((e) => [e.id, e])),
    planesAccion: new Map(seedPlanesAccion.map((p) => [p.id, p])),
    actividades: new Map(seedActividades.map((a) => [a.id, a])),
  }
}

function loadFromStorage(): StoreState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      proveedores: [string, Proveedor][]
      evaluaciones: [string, Evaluacion][]
      planesAccion: [string, PlanAccion][]
      actividades: [string, Actividad][]
    }
    return {
      proveedores: new Map(parsed.proveedores),
      evaluaciones: new Map(parsed.evaluaciones),
      planesAccion: new Map(parsed.planesAccion),
      actividades: new Map(parsed.actividades),
    }
  } catch {
    return null
  }
}

export function persistStore(): void {
  if (typeof window === "undefined" || !_store) return
  try {
    const serializable = {
      proveedores: Array.from(_store.proveedores.entries()),
      evaluaciones: Array.from(_store.evaluaciones.entries()),
      planesAccion: Array.from(_store.planesAccion.entries()),
      actividades: Array.from(_store.actividades.entries()),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // Ignore storage errors
  }
}

export function getStore(): StoreState {
  if (_store) return _store
  _store = loadFromStorage() ?? createStore()
  return _store
}

export function resetStore(): void {
  _store = createStore()
  persistStore()
}
