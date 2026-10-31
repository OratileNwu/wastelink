import type { BuyerRequirement } from '../../types'

/**
 * UI-only form state. Domain field names and enum values are inherited from
 * the canonical BuyerRequirement interface in src/types/index.ts.
 *
 * This module intentionally does NOT write to localStorage or pretend to
 * publish a Firestore record. The integration lead will provide the service.
 */
export type RequirementFormValues = Pick<
  BuyerRequirement,
  | 'requirementTitle'
  | 'description'
  | 'acceptedBottleColours'
  | 'acceptedConditions'
  | 'requiresSortedBottles'
  | 'requiresCleanBottles'
  | 'acceptedCollectionMethods'
  | 'collectionFeePolicy'
> & {
  minimumWeightKg: string
  maximumWeightKg: string
  pricePerKg: string
  collectionAreasInput: string
  validUntilInput: string
}

/** Only fields that are editable on the client. No IDs or ownership fields. */
export type RequirementEditableFields = Pick<
  BuyerRequirement,
  | 'materialType'
  | 'requirementTitle'
  | 'description'
  | 'minimumWeightKg'
  | 'maximumWeightKg'
  | 'pricePerKg'
  | 'acceptedBottleColours'
  | 'acceptedConditions'
  | 'requiresSortedBottles'
  | 'requiresCleanBottles'
  | 'acceptedCollectionMethods'
  | 'collectionAreas'
  | 'collectionFeePolicy'
>

export function emptyRequirementForm(): RequirementFormValues {
  return {
    requirementTitle: '',
    description: '',
    acceptedBottleColours: [],
    acceptedConditions: [],
    requiresSortedBottles: false,
    requiresCleanBottles: false,
    acceptedCollectionMethods: [],
    collectionFeePolicy: 'buyer_pays',
    minimumWeightKg: '',
    maximumWeightKg: '',
    pricePerKg: '',
    collectionAreasInput: '',
    validUntilInput: '',
  }
}

export function validateRequirementForm(values: RequirementFormValues): string | null {
  const min = Number(values.minimumWeightKg)
  const max = values.maximumWeightKg.trim() ? Number(values.maximumWeightKg) : undefined
  const price = Number(values.pricePerKg)

  if (!values.requirementTitle.trim()) return 'Enter a requirement title.'
  if (!values.description.trim()) return 'Describe the PET bottles you want to buy.'
  if (!values.minimumWeightKg.trim() || !Number.isFinite(min) || min <= 0) return 'Minimum weight must be greater than zero.'
  if (max !== undefined && (!Number.isFinite(max) || max < min)) return 'Maximum weight must be at least the minimum.'
  if (!values.pricePerKg.trim() || !Number.isFinite(price) || price <= 0) return 'Enter a valid price per kg.'
  if (!values.acceptedBottleColours.length) return 'Select at least one PET bottle colour.'
  if (!values.acceptedConditions.length) return 'Select at least one bottle condition.'
  if (!values.acceptedCollectionMethods.length) return 'Select at least one fulfilment method.'
  if (!values.collectionAreasInput.split(',').some((value) => value.trim())) return 'Enter a collection area.'
  if (values.validUntilInput && values.validUntilInput < todayLocal()) return 'Expiry date cannot be in the past.'
  return null
}

export function toRequirementEditableFields(values: RequirementFormValues): RequirementEditableFields {
  return {
    materialType: 'PET_BOTTLES',
    requirementTitle: values.requirementTitle.trim(),
    description: values.description.trim(),
    minimumWeightKg: Number(values.minimumWeightKg),
    maximumWeightKg: values.maximumWeightKg.trim() ? Number(values.maximumWeightKg) : undefined,
    pricePerKg: Number(values.pricePerKg),
    acceptedBottleColours: values.acceptedBottleColours,
    acceptedConditions: values.acceptedConditions,
    requiresSortedBottles: values.requiresSortedBottles,
    requiresCleanBottles: values.requiresCleanBottles,
    acceptedCollectionMethods: values.acceptedCollectionMethods,
    collectionAreas: values.collectionAreasInput.split(',').map((area) => area.trim()).filter(Boolean),
    collectionFeePolicy: values.collectionFeePolicy,
  }
}

export function todayLocal(): string {
  const date = new Date()
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}
