import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';
import Header from '@/components/Header';
import { Style } from '@/styles/globals.css';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">One More Cafe</h1>
            <p className="text-xl mb-8">
              Your neighborhood spot for exceptional coffee and homemade treats
            </p>
            <Link href="/menu" legacyBehavior>
              <a className="bg-white text-indigo-600 px-6 py-3 rounded-full font-medium hover:bg-indigo-50">
                View Our Menu
              </a>
            </Link>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">
              About Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="mb-4">
                  Founded in 2023, One More Cafe is more than just a coffee shop — it's a community hub where friends gather, ideas are born, and every cup tells a story.
                </p>
                <p>
                  We source our beans from sustainable farms and roast them in-house to ensure the perfect flavor profile in every sip.
                </p>
              </div>
              <div className="flex justify-center">
                <img src="https://images.unsplash.com/photo-1517236518083-2b8af9e1a1bf?w=400" alt="Cafe interior" className="rounded-lg shadow-md" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Items</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Menu items will be populated from data */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517236518083-2b8af9e1a1bf?w=400" alt="Latte" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Special Blend Latte</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Our house special espresso with steamed oat milk and vanilla syrup
                  </p>
                  <p className="font-semibold text-indigo-600">$6.50</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                <img src="https://images.unsplash.com/photo-1555507036-6d54a732300e?w=400" alt="Croissant" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Chocolate Croissant</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Flaky pastry with rich dark chocolate filling
                  </p>
                  <p className="font-semibold text-indigo-600">$4.25</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                <img src="https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=400" alt="Matcha" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Matcha Latte</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Stone-ground Japanese green tea with steamed milk and honey
                  </p>
                  <p className="font-semibold text-indigo-600">$5.50</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Visit Us</h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-8">
              123 Coffee Street, Brewville • Open 6am-8pm daily
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="tel:+1234567890" className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700">
                Call Us: (555) 123-4567
              </a>
              <a href="mailto:info@onemorecafe.com" className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700">
                Email: info@onemorecafe.com
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}