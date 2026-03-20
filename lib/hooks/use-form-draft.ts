import * as React from "react"
import type { UseFormReturn, FieldValues } from "react-hook-form"

export function useFormDraft<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>
) {
  const storageKey = `evalpro-draft-${key}`

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const draft = JSON.parse(raw) as T
        form.reset(draft)
      }
    } catch {
      // Ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const saveDraft = React.useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(form.getValues()))
    } catch {
      // Ignore
    }
  }, [storageKey, form])

  const clearDraft = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore
    }
  }, [storageKey])

  return { saveDraft, clearDraft }
}
