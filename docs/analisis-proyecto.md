# Analisis del proyecto `ticket`

## 1. Vision general

`ticket` es una aplicacion web construida con Next.js orientada a la evaluacion institucional de proveedores. Hoy funciona como un prototipo navegable de alta fidelidad: permite recorrer dashboards, listados, detalle de proveedores, alta de evaluaciones, planes de accion, notificaciones y reportes, pero gran parte del comportamiento esta sostenido por datos mock y estados locales.

El producto expresa con bastante claridad el dominio: seguimiento de proveedores, scoring, criticidad, evaluaciones periodicas, alertas y planes correctivos. En terminos de discovery y demo, el proyecto ya comunica bien el valor del sistema. En terminos de producto operable, todavia no esta listo para un uso real sin una etapa de saneamiento funcional y una evolucion de arquitectura.

## 2. Stack actual

### Base tecnica

- Framework principal: Next.js 16 con App Router (`package.json`, `app/`)
- UI: React 19 (`package.json`)
- Lenguaje: TypeScript 5 (`package.json`, `tsconfig.json`)
- Estilos: Tailwind CSS 4 + utilidades propias (`package.json`, `app/globals.css`)
- Componentes base: fuerte presencia de Radix UI / shadcn-ui (`components/ui/*`, `components.json`)
- Formularios: `react-hook-form`, `zod`, `@hookform/resolvers` instalados pero no aplicados de forma consistente en el flujo principal (`package.json`)
- Graficos: Recharts (`package.json`, `components/dashboard/charts.tsx`, `app/reportes/page.tsx`)
- Feedback: Sonner para toasts (`app/layout.tsx`, `app/evaluaciones/nueva/page.tsx`)
- Analytics: Vercel Analytics (`app/layout.tsx`)

### Configuracion relevante

- El build ignora errores de TypeScript en produccion mediante `typescript.ignoreBuildErrors: true` (`next.config.mjs`)
- Las imagenes estan desoptimizadas con `images.unoptimized: true` (`next.config.mjs`)
- Existe script `lint` con `eslint .`, pero `eslint` no figura instalado en `package.json`

## 3. Arquitectura actual

### 3.1 Estructura general

La aplicacion sigue una organizacion simple y bastante tipica de un prototipo en App Router:

- `app/`: rutas y paginas
- `components/`: shell, componentes de dashboard, tabla de proveedores y libreria UI
- `lib/mock-data.ts`: fuente de verdad del dominio mock
- `hooks/`: utilidades duplicadas parcialmente con `components/ui/`

### 3.2 Patron dominante

La arquitectura actual es mayormente de presentacion:

1. La pagina importa datos desde `lib/mock-data.ts`
2. La pagina compone componentes visuales
3. Los componentes resuelven interaccion con `useState`
4. Las acciones de negocio se simulan con toasts, links o cambios de estado local

No aparece una capa de servicios, repositorios, fetch, server actions, API routes, persistencia ni manejo formal de errores. Esto vuelve al proyecto rapido para iterar demo, pero fragil para escalar a producto.

### 3.3 Piezas estructurales clave

- Shell de aplicacion y navegacion global: `components/app-shell.tsx`
- Dashboard principal: `app/page.tsx`
- Dominio mock centralizado: `lib/mock-data.ts`
- Tabla principal de proveedores: `components/proveedores/suppliers-table.tsx`
- Wizard de evaluacion: `app/evaluaciones/nueva/page.tsx`
- Detalle de proveedor: `app/proveedores/[id]/page.tsx`
- Gestion de planes: `app/planes-accion/page.tsx`
- Centro de notificaciones: `app/notificaciones/page.tsx`
- Reportes y analitica: `app/reportes/page.tsx`

### 3.4 Observaciones arquitectonicas importantes

- El archivo `app/layout.tsx` declara `generator: 'v0.app'`, consistente con un origen de scaffolding/generacion UI.
- El proyecto tiene una base visual fuerte, pero la separacion entre dominio, estado, validacion y presentacion todavia no existe.
- Hay duplicacion literal de hooks en `hooks/use-mobile.ts` y `components/ui/use-mobile.tsx`, y tambien en `hooks/use-toast.ts` y `components/ui/use-toast.ts`.

## 4. Flujo funcional actual

### 4.1 Dashboard

El dashboard (`app/page.tsx`) muestra KPIs, charts, proveedores criticos y alertas usando datos agregados de `lib/mock-data.ts`. La experiencia comunica muy bien el estado general, pero los filtros de `components/dashboard/filters.tsx` no estan conectados a la data real del dashboard.

### 4.2 Gestion de proveedores

