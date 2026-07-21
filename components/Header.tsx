import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <Link href="/">
            <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
              One More Cafe
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded bg-indigo-600 px-2.5 py-1.5 text-sm font-medium text-white dark:bg-indigo-500 hover:bg-indigo-700"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
}