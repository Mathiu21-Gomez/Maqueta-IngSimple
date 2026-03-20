import { NuevaEvaluacionPageClient } from "./nueva-evaluacion-page-client"

type NuevaEvaluacionPageProps = {
  searchParams: Promise<{ proveedor?: string | string[] | undefined }>
}

export default async function NuevaEvaluacionPage({ searchParams }: NuevaEvaluacionPageProps) {
  const { proveedor } = await searchParams
  const proveedorId = Array.isArray(proveedor) ? proveedor[0] : proveedor

  return <NuevaEvaluacionPageClient proveedorId={proveedorId} />
}