La lista de proveedores (`app/proveedores/page.tsx` + `components/proveedores/suppliers-table.tsx`) es el modulo mas cercano a un flujo utilizable: tiene tabs, busqueda local, seleccion de filas y accesos a detalle, nueva evaluacion y plan de accion. Igual asi, varios filtros visibles no afectan el resultado y algunas acciones navegan a rutas inexistentes.

### 4.3 Detalle de proveedor

La pagina `app/proveedores/[id]/page.tsx` concentra bastante contexto de negocio: score actual, evolucion, evaluaciones, hallazgos, planes y bitacora. Es probablemente la mejor referencia del alcance funcional deseado. El problema es que si el `id` no existe, hace fallback al primer proveedor en vez de responder 404, lo que enmascara errores y rompe confianza en el dato.

### 4.4 Evaluaciones

`app/evaluaciones/page.tsx` lista evaluaciones existentes y expone acciones para crear y visualizar. La pagina `app/evaluaciones/nueva/page.tsx` implementa un wizard de 6 pasos con UX convincente, pero el guardado y el envio solo muestran toasts; no persisten nada. Ademas, el resultado final mezcla calculo real de criterios con etiquetas de riesgo parcialmente hardcodeadas (`Medio` y `Bajo`) en vez de derivarlas enteramente del formulario.

### 4.5 Planes de accion

`app/planes-accion/page.tsx` muestra KPIs, tabla y vista kanban. La experiencia es buena para demo, pero el alta se resuelve dentro de un dialog local sin wiring real, el boton de detalle no navega a ninguna ruta concreta y existen referencias hacia `/planes-accion/nuevo` o `/planes-accion/${id}` sin implementacion de pagina.

### 4.6 Notificaciones y reportes

`app/notificaciones/page.tsx` y `app/reportes/page.tsx` completan muy bien la narrativa del producto. Refuerzan el valor institucional del sistema, aunque hoy operan sobre datos estaticos y acciones simuladas.

## 5. Fortalezas del proyecto

### 5.1 Fortalezas de producto

- El problema de negocio esta bien representado: proveedores, evaluaciones, criticidad, alertas y planes correctivos tienen coherencia de dominio.
- La aplicacion ya sirve como prototipo navegable para validar alcance, priorizacion y narrativa comercial.
- El detalle de proveedor y el wizard de evaluacion muestran una comprension bastante madura del flujo operativo.

### 5.2 Fortalezas tecnicas

- `lib/mock-data.ts` centraliza tipos y datos del dominio; para un prototipo esto simplifica iteracion y consistencia.
- El uso de App Router y componentes reutilizables deja una base razonable para evolucionar sin reescribir toda la UI.
- La shell compartida (`components/app-shell.tsx`) ordena bien navegacion, layout y experiencia responsive.
- El sistema visual se siente consistente entre modulos: cards, badges, tablas, tabs, dialogs y charts comparten lenguaje.
- La tabla de proveedores ya implementa una primera capa de estado local util (busqueda, tabs, seleccion), que puede migrarse con relativa facilidad a una arquitectura mas formal.

### 5.3 Fortalezas de UX actual

- Hay buena jerarquia visual y lectura rapida de estado.
- Los dashboards y reportes son claros para stakeholders no tecnicos.
- El flujo principal se entiende sin onboarding adicional.

## 6. Problemas detectados

### 6.1 Problemas funcionales criticos

#### Rutas rotas o inexistentes

- `components/app-shell.tsx` navega a `/configuracion`, pero no existe `app/configuracion/page.tsx`
- `app/proveedores/page.tsx` navega a `/proveedores/nuevo`, pero no existe `app/proveedores/nuevo/page.tsx`
- `app/evaluaciones/page.tsx` navega a `/evaluaciones/${id}`, pero no existe `app/evaluaciones/[id]/page.tsx`
- `app/proveedores/[id]/page.tsx` y `components/proveedores/suppliers-table.tsx` enlazan a `/planes-accion/nuevo?proveedor=...`, pero no existe `app/planes-accion/nuevo/page.tsx`
- `components/dashboard/alerts-panel.tsx` arma links a `/planes-accion/${id}`, pero no existe `app/planes-accion/[id]/page.tsx`

#### Resolucion incorrecta de entidad inexistente

- `app/proveedores/[id]/page.tsx` hace `find(...) || proveedores[0]`, o sea: ante un proveedor invalido muestra otro proveedor real. Eso es un bug de integridad funcional y un riesgo serio de UX.

#### Acciones sin wiring real

