import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Check, Leaf, MapPin, Upload } from 'lucide-react'
import type { Address, BottleColour, BottleCondition, ListingFulfilmentOption, SellerListing } from '../../types'
import './CreateListing.css'

export type CreateListingInput = Pick<
  SellerListing,
  | 'materialType'
  | 'listingTitle'
  | 'description'
  | 'estimatedWeightKg'
  | 'quantityDescription'
  | 'bottleCondition'
  | 'bottleColour'
  | 'isSorted'
  | 'isClean'
  | 'collectionMethod'
  | 'deliveryFee'
  | 'collectionAddress'
> & {
  /** Upload these to Storage in the integration layer before saving imageUrls in Firestore. */
  photos: File[]
}

type CreateListingProps = {
  /** Must persist the new listing; do not report success until this resolves. */
  onCreate?: (listing: CreateListingInput) => Promise<void>
  onCancel?: () => void
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxImageBytes = 5 * 1024 * 1024

export default function CreateListing({ onCreate, onCancel }: CreateListingProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantityDescription, setQuantityDescription] = useState('')
  const [weightKnown, setWeightKnown] = useState(false)
  const [weight, setWeight] = useState('')
  const [condition, setCondition] = useState<BottleCondition>('mixed')
  const [colour, setColour] = useState<BottleColour>('mixed')
  const [isSorted, setIsSorted] = useState(false)
  const [isClean, setIsClean] = useState(false)
  const [collectionMethod, setCollectionMethod] = useState<ListingFulfilmentOption>('BUYER_COLLECTION')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [country, setCountry] = useState('South Africa')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoError, setPhotoError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const sellerDelivers = collectionMethod !== 'BUYER_COLLECTION'
  const qualityItems = [
    { label: 'Material details', done: Boolean(title.trim() && description.trim()) },
    { label: 'Add at least one photo', done: photos.length > 0 },
    { label: 'Collection location', done: Boolean(city.trim() && province.trim() && country.trim()) },
  ]
  const quality = Math.round((qualityItems.filter((item) => item.done).length / qualityItems.length) * 100)

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    setPhotoError('')
    if (selected.length + photos.length > 5) {
      setPhotoError('Choose up to five photos.')
      return
    }
    if (selected.some((file) => !allowedImageTypes.has(file.type) || file.size > maxImageBytes)) {
      setPhotoError('Use JPEG, PNG or WebP photos, up to 5 MB each.')
      return
    }
    setPhotos((previous) => [...previous, ...selected])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccess(false)

    if (!title.trim() || !quantityDescription.trim() || !city.trim() || !province.trim() || !country.trim()) {
      setFormError('Fill in the title, quantity description, city, province and country.')
      return
    }
    if (photos.length === 0) {
      setFormError('Add at least one photo of your PET bottles.')
      return
    }
    const measuredOrEstimated = Number(weight)
    if (weightKnown && (!weight.trim() || !Number.isFinite(measuredOrEstimated) || measuredOrEstimated <= 0)) {
      setFormError('Enter a positive estimated weight, or choose "I do not know".')
      return
    }
    const fee = Number(deliveryFee)
    if (sellerDelivers && (!deliveryFee.trim() || !Number.isFinite(fee) || fee < 0)) {
      setFormError('Enter a valid delivery fee (R0 or more).')
      return
    }
    if (!onCreate) {
      setFormError('This form is ready, but saving is not connected to Firebase yet. Ask your integration developer to provide the onCreate handler.')
      return
    }

    const address: Address = {
      city: city.trim(),
      province: province.trim(),
      country: country.trim(),
      ...(suburb.trim() ? { suburb: suburb.trim() } : {}),
    }
    const listing: CreateListingInput = {
      materialType: 'PET_BOTTLES',
      listingTitle: title.trim(),
      description: description.trim(),
      quantityDescription: quantityDescription.trim(),
      ...(weightKnown ? { estimatedWeightKg: measuredOrEstimated } : {}),
      bottleCondition: condition,
      bottleColour: colour,
      isSorted,
      isClean,
      collectionMethod,
      ...(sellerDelivers ? { deliveryFee: fee } : {}),
      collectionAddress: address,
      photos,
    }

    setSubmitting(true)
    try {
      await onCreate(listing)
      setSuccess(true)
      // Avoid a second submission after a successful save; the parent can navigate away.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save your listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="seller-create">
      <header className="seller-create__header">
        <div>
          <p className="seller-create__eyebrow">WasteLink · Seller workspace</p>
          <h1>List recyclable material</h1>
          <p>Add clear information to help buyers make accurate offers. PET bottles only for this MVP.</p>
        </div>
        {onCancel && <button type="button" className="seller-create__back" onClick={onCancel}>← Back to dashboard</button>}
      </header>

      <div className="seller-create__layout"><form onSubmit={submit} noValidate>
        <section className="seller-create__panel" aria-labelledby="material-heading">
          <div className="seller-create__section-title"><span>1</span><div><h2 id="material-heading">Material details</h2><p>Tell buyers what recyclable PET you have available.</p></div></div>
          <div className="seller-create__fields">
            <div className="seller-create__field">
              <label htmlFor="listing-material">Material type</label>
              <input id="listing-material" value="PET plastic bottles" readOnly />
              <small>Only PET bottles are supported in this hackathon MVP.</small>
            </div>
            <div className="seller-create__field">
              <label htmlFor="listing-title">Listing title <span aria-hidden="true">*</span></label>
              <input id="listing-title" required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Collected PET bottles" />
            </div>
            <div className="seller-create__field seller-create__wide">
              <label htmlFor="listing-description">Description</label>
              <textarea id="listing-description" rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers how your bottles are stored and any important details." />
            </div>
            <div className="seller-create__field">
              <label htmlFor="bottle-colour">Bottle colour</label>
              <select id="bottle-colour" value={colour} onChange={(e) => setColour(e.target.value as BottleColour)}>
                <option value="mixed">Mixed colours</option><option value="clear">Clear</option><option value="green">Green</option>
              </select>
            </div>
            <div className="seller-create__field">
              <label htmlFor="bottle-condition">Bottle condition</label>
              <select id="bottle-condition" value={condition} onChange={(e) => setCondition(e.target.value as BottleCondition)}>
                <option value="mixed">Mixed</option><option value="clean">Clean</option><option value="unclean">Unclean</option>
              </select>
            </div>
            <label className="seller-create__check"><input type="checkbox" checked={isSorted} onChange={(e) => setIsSorted(e.target.checked)} /> Bottles are sorted</label>
            <label className="seller-create__check"><input type="checkbox" checked={isClean} onChange={(e) => setIsClean(e.target.checked)} /> Bottles are clean</label>
          </div>
        </section>

        <section className="seller-create__panel" aria-labelledby="photos-heading">
          <div className="seller-create__section-title"><span>2</span><div><h2 id="photos-heading">Photographs</h2><p>Clear photographs help buyers assess quality.</p></div></div>
          <label className="seller-create__upload" htmlFor="listing-photos">
            <span className="seller-create__camera"><Camera size={24} /></span>
            <strong>Add material photographs</strong>
            <span>Use natural light and show the full quantity where possible.</span>
            <span className="seller-create__upload-button"><Upload size={15}/> Upload from device</span>
            <small>JPEG, PNG or WebP · Up to five images · 5 MB each</small>
          </label>
          <input id="listing-photos" className="seller-create__file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectPhotos} aria-describedby="photo-feedback" />
          <div id="photo-feedback" aria-live="polite">
            {photoError && <p className="seller-create__error">{photoError}</p>}
            {photos.length > 0 && (
              <ul className="seller-create__photos">
                {photos.map((file, index) => (
                  <li key={index}><span>{file.name}</span><button type="button" onClick={() => setPhotos((previous) => previous.filter((_, i) => i !== index))}>Remove</button></li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="seller-create__panel" aria-labelledby="quantity-heading">
          <div className="seller-create__section-title"><span>3</span><div><h2 id="quantity-heading">Quantity & condition</h2><p>An exact weight is helpful, but not required.</p></div></div>
          <div className="seller-create__fields">
            <div className="seller-create__field seller-create__wide">
              <label htmlFor="listing-quantity">How much material do you have? <span aria-hidden="true">*</span></label>
              <input id="listing-quantity" required maxLength={200} value={quantityDescription} onChange={(e) => setQuantityDescription(e.target.value)} placeholder="e.g. Four large bags of bottles" />
              <small>Describe the number of bags, bundles or containers in your own words.</small>
            </div>
            <div className="seller-create__weight-hint"><Leaf size={17}/><div><strong>Don't know the weight?</strong><p>Leave it blank and describe the quantity instead. A buyer may request weighing before confirming the transaction.</p></div></div>
            <fieldset className="seller-create__field seller-create__wide seller-create__weight">
              <legend>Do you know the approximate weight?</legend>
              <label><input type="radio" name="weight-status" checked={!weightKnown} onChange={() => setWeightKnown(false)} /> I don't know the weight</label>
              <label><input type="radio" name="weight-status" checked={weightKnown} onChange={() => setWeightKnown(true)} /> I can estimate the weight</label>
            </fieldset>
            {weightKnown && (
              <div className="seller-create__field seller-create__wide">
                <label htmlFor="listing-weight">Estimated weight (kg) <span aria-hidden="true">*</span></label>
                <input id="listing-weight" type="number" min="0.01" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Your estimate in kg" required />
                <small>This is not a verified weight. Final price depends on accepted, verified kilograms.</small>
              </div>
            )}
          </div>
        </section>

        <section className="seller-create__panel" aria-labelledby="collection-heading">
          <div className="seller-create__section-title"><span>4</span><div><h2 id="collection-heading">Collection details</h2><p>Where and how can the material be collected?</p></div></div>
          <div className="seller-create__fields">
            <div className="seller-create__field seller-create__wide">
              <label htmlFor="listing-method">How can the bottles reach the buyer?</label>
              <select id="listing-method" value={collectionMethod} onChange={(e) => setCollectionMethod(e.target.value as ListingFulfilmentOption)}>
                <option value="BUYER_COLLECTION">Buyer collects from me</option>
                <option value="SELLER_DELIVERY">I deliver to the buyer</option>
                <option value="BOTH">Either option</option>
              </select>
            </div>
            {sellerDelivers && (
              <div className="seller-create__field seller-create__wide">
                <label htmlFor="listing-fee">Your delivery fee (R) <span aria-hidden="true">*</span></label>
                <input id="listing-fee" type="number" min="0" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="Enter 0 if delivery is free" required />
                <small>This is your proposed delivery fee. The buyer must agree to it before the transaction.</small>
              </div>
            )}
            <div className="seller-create__field"><label htmlFor="listing-city">City <span aria-hidden="true">*</span></label><input id="listing-city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mahikeng" /></div>
            <div className="seller-create__field"><label htmlFor="listing-province">Province <span aria-hidden="true">*</span></label><input id="listing-province" required value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g. North West" /></div>
            <div className="seller-create__field"><label htmlFor="listing-suburb">Suburb (optional)</label><input id="listing-suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} /></div>
            <div className="seller-create__field"><label htmlFor="listing-country">Country <span aria-hidden="true">*</span></label><input id="listing-country" required value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            <p className="seller-create__field seller-create__wide seller-create__hint">For your privacy, the exact street address will be agreed privately after a buyer accepts an offer.</p>
          </div>
        </section>

        {formError && <p className="seller-create__error" role="alert">{formError}</p>}
        {success && <p className="seller-create__success" role="status">Your listing was saved successfully.</p>}
        <div className="seller-create__footer">
          <p>Buyers set their own rates per kg. This listing does not promise a final price before weighing.</p>
          <button className="seller-create__submit" type="submit" disabled={submitting || success}>{submitting ? 'Saving listing…' : success ? 'Listing saved' : 'Submit listing →'}</button>
        </div>
      </form>
      <aside className="seller-create__aside" aria-label="Listing assistance">
        <div className="seller-create__panel seller-create__quality">
          <h3>Listing quality</h3>
          <div className="seller-create__quality-meter"><strong>{quality}%</strong><div role="progressbar" aria-label="Listing quality" aria-valuemin={0} aria-valuemax={100} aria-valuenow={quality}><span style={{ width: String(quality) + "%" }} /></div></div>
          <ul>{qualityItems.map((item) => <li key={item.label} className={item.done ? "is-done" : ""}>{item.done ? <Check size={15} /> : <Camera size={15} />} {item.label}</li>)}</ul>
        </div>
        <div className="seller-create__panel seller-create__help">
          <Leaf size={20} />
          <h3>Need help identifying material?</h3>
          <p>Choose the correct PET bottle colour and describe the condition so buyers can assess your listing.</p>
          <div><MapPin size={15}/> Only the general location is public. Agree on the exact pickup address privately.</div>
        </div>
      </aside>
      </div>
    </section>
  )
}
