import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

type Item = {
  id: string
  title: string
  finalPrice: number
  calories?: number
  proteinGrams?: number
  discountPct?: number
}

function PriceTag({ price, discount }: { price: number; discount?: number }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xl font-bold">${price.toFixed(2)}</span>
      {typeof discount === 'number' && discount > 0 && (
        <span className="px-2 py-0.5 text-sm rounded-full bg-green-100 text-green-700">-{discount}%</span>
      )}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
      <div className="h-5 w-2/3 bg-gray-200 rounded" />
      <div className="mt-3 h-4 w-1/2 bg-gray-200 rounded" />
      <div className="mt-2 h-4 w-1/3 bg-gray-200 rounded" />
      <div className="mt-4 h-6 w-24 bg-gray-200 rounded" />
    </div>
  )
}

function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, setIsDark };
}

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isDark, setIsDark } = useDarkMode()

  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`${API}/recommend/top?limit=8`)
        setItems(res.data.items || [])
      } catch (e) {
        setError('Unable to load recommendations right now')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <span className="text-xl sm:text-2xl font-bold">Diet AI</span>
            <a href="#top" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Top Picks</a>
            <a href="#products" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Products</a>
            <a href="#about" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">About</a>
          </nav>
          <button
            aria-label="Toggle dark mode"
            onClick={() => setIsDark(!isDark)}
            className="text-xs sm:text-sm px-3 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <section id="top" className="mb-6 sm:mb-10">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-8 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold">Top Diet Deals</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We rank items by nutrition and price. Lower calories, higher protein, better price.
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {!loading && items.map(p => (
            <article
              key={p.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-lg leading-snug">{p.title}</h3>
                {typeof p.discountPct === 'number' && p.discountPct > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                    Save {p.discountPct}%
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300">
                <div>Calories: <span className="text-gray-800">{p.calories ?? '—'}</span></div>
                <div>Protein: <span className="text-gray-800">{p.proteinGrams ?? '—'} g</span></div>
                <div className="col-span-3 sm:col-span-1">Price</div>
              </div>
              <PriceTag price={p.finalPrice} discount={p.discountPct} />
            </article>
          ))}
        </div>

        <section id="products" className="mt-12">
          <h3 className="text-lg font-semibold mb-3">All Products</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This is the current catalog backing recommendations.</p>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total items: {items.length}</div>
        </section>

        <section id="about" className="mt-12">
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This demo ranks products using nutrition and pricing. When the AI service is available, it classifies items as diet-friendly to improve results.
          </p>
        </section>
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Built with FastAPI, Express, Prisma and Vercel/Render/HF Spaces
      </footer>
    </div>
  )
}