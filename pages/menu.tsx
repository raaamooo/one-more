import Head from 'next/head';
import { useTheme } from '@/lib/theme-context';
import Header from '@/components/Header';

export default function Menu() {
  const { theme, toggleTheme } = useTheme();

  const menuData = {
    categories: [
      { id: 1, name: 'Signature & Specials', sort_order: 1 },
      { id: 2, name: 'Bakery & Dessert', sort_order: 2 },
      { id: 3, name: 'Hot Drinks', sort_order: 3 },
      { id: 4, name: 'Ice Drinks', sort_order: 4 },
      { id: 5, name: 'Hot Matcha', sort_order: 5 },
      { id: 6, name: 'Ice Matcha', sort_order: 6 },
      { id: 7, name: 'Mojitos', sort_order: 7 },
      { id: 8, name: 'Smoothies & Shakers', sort_order: 8 },
      { id: 9, name: 'Drinks & Refreshments', sort_order: 9 },
      { id: 10, name: 'Add-ons', sort_order: 10 }
    ],
    items: [
      // Signature & Specials
      { id: 1, category_id: 1, name: 'Special Blend Latte', description: 'Our house special espresso, steamed oat milk, vanilla syrup', price: 6.50, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },
      { id: 2, category_id: 1, name: 'Caramel Macchiato', description: 'espresso, vanilla steamed milk, caramel drizzle', price: 6.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },

      // Bakery & Dessert
      { id: 3, category_id: 2, name: 'Chocolate Croissant', description: 'flaky pastry with dark chocolate filling', price: 4.25, image_url: 'https://images.unsplash.com/photo-1555507036-6d54a732300e?w=300', is_available: true },
      { id: 4, category_id: 2, name: 'Blueberry Muffin', description: 'moist muffin bursting with fresh blueberries', price: 3.75, image_url: 'https://images.unsplash.com/photo-1590945213270-91f2cf0cafc4?w=300', is_available: true },

      // Hot Drinks
      { id: 5, category_id: 3, name: 'Cappuccino', description: 'equal parts espresso, steamed milk, milk foam', price: 4.50, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },
      { id: 6, category_id: 3, name: 'Americano', description: 'espresso topped with hot water', price: 3.50, image_url: 'https://images.unsplash.com/photo-1518837695805-3e942cc0a45d?w=300', is_available: true },
      { id: 7, category_id: 3, name: 'Chai Latte', description: 'spiced black tea with steamed milk', price: 5.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },

      // Ice Drinks
      { id: 8, category_id: 4, name: 'Iced Latte', description: 'espresso over ice with cold milk', price: 5.00, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },
      { id: 9, category_id: 4, name: 'Cold Brew', description: 'slow-steeped coffee served over ice', price: 4.50, image_url: 'https://images.unsplash.com/photo-1518837695805-3e942cc0a45d?w=300', is_available: true },
      { id: 10, category_id: 4, name: 'Iced Mocha', description: 'chocolate espresso over ice with milk', price: 5.50, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },

      // Hot Matcha
      { id: 11, category_id: 5, name: 'Traditional Matcha', description: 'stone-ground japanese green tea', price: 5.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },
      { id: 12, category_id: 5, name: 'Matcha Latte', description: 'matcha with steamed milk & honey', price: 5.50, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },

      // Ice Matcha
      { id: 13, category_id: 6, name: 'Iced Matcha Latte', description: 'matcha over ice with cold milk', price: 5.50, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },
      { id: 14, category_id: 6, name: 'Matcha Frappé', description: 'blended matcha with ice & milk', price: 6.00, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },

      // Mojitos
      { id: 15, category_id: 7, name: 'Classic Mojito', description: 'rum, mint, lime, sugar, soda water', price: 7.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },
      { id: 16, category_id: 7, name: 'Berry Mojito', description: 'mixed berries, mint, lime, soda water', price: 7.50, image_url: 'https://images.unsplash.com/photo-1572442388909-31f6584c6671?w=300', is_available: true },

      // Smoothies & Shakers
      { id: 17, category_id: 8, name: 'Green Power', description: 'spinach, banana, pineapple, coconut water', price: 6.50, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },
      { id: 18, category_id: 8, name: 'Tropical Bliss', description: 'mango, passionfruit, orange, coconut milk', price: 6.50, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },

      // Drinks & Refreshments
      { id: 19, category_id: 9, name: 'Fresh Orange Juice', description: 'cold-pressed valencia oranges', price: 4.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },
      { id: 20, category_id: 9, name: 'Iced Tea', description: 'brewed black tea served cold', price: 3.00, image_url: 'https://images.unsplash.com/photo-1572442388909-31f6584c6671?w=300', is_available: true },

      // Add-ons
      { id: 21, category_id: 10, name: 'Extra Shot', description: 'additional espresso shot', price: 1.00, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true },
      { id: 22, category_id: 10, name: 'Oat Milk', description: 'substitute for dairy milk', price: 0.75, image_url: 'https://images.unsplash.com/photo-1572442388909-4d931a5f00c8?w=300', is_available: true },
      { id: 23, category_id: 10, name: 'Vanilla Syrup', description: 'sugar-free vanilla flavoring', price: 0.50, image_url: 'https://images.unsplash.com/photo-1578990441778-31f6584c6671?w=300', is_available: true }
    ]
  };

  // Group items by category
  const groupedItems = menuData.categories.map(category => ({
    ...category,
    items: menuData.items.filter(item => item.category_id === category.id && item.is_available)
  }));

  return (
    <>
      <Head>
        <title>Menu - One More Cafe</title>
        <meta name="description" content="View our full menu at One More Cafe" />
      </Head>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">Our Menu</h1>
          <div className="space-x-4 overflow-x-auto">
            {menuData.categories.map(category => {
              const categoryItems = groupedItems.find(c => c.id === category.id);
              return (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all
                    ${categoryItems && categoryItems.items.length > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  disabled={!categoryItems || categoryItems.items.length === 0}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-12">
            {groupedItems.map(category => (
              <section key={category.id}>
                {category.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No items available in this category
                  </p>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold accent-theme mb-6">{category.name}</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            {!item.is_available && (
                              <span className="px-2 py-1 text-xs bg-accent-theme/20 text-accent-theme rounded">
                                Unavailable
                              </span>
                            )}
                            <p className="mt-2 font-semibold text-indigo-600">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}