import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-8xl text-wood-200 font-bold mb-4">404</div>
        <h1 className="font-display text-3xl text-charcoal-800 mb-3">Page not found</h1>
        <p className="text-stone-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/products" className="btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}
