import Head from 'next/head';
import { useTheme } from '@/lib/theme-context';
import Header from '@/components/Header';

export default function Custom404() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Head>
        <title>Page Not Found - One More Cafe</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-xl mb-6">Page not found</p>
          <p className="mb-8">
            We couldn't find the page you're looking for.
          </p>
          <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700">
            Return to Homepage
          </a>
        </div>
      </main>
    </>
  );
}