- `components/dashboard/filters.tsx` renderiza filtros, pero no actualiza el dashboard ni usa `onFilterChange`
- `app/evaluaciones/page.tsx` muestra filtros y exportacion sin implementacion observable
- `app/planes-accion/page.tsx` muestra busqueda, filtros, exportacion y alta, pero la mayor parte del comportamiento es local/demo
- `app/notificaciones/page.tsx` expone acciones como "Marcar todas como leidas" o configuracion, pero sin evidencia de persistencia o logica real

### 6.2 Problemas de arquitectura y mantenibilidad

- Toda la aplicacion depende de `lib/mock-data.ts` como backend ficticio unico.
- No hay separacion entre dominio, datos, adaptadores y presentacion.
- No hay estrategia de validacion consistente pese a tener `zod` y `react-hook-form` instalados.
- La logica de estado esta dispersa en componentes de pagina; a medida que el producto crezca, esto va a explotar en complejidad accidental.
- Hay codigo duplicado en hooks utilitarios (`hooks/use-mobile.ts`, `components/ui/use-mobile.tsx`, `hooks/use-toast.ts`, `components/ui/use-toast.ts`).

### 6.3 Problemas de calidad tecnica

- `next.config.mjs` permite compilar ignorando errores TypeScript. Para una app de negocio, esto baja fuerte la confiabilidad del build.
- `package.json` declara `lint`, pero falta instalar `eslint`; eso rompe la expectativa minima de calidad automatizada.
- No se observa suite de tests de aplicacion ni cobertura de rutas/fujos criticos.

### 6.4 Problemas de UX y accesibilidad

- Hay icon buttons sin `aria-label` en lugares visibles, por ejemplo en `components/app-shell.tsx`, `app/evaluaciones/page.tsx`, `app/evaluaciones/nueva/page.tsx`, `app/notificaciones/page.tsx`, `app/planes-accion/page.tsx` y `components/proveedores/suppliers-table.tsx`.
- Se depende demasiado del color para expresar estado y severidad en badges, KPIs, tendencias y radios de riesgo (`components/dashboard/kpi-cards.tsx`, `components/dashboard/charts.tsx`, `app/evaluaciones/nueva/page.tsx`, `app/reportes/page.tsx`).
- Los charts en `components/dashboard/charts.tsx` y `app/reportes/page.tsx` no ofrecen resumen textual equivalente ni tablas alternativas para lectura asistiva.
- El proyecto arranca con `defaultTheme="dark"` en `app/layout.tsx`; no es un bug en si, pero conviene validarlo con usuarios institucionales porque puede no alinearse con contextos corporativos o de accesibilidad.

## 7. Mejoras priorizadas

### Prioridad P0 - saneamiento imprescindible

1. Resolver rutas rotas o quitar temporalmente los links hacia rutas no implementadas.
2. Corregir `app/proveedores/[id]/page.tsx` para responder 404 cuando el proveedor no exista.
3. Eliminar `typescript.ignoreBuildErrors` en `next.config.mjs` y reparar los errores que aparezcan.
4. Instalar y configurar `eslint`, o bien remover el script `lint` hasta dejarlo operativo.
5. Etiquetar icon buttons y agregar alternativas no visuales para estados y acciones criticas.

### Prioridad P1 - pasar de demo a MVP interno

1. Definir una capa de datos real para proveedores, evaluaciones y planes.
2. Reemplazar mocks directos por repositorios o servicios con contratos tipados.
3. Formalizar formularios con `react-hook-form` + `zod`.
4. Implementar persistencia real del wizard de evaluacion y del alta de planes.
5. Unificar hooks duplicados y limpiar componentes UI no utilizados o redundantes.

### Prioridad P2 - consolidacion de producto

1. Incorporar tests de rutas criticas, formularios y componentes clave.
2. Agregar estados vacios, errores, loading y feedback real por modulo.
3. Mejorar accesibilidad de charts con tablas/resumenes textuales.
4. Introducir observabilidad funcional: tracking de acciones y errores.

## 8. Propuesta de evolucion arquitectonica

### 8.1 Objetivo

Pasar de una arquitectura centrada en paginas + mocks a una arquitectura por dominio, donde presentacion, logica y datos esten desacoplados.

### 8.2 Direccion sugerida

#### Capa de dominio

Crear modulos por capacidad de negocio, por ejemplo:

- `features/proveedores`
- `features/evaluaciones`
- `features/planes-accion`
- `features/notificaciones`
- `features/reportes`

Cada modulo deberia contener:

- tipos del dominio o contratos de entrada/salida
- mapeadores
- servicios de aplicacion
- componentes de UI del feature
- validaciones de formularios

