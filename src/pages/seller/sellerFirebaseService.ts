import type { User } from 'firebase/auth'
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type FirebaseStorage,
  type StorageReference,
} from 'firebase/storage'
import type { CreateListingInput } from './CreateListing'

const acceptedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maximumPhotoBytes = 5 * 1024 * 1024

/**
 * Upload listing images and persist the seller's PET listing.
 * The caller supplies the actual Firebase Auth user, Firestore and Storage.
 * Security Rules MUST enforce ownership; client-side checks alone are insufficient.
 */
export async function publishSellerListing(
  user: User,
  db: Firestore,
  storage: FirebaseStorage,
  input: CreateListingInput,
): Promise<string> {
  if (!user.uid) throw new Error('Please sign in before publishing.')
  if (input.materialType !== 'PET_BOTTLES') throw new Error('Only PET bottles are supported.')
  if (!input.listingTitle.trim() || !input.quantityDescription.trim()) {
    throw new Error('Listing title and quantity description are required.')
  }
  if (!input.collectionAddress.city.trim() || !input.collectionAddress.province.trim()) {
    throw new Error('City and province are required.')
  }
  if (input.collectionAddress.streetAddress) {
    throw new Error('For privacy, share your street address only after a buyer accepts an offer.')
  }
  if (
    input.estimatedWeightKg !== undefined &&
    (!Number.isFinite(input.estimatedWeightKg) || input.estimatedWeightKg <= 0)
  ) throw new Error('Estimated weight must be greater than zero.')
  if (
    input.collectionMethod !== 'BUYER_COLLECTION' &&
    (input.deliveryFee === undefined || !Number.isFinite(input.deliveryFee) || input.deliveryFee < 0)
  ) throw new Error('Enter a valid delivery fee.')
  if (input.photos.length < 1 || input.photos.length > 5) {
    throw new Error('Choose between one and five photos.')
  }
  for (const file of input.photos) {
    if (!acceptedPhotoTypes.has(file.type) || file.size > maximumPhotoBytes) {
      throw new Error('Photos must be JPEG, PNG or WebP, and no larger than 5 MB.')
    }
  }

  const documentRef = doc(collection(db, 'listings'))
  const uploaded: StorageReference[] = []
  const imageUrls: string[] = []

  try {
    for (const [index, photo] of input.photos.entries()) {
      const extension = photo.type === 'image/png'
        ? 'png'
        : photo.type === 'image/webp'
          ? 'webp'
          : 'jpg'
      const path = `seller-listings/${user.uid}/${documentRef.id}/${index}-${crypto.randomUUID()}.${extension}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, photo, { contentType: photo.type })
      uploaded.push(storageRef)
      imageUrls.push(await getDownloadURL(storageRef))
    }

    // Copy only approved Firestore fields: never include browser File objects
    // or a private street address in the public listing document.
    await setDoc(documentRef, {
      materialType: input.materialType,
      listingTitle: input.listingTitle.trim(),
      description: input.description.trim(),
      quantityDescription: input.quantityDescription.trim(),
      bottleCondition: input.bottleCondition,
      bottleColour: input.bottleColour,
      isSorted: input.isSorted,
      isClean: input.isClean,
      collectionMethod: input.collectionMethod,
      ...(input.estimatedWeightKg === undefined ? {} : { estimatedWeightKg: input.estimatedWeightKg }),
      deliveryFee: input.collectionMethod === 'BUYER_COLLECTION' ? 0 : input.deliveryFee,
      collectionAddress: {
        city: input.collectionAddress.city.trim(),
        province: input.collectionAddress.province.trim(),
        country: input.collectionAddress.country.trim(),
        ...(input.collectionAddress.suburb ? { suburb: input.collectionAddress.suburb.trim() } : {}),
      },
      listingId: documentRef.id,
      sellerId: user.uid,
      imageUrls,
      listingStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return documentRef.id
  } catch (error) {
    // Best-effort cleanup so a failed Firestore write does not leave uploaded images.
    await Promise.allSettled(uploaded.map((file) => deleteObject(file)))
    throw error
  }
}
