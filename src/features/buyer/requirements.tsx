import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Local presentation draft, NOT the backend BuyingRequirement schema.
 * Map these fields to the team's canonical shared TypeScript models once available.
 * No UID, owner ID, seller ID or transaction properties are invented here.
 */
export type BuyerRequirementDraft = {
  id: string
  materialCategory: string
  acceptedSubcategories: string
  minimumQuantity: number
  maximumQuantity: number | null
  buyingPrice: number | null
  pricingMethod: 'fixed' | 'negotiable'
  materialQualityRequirements: string
  collectionAvailability: string
  requirementExpiry: string
  buyerCollectionAddress: string
  acceptUnsortedMaterials: boolean
  supplierDeliveryRequired: boolean
  createdAt: string
}

export type RequirementInput = Omit<BuyerRequirementDraft, 'id' | 'createdAt'>

type RequirementsState = {
  requirements: BuyerRequirementDraft[]
  saveRequirement: (input: RequirementInput, existingId?: string) => void
}

const STORAGE_KEY = 'wastelink:buyer-requirement-drafts:v1'
const RequirementsContext = createContext<RequirementsState | null>(null)

function loadSavedRequirements(): BuyerRequirementDraft[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (!value) return []
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is BuyerRequirementDraft =>
      typeof entry === 'object' && entry !== null &&
      typeof (entry as BuyerRequirementDraft).id === 'string' &&
      typeof (entry as BuyerRequirementDraft).materialCategory === 'string' &&
      typeof (entry as BuyerRequirementDraft).requirementExpiry === 'string')
  } catch {
    return []
  }
}

export function RequirementsProvider({ children }: { children: ReactNode }) {
  const [requirements, setRequirements] = useState<BuyerRequirementDraft[]>(loadSavedRequirements)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements))
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }, [requirements])

  const value = useMemo<RequirementsState>(() => ({
    requirements,
    saveRequirement: (input, existingId) => {
      setRequirements((current) => {
        if (existingId) return current.map((item) => item.id === existingId ? { ...item, ...input } : item)
        return [{
          ...input,
          id: window.crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }, ...current]
      })
    },
  }), [requirements])

  return <RequirementsContext.Provider value={value}>{children}</RequirementsContext.Provider>
}

export function useRequirements() {
  const context = useContext(RequirementsContext)
  if (!context) throw new Error('RequirementsProvider is required')
  return context
}

export function todayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

export function isActiveRequirement(item: BuyerRequirementDraft): boolean {
  return item.requirementExpiry >= todayLocal()
}

export function formatRequirementPrice(item: BuyerRequirementDraft): string {
  if (item.pricingMethod === 'negotiable') return 'Negotiable'
  if (item.buyingPrice === null) return 'Price unavailable'
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(item.buyingPrice) + '/kg'
}
