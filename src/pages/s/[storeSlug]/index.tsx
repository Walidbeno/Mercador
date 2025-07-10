import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import Button from '@/components/Button';
import { useRouter } from 'next/router';
import { storeCache } from '@/lib/redis';
import Link from 'next/link';

interface StoreProduct {
  id: string;
  product: {
    id: string;
    title: string;
    description: string;
    shortDescription: string | null;
    basePrice: number;
    commissionRate: number;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    hasCustomCommission?: boolean;
  };
  featured: boolean;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  theme: any;
  settings: {
    currency: string;
    language: string;
    primaryColor?: string;
    secondaryColor?: string;
    sections?: Array<{
      id: string;
      type: string;
      title: string;
      content?: string;
      order: number;
      settings?: any;
    }>;
    logoSize?: number;
  };
  products: StoreProduct[];
}

interface Props {
  store: Store;
  affiliateId: string | null;
}

// Helper function to convert string/number to number
const toNumber = (value: string | number): number => {
  if (typeof value === 'string') {
    return parseFloat(value);
  }
  return value;
};

const StorePage: NextPage<Props> = ({ store, affiliateId }) => {
  const router = useRouter();
  const storeLanguage = store.settings?.language || 'en';
  const [isOwner, setIsOwner] = useState(false);

  // Add tracking event logging
  useEffect(() => {
    const logTrackingEvent = async () => {
      try {
        const eventData = {
          event: 'store_view',
          storeId: store.id,
          storeName: store.name,
          affiliateId: affiliateId,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          userAgent: window.navigator.userAgent
        };

        console.log('Sending tracking event:', eventData);

        const response = await fetch('https://www.mercacio.store/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData),
          credentials: 'include',
          mode: 'cors'
        });

        const result = await response.json();
        console.log('Tracking response:', result);
      } catch (error) {
        console.error('Error sending tracking event:', error);
      }
    };

    logTrackingEvent();
  }, [store.id, store.name, affiliateId]);

  // Helper function to calculate total price
  const calculateTotalPrice = (basePrice: number, commissionRate: number) => {
    return basePrice + commissionRate;
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.settings?.currency || 'EUR'
    }).format(price);
  };

  return (
    <ThemeProvider theme={store.theme}>
      <Layout title={store.name}>
        <div className="min-h-screen bg-gray-50">
          {/* Store Header */}
          <div className="bg-white shadow">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="w-full flex justify-between items-center mb-4">
                {store.logo ? (
                  <a href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`}>
                    <img 
                      src={store.logo} 
                      alt={store.name} 
                      style={{ height: `${store.settings?.logoSize || 150}px` }}
                      className="w-auto object-contain"
                    />
                  </a>
                ) : (
                  <a href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`} className="text-gray-900 hover:text-indigo-600">
                    <h1 className="text-4xl font-bold text-gray-900">{store.name}</h1>
                  </a>
                )}
                
                {isOwner && (
                  <a
                    href={`/s/${store.slug}/editor`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                  >
                    Edit Store
                  </a>
                )}
              </div>
              
              {store.banner && (
                <div className="h-48 w-full rounded-lg overflow-hidden mb-8">
                  <img 
                    src={store.banner} 
                    alt={store.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Navigation Menu */}
              <div className="mt-8 border-t border-b border-gray-200 py-4">
                <nav className="flex justify-center space-x-12">
                  <a 
                    href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'home')}
                  </a>
                  <a 
                    href={`/s/${store.slug}/catalogue${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'catalogue')}
                  </a>
                  <a 
                    href={`/s/${store.slug}/about${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'about')}
                  </a>
                  <a 
                    href={`/s/${store.slug}/policy${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'policy')}
                  </a>
                  <a 
                    href={`/s/${store.slug}/shipping${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'shipping')}
                  </a>
                  <a 
                    href={`/s/${store.slug}/contact${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {getTranslation(storeLanguage, 'contact')}
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Render Store Sections */}
            {store.settings?.sections && Array.isArray(store.settings.sections) ? 
              store.settings.sections.sort((a, b) => a.order - b.order).map(section => {
                switch (section.type) {
                  case 'hero':
                    return (
                      <div key={section.id} className="py-16 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                          {section.title || 'Welcome to our Store'}
                        </h1>
                        {section.settings?.subtitle && (
                          <p className="text-xl text-gray-600 mb-8">{section.settings.subtitle}</p>
                        )}
                        <a 
                          href="#featured-products"
                          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          {section.settings?.buttonText || 'Shop Now'}
                        </a>
                      </div>
                    );
                  
                  case 'featuredProducts':
                    return (
                      <div key={section.id} id="featured-products" className="py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {store.products && Array.isArray(store.products) ? store.products
                            .filter(p => p.featured)
                            .slice(0, section.settings?.productCount || 3)
                            .map(({ id, product }) => (
                              <a 
                                key={id} 
                                href={`/s/${store.slug}/p/${product.id}${affiliateId ? `?aff=${affiliateId}` : ''}`}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                              >
                                <div className="h-48 rounded-t-lg overflow-hidden">
                                  <img 
                                    src={product.imageUrl || product.thumbnailUrl || '/images/placeholder.jpg'} 
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-4">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {product.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.shortDescription || product.description}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">
                                      {formatPrice(calculateTotalPrice(toNumber(product.basePrice), toNumber(product.commissionRate)))}
                                    </span>
                                    {product.hasCustomCommission && (
                                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Custom
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Add Order Now button */}
                                <div className="px-4 pb-4 mt-2">
                                  <a 
                                    href={`/s/${store.slug}/p/${product.id}${affiliateId ? `?aff=${affiliateId}` : ''}`}
                                    className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
                                  >
                                    {getTranslation(storeLanguage, 'orderNowButton')} →
                                  </a>
                                </div>
                              </a>
                            )) : null}
                        </div>
                      </div>
                    );
                  
                  case 'about':
                    return (
                      <div key={section.id} className="py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                        <div className="prose prose-lg max-w-none">
                          {section.content}
                        </div>
                      </div>
                    );
                  
                  case 'custom':
                    return (
                      <div key={section.id} className="py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                        <div className="prose prose-lg max-w-none">
                          {section.content}
                        </div>
                      </div>
                    );
                  
                  default:
                    return null;
                }
              }) : null}

            {/* All Products */}
            <div className="py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.products && Array.isArray(store.products) ? store.products.map(({ id, product }) => (
                  <a 
                    key={id} 
                    href={`/s/${store.slug}/p/${product.id}${affiliateId ? `?aff=${affiliateId}` : ''}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="h-48 rounded-t-lg overflow-hidden">
                      <img 
                        src={product.imageUrl || product.thumbnailUrl || '/images/placeholder.jpg'} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(calculateTotalPrice(toNumber(product.basePrice), toNumber(product.commissionRate)))}
                        </span>
                        {product.hasCustomCommission && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add Order Now button */}
                    <div className="px-4 pb-4 mt-2">
                      <a 
                        href={`/s/${store.slug}/p/${product.id}${affiliateId ? `?aff=${affiliateId}` : ''}`}
                        className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
                      >
                        {getTranslation(storeLanguage, 'orderNowButton')} →
                      </a>
                    </div>
                  </a>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No products available in this store.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white py-8 mt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
              Powered by Mercacio
            </div>
          </div>
        </div>
      </Layout>
    </ThemeProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const storeSlug = params?.storeSlug as string;
    const affiliateId = query.aff as string;
    const shouldRefresh = !!query.t;

    console.log('Fetching store data for slug:', storeSlug);
    console.log('Should refresh cache:', shouldRefresh);

    // Get store from cache first, unless refresh is requested
    let store = !shouldRefresh ? await storeCache.get(storeSlug, 'slug') : null;
    
    console.log('Store from cache:', store ? 'Found' : 'Not found');
    
    if (store) {
      console.log('Cached store structure check:');
      console.log('- Has products:', !!store.products, 'Type:', Array.isArray(store.products) ? 'Array' : typeof store.products);
      console.log('- Has settings:', !!store.settings);
      console.log('- Has sections:', !!store.settings?.sections, 'Type:', Array.isArray(store.settings?.sections) ? 'Array' : typeof store.settings?.sections);
      
      // If cached store is missing products or has incomplete structure, refetch from database
      if (!store.products || !Array.isArray(store.products)) {
        console.log('Cached store missing products array, refetching from database');
        store = null;
      }
    }

    // If not in cache or refresh requested, get from database
    if (!store) {
      console.log('Fetching fresh store data from database');
      store = await prisma.store.findFirst({
        where: { 
          slug: storeSlug,
          isActive: true
        },
        include: {
          products: {
            where: { isActive: true },
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  shortDescription: true,
                  basePrice: true,
                  commissionRate: true,
                  imageUrl: true,
                  thumbnailUrl: true
                }
              }
            }
          }
        }
      });

      if (!store) {
        console.log('Store not found in database');
        return { notFound: true };
      }

      console.log('Store sections:', store.settings?.sections);
      
      // Cache the store for future requests
      console.log('Caching new store data');
      await storeCache.set(store);
    }

    return {
      props: {
        store: JSON.parse(JSON.stringify(store)),
        affiliateId: affiliateId || null
      }
    };
  } catch (error) {
    console.error('Error fetching store:', error);
    return { notFound: true };
  }
};

export default StorePage;