import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import Button from '@/components/Button';
import { useRouter } from 'next/router';
import { storeStaticCache } from '@/lib/storeStaticCache';

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
  };
  products: StoreProduct[];
}

interface Props {
  store: Store;
  affiliateId: string | null;
}

const StorePage: NextPage<Props> = ({ store, affiliateId }) => {
  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';
  
  // Extract theme colors from store settings or theme
  const primaryColor = store.theme?.primaryColor || store.settings?.primaryColor || '#4f46e5';
  const secondaryColor = store.theme?.secondaryColor || store.settings?.secondaryColor || '#3730a3';
  
  // Add state for the test affiliate ID
  const [testAffiliateId, setTestAffiliateId] = useState('');
  const [showTestBanner, setShowTestBanner] = useState(true);

  // Add this inside the component, before the return statement
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Log affiliate ID information to the client console for debugging
  const router = useRouter();
  useEffect(() => {
    console.log('Home Page loaded with affiliate ID:', affiliateId);
    console.log('Using theme colors:', { primaryColor, secondaryColor });
    
    // Check if current user is owner (in a real app, this would check auth)
    // For demo purposes, we'll use a query param isOwner=true
    setIsOwner(router.query.isOwner === 'true');
    
    // Add affiliate ID to all product links dynamically
    if (affiliateId) {
      document.querySelectorAll('a[href^="/s/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('?aff=')) {
          link.setAttribute('href', `${href}${href.includes('?') ? '&' : '?'}aff=${affiliateId}`);
        }
      });
    }
  }, [affiliateId, primaryColor, secondaryColor, router.query.isOwner]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(store.settings?.language || 'en', {
      style: 'currency',
      currency: store.settings?.currency || 'EUR'
    }).format(price);
  };

  const calculateTotalPrice = (basePrice: number, commissionRate: number) => {
    return basePrice + commissionRate;
  };
  
  // Function to apply test affiliate ID
  const applyTestAffiliateId = () => {
    if (testAffiliateId) {
      window.location.href = `${window.location.pathname}?aff=${testAffiliateId}`;
    }
  };

  return (
    <ThemeProvider theme={{ primaryColor, secondaryColor }}>
      <Layout title={store.name}>
        <div className="min-h-screen bg-gray-50">
          {!affiliateId && showTestBanner && (
            <div className="bg-yellow-100 p-4">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span>Test a specific affiliate ID:</span>
                  <input
                    type="text"
                    value={testAffiliateId}
                    onChange={(e) => setTestAffiliateId(e.target.value)}
                    placeholder="Enter affiliate ID"
                    className="border px-2 py-1 rounded"
                  />
                  <Button
                    onClick={applyTestAffiliateId}
                    size="sm"
                  >
                    Apply
                  </Button>
                  {/* Quick button to use 0b7f3250-8512-41ee-aa44-a389c34b5bc8 */}
                  <Button
                    onClick={() => {
                      window.location.href = `${window.location.pathname}?aff=0b7f3250-8512-41ee-aa44-a389c34b5bc8`;
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Use Available Affiliate ID
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('isOwner', isOwner ? 'false' : 'true');
                      window.location.href = url.toString();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {isOwner ? 'Exit Owner Mode' : 'Enter Owner Mode'}
                  </Button>
                  <button
                    onClick={() => setShowTestBanner(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Store Header */}
          <div className="bg-white shadow">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="w-full flex justify-between items-center mb-4">
                {store.logo ? (
                  <a href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`}>
                    <img 
                      src={store.logo} 
                      alt={store.name} 
                      className="h-26 w-auto object-contain"
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
            {/* Featured Products */}
            {store.products.some(p => p.featured) && (
              <div className="py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {store.products
                    .filter(p => p.featured)
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
                              {formatPrice(calculateTotalPrice(product.basePrice, product.commissionRate))}
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
                    ))}
                </div>
              </div>
            )}

            {/* All Products */}
            <div className="py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.products.map(({ id, product }) => (
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
                          {formatPrice(calculateTotalPrice(product.basePrice, product.commissionRate))}
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
                ))}
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
    
    // Extract affiliate ID from query
    let affiliateId = '';
    if (query.aff) {
      if (typeof query.aff === 'string') {
        affiliateId = query.aff;
      } else if (Array.isArray(query.aff) && query.aff.length > 0) {
        affiliateId = query.aff[0];
      }
    }

    // Check for preview mode - skip cache when previewing
    const isPreview = query.preview === 'true';
    
    // Try to get store from static cache unless in preview mode
    let store = null;
    let cacheHit = false;
    
    if (!isPreview) {
      // First check if we have a slug reference
      const slugReference = storeStaticCache.get(storeSlug, 'slug');
      
      if (slugReference && slugReference._type === 'reference') {
        // We have a reference, fetch the full store data by ID
        const cachedStore = storeStaticCache.get(slugReference.id, 'id');
        if (cachedStore) {
          console.log(`Static cache hit for store: ${storeSlug} (${slugReference.id})`);
          store = cachedStore;
          cacheHit = true;
        }
      }
    }

    // If cache missed or in preview mode, fetch from database
    if (!store) {
      console.log(`Static cache miss for store: ${storeSlug}, fetching from database`);
      
      store = await prisma.store.findUnique({
        where: { slug: storeSlug },
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
        console.log(`Store not found: storeSlug=${storeSlug}`);
        return {
          notFound: true
        };
      }
      
      // Save to static cache for future requests (unless in preview mode)
      if (!isPreview) {
        storeStaticCache.set(store);
        console.log(`Store saved to static cache: ${store.id}`);
      }
    }

    // Get product IDs to check for custom commissions
    const productIds = store.products.map((sp: StoreProduct) => sp.product.id);
    console.log(`Found ${productIds.length} products in store`);
    
    // Fetch custom commissions if an affiliate ID is provided
    let customCommissions: Record<string, number> = {};
    if (affiliateId && productIds.length > 0) {
      console.log(`Looking for custom commissions for ${productIds.length} products and affiliate ${affiliateId}`);
      
      // First, check for all commissions regardless of affiliate
      const allCommissions = await prisma.affiliateProductCommission.findMany({
        where: {
          productId: { in: productIds },
          isActive: true
        },
        select: {
          productId: true,
          affiliateId: true,
          commission: true
        }
      });
      
      console.log(`Found ${allCommissions.length} total commissions for these products (all affiliates):`);
      allCommissions.forEach(comm => {
        console.log(`  Product ${comm.productId}: ${comm.commission} (Affiliate: ${comm.affiliateId})`);
      });
      
      // Now get commissions specific to our affiliate
      const affiliateCommissions = await prisma.affiliateProductCommission.findMany({
        where: {
          affiliateId: affiliateId,
          productId: { in: productIds },
          isActive: true
        },
        select: {
          productId: true,
          commission: true
        }
      });
      
      // Create a map of product ID to custom commission
      customCommissions = affiliateCommissions.reduce((acc: Record<string, number>, item) => {
        acc[item.productId] = Number(item.commission);
        return acc;
      }, {});
      
      console.log(`Found ${affiliateCommissions.length} custom commissions for affiliate ${affiliateId}`);
      if (affiliateCommissions.length > 0) {
        affiliateCommissions.forEach(comm => {
          console.log(`Custom commission for product ${comm.productId}: ${comm.commission}`);
        });
      } else {
        console.log('No custom commissions found for this affiliate');
      }
    }

    // Convert Decimal values to numbers for JSON serialization and apply custom commissions
    const serializedStore = {
      ...store,
      products: store.products.map((sp: StoreProduct) => {
        // Check if there's a custom commission for this product
        const customCommission = customCommissions[sp.product.id];
        const defaultCommission = Number(sp.product.commissionRate);
        const finalCommission = customCommission !== undefined ? customCommission : defaultCommission;
        
        if (customCommission !== undefined) {
          console.log(`Using custom commission for product ${sp.product.id}: ${customCommission} (default: ${defaultCommission})`);
        }
        
        return {
          ...sp,
          product: {
            ...sp.product,
            basePrice: Number(sp.product.basePrice),
            commissionRate: finalCommission,
            hasCustomCommission: customCommission !== undefined
          }
        };
      })
    };

    console.log(`==== END STORE PAGE DEBUG ====`);

    return {
      props: {
        store: serializedStore,
        affiliateId: affiliateId || null
      }
    };
  } catch (error) {
    console.error('Error fetching store:', error);
    return {
      notFound: true
    };
  }
};

export default StorePage;