#### Capa de datos

Introducir adaptadores claros, por ejemplo:

- `repositories/` o `services/`
- modo inicial: adapter mock compatible con el contrato actual
- modo siguiente: API route / backend real / BFF

La idea es que la UI no importe mas `lib/mock-data.ts` de forma directa.

#### Capa de presentacion

- Mantener `app/` como composition layer de rutas
- Mover logica de negocio fuera de las paginas
- Dejar en pagina solo carga, orquestacion de estados de vista y render principal

#### Formularios y validacion

- Estandarizar con `react-hook-form` + `zod`
- Definir schemas por caso de uso
- Reutilizar validaciones entre cliente y servidor cuando exista backend

#### Accesibilidad y design system

- Consolidar una sola ubicacion para hooks compartidos
- Revisar `components/ui/` para separar lo reusable de lo scaffoldeado pero no usado
- Definir checklist minimo de accesibilidad: nombres accesibles, focus visible, alternativa textual de charts, estados no dependientes solo del color

## 9. Roadmap sugerido

### Fase 0 - Estabilizacion inmediata

- Cerrar o implementar rutas faltantes
- Corregir fallback erroneo del detalle de proveedor
- Rehabilitar calidad basica del build (`tsc` y `lint` reales)
- Corregir issues de accesibilidad mas obvios

Resultado esperado: prototipo confiable para demos sin romper navegacion ni esconder errores.

### Fase 1 - MVP funcional interno

- Definir contratos de datos y capa de repositorios
- Persistir evaluaciones y planes de accion
- Conectar filtros principales a datos reales
- Implementar detalle real de evaluacion y plan de accion

Resultado esperado: sistema usable por un equipo piloto, aunque con alcance acotado.

### Fase 2 - Consolidacion operativa

- Formularios robustos con validacion completa
- Manejo de errores, estados vacios y loading por modulo
- Tests de smoke y flujos criticos
- Mejora de accesibilidad en dashboards y reportes

Resultado esperado: plataforma mas mantenible y confiable para crecimiento interno.

### Fase 3 - Escalado de producto

- Integracion con autenticacion/autorizacion real
- Auditoria y trazabilidad persistente
- Reportes exportables con datos reales
- Observabilidad y metricas de uso

Resultado esperado: base lista para evolucion institucional seria, no solo demo.

## 10. Archivos de referencia clave

- `package.json` - dependencias, scripts y stack declarado
- `next.config.mjs` - decisiones de build y optimizacion
- `app/layout.tsx` - metadata global, theme provider y analytics
- `components/app-shell.tsx` - layout principal y navegacion compartida
- `app/page.tsx` - dashboard principal
- `components/dashboard/filters.tsx` - filtros visibles sin wiring efectivo
- `components/dashboard/charts.tsx` - charts del dashboard sin alternativa textual
- `components/dashboard/alerts-panel.tsx` - generacion de links a rutas de planes inexistentes
- `app/proveedores/page.tsx` - listado de proveedores y acceso a ruta nueva inexistente
- `components/proveedores/suppliers-table.tsx` - busqueda local, acciones y links a alta de plan inexistente
- `app/proveedores/[id]/page.tsx` - detalle de proveedor con fallback incorrecto
- `app/evaluaciones/page.tsx` - listado de evaluaciones con link roto a detalle
- `app/evaluaciones/nueva/page.tsx` - wizard con submit/guardado simulados y resultado parcialmente hardcodeado
- `app/planes-accion/page.tsx` - gestion de planes con acciones mayormente demo
- `app/notificaciones/page.tsx` - centro de actividad con acciones simuladas
- `app/reportes/page.tsx` - reportes y analitica basados en datos mock
- `lib/mock-data.ts` - modelo de dominio y fuente centralizada de datos mock
- `hooks/use-mobile.ts` y `components/ui/use-mobile.tsx` - duplicacion de hook
- `hooks/use-toast.ts` y `components/ui/use-toast.ts` - duplicacion de hook

## 11. Conclusion

El proyecto tiene MUY buena capacidad de comunicacion de producto. La UI ya cuenta una historia convincente y el dominio esta bien representado. Ahora bien: una cosa es un prototipo navegable y otra un sistema confiable. Hoy `ticket` esta mucho mas cerca de lo primero.

La prioridad no deberia ser seguir agregando pantallas. La prioridad deberia ser sanear navegacion, asegurar integridad de rutas, recuperar disciplina de build, ordenar la arquitectura y empezar a reemplazar simulacion por contratos reales. Si se hace eso primero, la base visual actual se vuelve una ventaja enorme en vez de una deuda maquillada.
