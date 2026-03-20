import { NuevoPlanAccionPageClient } from "./nuevo-plan-accion-page-client"

type NuevoPlanAccionPageProps = {
  searchParams: Promise<{ proveedor?: string | string[] | undefined }>
}

export default async function NuevoPlanAccionPage({ searchParams }: NuevoPlanAccionPageProps) {
  const { proveedor } = await searchParams
  const proveedorId = Array.isArray(proveedor) ? proveedor[0] : proveedor

  return <NuevoPlanAccionPageClient proveedorId={proveedorId} />
}
