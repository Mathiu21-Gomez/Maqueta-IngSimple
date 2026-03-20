import type { ReactNode } from "react"
import { ArrowRight, ArrowUpRight, Check, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Tone = "default" | "success" | "warning" | "danger" | "info"

const toneClassNames: Record<Tone, { shell: string; icon: string; dot: string }> = {
  default: {
    shell: "border-primary/12 bg-primary/8 text-primary",
    icon: "text-primary",
    dot: "bg-primary",
  },
  success: {
    shell: "border-success/18 bg-status-success-soft text-success",
    icon: "text-success",
    dot: "bg-success",
  },
  warning: {
    shell: "border-warning/18 bg-status-warning-soft text-warning",
    icon: "text-warning",
    dot: "bg-warning",
  },
  danger: {
    shell: "border-destructive/18 bg-status-destructive-soft text-destructive",
    icon: "text-destructive",
    dot: "bg-destructive",
  },
  info: {
    shell: "border-info/18 bg-status-info-soft text-info",
    icon: "text-info",
    dot: "bg-info",
  },
}

export function EditorialPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  meta?: Array<{ label: string; value: string | number; tone?: Tone }>
  actions?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,var(--color-card)_52%,color-mix(in_oklab,var(--color-secondary)_48%,white)_100%)] p-6 shadow-[0_24px_60px_-38px_color-mix(in_oklab,var(--foreground)_22%,transparent)] lg:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
      <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-36 w-36 rounded-full bg-accent/12 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground/82">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <h1 className="font-display text-[2rem] leading-none tracking-[-0.05em] text-card-foreground lg:text-[2.7rem]">
              {title}
            </h1>
            <p className="max-w-[62ch] text-sm leading-6 text-muted-foreground lg:text-[0.95rem]">
              {description}
            </p>
          </div>

          {meta && meta.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {meta.map((item) => {
                const tone = toneClassNames[item.tone ?? "default"]

                return (
                  <Badge
                    key={`${item.label}-${item.value}`}
                    variant="outline"
                    className={cn(
                      "gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-medium tracking-[0.01em]",
                      tone.shell,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-current">{item.value}</span>
                  </Badge>
                )
              })}
            </div>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  )
}

export function EditorialMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string
  value: string | number
  detail?: string
  icon?: LucideIcon
  tone?: Tone
  className?: string
}) {
  const toneStyles = toneClassNames[tone]

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.55rem] border border-border/65 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_90%,white)_0%,color-mix(in_oklab,var(--color-secondary)_30%,white)_100%)] shadow-[0_18px_45px_-38px_color-mix(in_oklab,var(--foreground)_28%,transparent)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/28 to-transparent" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/82">
              {label}
            </p>
            <p className="font-display text-[2rem] leading-none tracking-[-0.05em] text-card-foreground">
              {value}
            </p>
            {detail ? <p className="text-sm leading-5 text-muted-foreground">{detail}</p> : null}
          </div>

          {Icon ? (
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm", toneStyles.shell)}>
              <Icon className={cn("h-5 w-5", toneStyles.icon)} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function EditorialPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-secondary)_24%,white)_100%)] shadow-[0_24px_60px_-42px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/28 to-transparent" />
      <CardHeader className="relative gap-3 border-b border-white/45 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-1">
            <CardTitle className="font-display text-[1.55rem] leading-none tracking-[-0.04em] text-card-foreground">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="max-w-[44ch] text-sm leading-6 text-muted-foreground">
                {description}
              </CardDescription>
            ) : null}
          </div>
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("relative px-6 py-5", contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export type EditorialStepItem = {
  id: number
  name: string
  description: string
}

export function EditorialStepper({
  eyebrow,
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  steps: EditorialStepItem[]
  currentStep: number
  onStepChange: (stepId: number) => void
  className?: string
}) {
  const completedSteps = steps.filter((step) => step.id < currentStep).length
  const pendingSteps = steps.length - currentStep
  const progress = (currentStep / steps.length) * 100
  const currentStepConfig = steps.find((step) => step.id === currentStep) ?? steps[0]

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-secondary)_24%,white)_100%)] shadow-[0_24px_60px_-42px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/28 to-transparent" />
      <CardHeader className="relative gap-4 border-b border-white/45 px-6 py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-[44rem] space-y-2">
            {eyebrow ? (
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                {eyebrow}
              </p>
            ) : null}
            <div className="space-y-1">
              <CardTitle className="font-display text-[1.55rem] leading-none tracking-[-0.04em] text-card-foreground">
                {title}
              </CardTitle>
              {description ? (
                <CardDescription className="max-w-[56ch] text-sm leading-6 text-muted-foreground">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/14 bg-card/88 px-3 py-2 shadow-[0_14px_30px_-24px_color-mix(in_oklab,var(--foreground)_26%,transparent)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {currentStep}
            </div>
            <div className="space-y-0.5 pr-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/72">
                Paso activo
              </p>
              <p className="text-sm font-semibold text-card-foreground">{currentStepConfig?.name}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative px-6 py-5">
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)]">
            <div className="rounded-[1.4rem] border border-primary/14 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,white)_0%,color-mix(in_oklab,var(--color-card)_88%,white)_100%)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/75">
                    Ahora
                  </p>
                  <p className="text-lg font-semibold text-card-foreground">{currentStepConfig?.name}</p>
                  <p className="max-w-[54ch] text-sm leading-6 text-muted-foreground">{currentStepConfig?.description}</p>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/16 bg-primary/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                  En curso
                </Badge>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-border/70 bg-card/82 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/75">
                    Avance
                  </p>
                  <p className="mt-1 font-display text-[2rem] leading-none tracking-[-0.05em] text-card-foreground">
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="text-right text-xs leading-5 text-muted-foreground">
                  <p>{completedSteps} completados</p>
                  <p>{pendingSteps} pendientes</p>
                </div>
              </div>
              <Progress value={progress} className="mt-4 h-2.5 bg-primary/10" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step) => {
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  className={cn(
                    "group rounded-[1.35rem] border px-4 py-4 text-left transition-all duration-200",
                    isCurrent && "border-primary/24 bg-primary/7 shadow-[0_18px_34px_-26px_color-mix(in_oklab,var(--primary)_42%,transparent)]",
                    isCompleted && "border-success/20 bg-status-success-soft/72",
                    !isCurrent && !isCompleted && "border-border/70 bg-card/78 hover:border-primary/16 hover:bg-primary/[0.04]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                        isCompleted && "border-success/20 bg-success text-success-foreground",
                        isCurrent && "border-primary/20 bg-primary text-primary-foreground",
                        !isCurrent && !isCompleted && "border-border/70 bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-card-foreground">{step.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em]",
                            isCompleted && "border-success/20 bg-success/10 text-success",
                            isCurrent && "border-primary/18 bg-primary/8 text-primary",
                            !isCurrent && !isCompleted && "border-border/70 bg-card/72 text-muted-foreground",
                          )}
                        >
                          {isCompleted ? "Listo" : isCurrent ? "Actual" : "Pendiente"}
                        </Badge>
                      </div>

                      <p className="text-sm leading-5 text-muted-foreground">{step.description}</p>

                      <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/72 transition-colors group-hover:text-card-foreground/70">
                        <span>Ir al paso</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EditorialInset({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode
  className?: string
  tone?: Tone
}) {
  const toneStyles = toneClassNames[tone]

  return (
    <div
      className={cn(
        "rounded-[1.35rem] border bg-card/72 p-4 shadow-[0_18px_40px_-36px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
        toneStyles.shell,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function EditorialToolbar({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,white)_0%,color-mix(in_oklab,var(--color-secondary)_22%,white)_100%)] p-4 shadow-[0_18px_40px_-34px_color-mix(in_oklab,var(--foreground)_20%,transparent)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          {eyebrow ? (
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/78">
              {eyebrow}
            </p>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-card-foreground">{title}</p>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </div>
  )
}

export function EditorialDataTable({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_94%,white)_0%,color-mix(in_oklab,var(--color-secondary)_18%,white)_100%)] shadow-[0_22px_48px_-40px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function EditorialEmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "default",
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  tone?: Tone
  className?: string
}) {
  const toneStyles = toneClassNames[tone]

  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-border/75 px-6 py-12 text-center", className)}>
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full border", toneStyles.shell)}>
        <Icon className={cn("h-7 w-7", toneStyles.icon)} />
      </div>
      <p className="mt-5 font-display text-2xl tracking-[-0.04em] text-card-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{action}</div> : null}
    </div>
  )
}

export function EditorialTextAction({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </span>
  )
}
