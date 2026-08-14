export function Refunds() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-4 text-2xl font-semibold text-white">Refunds &amp; Cancellations</h1>
      <div className="space-y-4 text-sm text-gray-400">
        <p>
          Orders can be cancelled before they're shipped by contacting us — see the{' '}
          <a href="/contact" className="text-accent-soft underline">
            Contact
          </a>{' '}
          page.
        </p>
        <p>
          If you receive a defective or incorrect item, contact us within 7 days of delivery for a
          replacement or refund.
        </p>
        <p>Approved refunds are credited to your original payment method within 5–7 business days.</p>
      </div>
    </div>
  )
}
