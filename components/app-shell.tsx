"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const sidebarButtonMotionClass =
  "shadow-[0_8px_20px_-16px_hsl(var(--sidebar-foreground)/0.42)] transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-[background-color,border-color,color,box-shadow]"

const sidebarButtonHoverClass =
  "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_hsl(var(--sidebar-foreground)/0.52)] active:translate-y-0 active:scale-[0.99]"

const mainNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Proveedores", href: "/proveedores", icon: Users },
  { name: "Evaluaciones", href: "/evaluaciones", icon: ClipboardCheck },
  { name: "Planes de Acción", href: "/planes-accion", icon: FileWarning },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Notificaciones", href: "/notificaciones", icon: Bell, badge: 3 },
]

const settingsNavigation: NavigationItem[] = [
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href || pathname === "/dashboard"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function CompanyBrand({
  compact = false,
  onNavigate,
}: {
  compact?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="Volver al inicio"
      className={cn(
        "flex items-center rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        compact ? "justify-center p-2.5" : "gap-3 px-3 py-3"
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sidebar-border/70 bg-sidebar-panel shadow-sm">
        <Image
          src="/logo%20real.svg"
          alt="ingSimple"
          width={30}
          height={30}
          className="h-7 w-7 object-contain"
          priority
        />
      </div>

      {!compact ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-[0.01em] text-sidebar-foreground">
            ingSimple
          </p>
          <p className="truncate text-xs text-sidebar-foreground/62">
            Gestión integral de proveedores
          </p>
        </div>
      ) : null}
    </Link>
  )
}

function AppUserMenu({ compact = false }: { compact?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center rounded-2xl border border-sidebar-border/75 bg-sidebar-accent/30 text-left hover:border-sidebar-primary/20 hover:bg-sidebar-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            sidebarButtonMotionClass,
            sidebarButtonHoverClass,
            compact ? "justify-center p-2.5" : "gap-3 px-3 py-3"
          )}
          aria-label="Abrir menú de usuario"
        >
          <Avatar className="h-10 w-10 border border-sidebar-border/70">
            <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
              AM
            </AvatarFallback>
          </Avatar>

          {!compact ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-sidebar-foreground">Ana Martínez</p>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="truncate text-xs text-sidebar-foreground/60">
                Administradora del sistema
              </p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracion">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RailNavigation({
  items,
  pathname,
  onNavigate,
}: {
  items: NavigationItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = isRouteActive(pathname, item.href)

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.name}
              className={cn(
                "group h-11 justify-center rounded-2xl border border-transparent p-0 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0!",
                sidebarButtonMotionClass,
                sidebarButtonHoverClass,
                active
                  ? "border-sidebar-primary/30 bg-sidebar-primary/14 text-sidebar-primary shadow-[0_12px_26px_-18px_hsl(var(--sidebar-primary)/0.6)] hover:border-sidebar-primary/35 hover:bg-sidebar-primary/18 hover:shadow-[0_16px_30px_-18px_hsl(var(--sidebar-primary)/0.7)]"
                  : "hover:border-sidebar-border/80 hover:bg-sidebar-accent/70"
              )}
            >
              <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}>
                <item.icon className="h-5 w-5" />
              </Link>
            </SidebarMenuButton>
            {item.badge ? (
              <SidebarMenuBadge className="right-2 top-1.5 min-w-4 rounded-full bg-sidebar-primary px-1 text-[10px] text-sidebar-primary-foreground">
                {item.badge}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function PanelNavigation({
  items,
  pathname,
  onNavigate,
}: {
  items: NavigationItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = isRouteActive(pathname, item.href)

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={active}
              size="lg"
              className={cn(
                "rounded-2xl border px-3 py-3",
                sidebarButtonMotionClass,
                sidebarButtonHoverClass,
                active
                  ? "border-sidebar-primary/35 bg-linear-to-r from-sidebar-primary/18 via-sidebar-primary/10 to-sidebar-accent/80 text-sidebar-foreground shadow-[0_12px_24px_-18px_hsl(var(--sidebar-primary)/0.6)] hover:border-sidebar-primary/40 hover:shadow-[0_16px_30px_-18px_hsl(var(--sidebar-primary)/0.7)]"
                  : "border-transparent text-sidebar-foreground/74 hover:border-sidebar-border/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              )}
            >
              <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}>
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200",
                    active
                      ? "border-sidebar-primary/30 bg-sidebar-primary/18 text-sidebar-primary"
                      : "border-sidebar-border/60 bg-sidebar-panel/70 text-sidebar-foreground/70"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate">{item.name}</span>
                  {item.badge ? (
                    <Badge className="rounded-full bg-sidebar-primary px-2 text-[11px] text-sidebar-primary-foreground">
                      {item.badge}
                    </Badge>
                  ) : null}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function SecondarySidebarPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { isMobile, state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  if (isMobile) {
    return (
      <>
        <SidebarHeader className="border-b border-sidebar-border/70 p-3">
          <CompanyBrand onNavigate={onNavigate} />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="gap-3 p-3">
            <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
              Navegación principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <PanelNavigation items={mainNavigation} pathname={pathname} onNavigate={onNavigate} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup className="gap-3 p-3">
            <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
              Ajustes
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              <PanelNavigation
                items={settingsNavigation}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/70 p-3">
          <AppUserMenu />
        </SidebarFooter>
      </>
    )
  }

  if (collapsed) {
    return (
      <>
        <SidebarHeader className="p-3">
          <div className="space-y-2">
            <CompanyBrand compact />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-full rounded-2xl border border-sidebar-border/60 bg-sidebar-panel/70 text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground",
                sidebarButtonMotionClass,
                sidebarButtonHoverClass
              )}
              onClick={toggleSidebar}
              aria-label="Expandir menú"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-3 py-0">
            <SidebarGroupContent>
              <RailNavigation items={mainNavigation} pathname={pathname} onNavigate={onNavigate} />
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto">
            <SidebarSeparator className="mx-3" />
            <SidebarGroup className="px-3 py-3">
              <SidebarGroupContent>
                <RailNavigation
                  items={settingsNavigation}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/70 p-3">
          <AppUserMenu compact />
        </SidebarFooter>
      </>
    )
  }

  return (
    <>
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <CompanyBrand />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-2xl border border-sidebar-border/60 bg-sidebar-panel/70 text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground",
              sidebarButtonMotionClass,
              sidebarButtonHoverClass
            )}
            onClick={toggleSidebar}
            aria-label="Colapsar menú"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 px-3 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/45">
                Centro operativo
              </p>
              <p className="mt-1 text-sm font-medium text-sidebar-foreground">
                Seguimiento diario del ecosistema de proveedores
              </p>
            </div>
            <Badge className="rounded-full bg-sidebar-primary px-2.5 text-sidebar-primary-foreground">
              3 alertas
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-3 p-4">
          <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
            Navegación principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <PanelNavigation items={mainNavigation} pathname={pathname} onNavigate={onNavigate} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="gap-3 p-4 pt-3">
          <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
            Ajustes
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <PanelNavigation
              items={settingsNavigation}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-4">
        <AppUserMenu />
      </SidebarFooter>
    </>
  )
}

function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar"
    >
      <SecondarySidebarPanel onNavigate={isMobile ? () => setOpenMobile(false) : undefined} />
    </Sidebar>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "22rem",
          "--sidebar-width-icon": "5.75rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <SidebarInset className="min-h-svh overflow-auto bg-background">
        <div className="fixed left-4 top-4 z-40 lg:hidden">
          <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/70 bg-background/90 shadow-sm backdrop-blur-sm" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
