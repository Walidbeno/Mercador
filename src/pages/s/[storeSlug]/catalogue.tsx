import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  settings: {
    currency: string;
    language: string;
    logoSize?: number;
  };
  products: StoreProduct[];
}

interface Props {
  store: Store;
  affiliateId: string | null;
}

const CataloguePage: NextPage<Props> = ({ store, affiliateId }) => {
  const router = useRouter();
  const storeLanguage = store.settings?.language || 'en';
  const [isOwner, setIsOwner] = useState(false);
  
  // Add state for the test affiliate ID
  const [testAffiliateId, setTestAffiliateId] = useState('');
  const [showTestBanner, setShowTestBanner] = useState(true);

  // Log affiliate ID information to the client console for debugging
  useEffect(() => {
    console.log('Catalogue Page loaded with affiliate ID:', affiliateId);
    // Add affiliate ID to all product links dynamically
    if (affiliateId) {
      document.querySelectorAll('a[href^="/s/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('?aff=')) {
          link.setAttribute('href', `${href}${href.includes('?') ? '&' : '?'}aff=${affiliateId}`);
        }
      });
    }
  }, [affiliateId]);

  // Add tracking event logging
  useEffect(() => {
    const logTrackingEvent = async () => {
      try {
        const eventData = {
          eventType: 'catalogue_view',
          storeId: store.id,
          storeName: store.name,
          affiliateId: affiliateId,
          timestamp: new Date().toISOString()
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
  }, [store.id, store.name, store.products.length, affiliateId]);

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
    <Layout title={`${getTranslation(storeLanguage, 'cataloguePageTitle')} | ${store.name}`}>
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
                <button
                  onClick={applyTestAffiliateId}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Apply
                </button>
                {/* Quick button to use 0b7f3250-8512-41ee-aa44-a389c34b5bc8 */}
                <button
                  onClick={() => {
                    window.location.href = `${window.location.pathname}?aff=0b7f3250-8512-41ee-aa44-a389c34b5bc8`;
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Use Available Affiliate ID
                </button>
              </div>
              <button
                onClick={() => setShowTestBanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {/* Store Header */}
        <div className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center">
              <a href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`} className="flex items-center text-gray-600 hover:text-gray-900">
                {store.logo ? (
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    style={{ height: `${store.settings?.logoSize || 150}px` }}
                    className="w-auto object-contain mr-3"
                  />
                ) : (
                  <span className="text-xl font-semibold">{store.name}</span>
                )}
              </a>
            </div>
            
            {/* Navigation Menu */}
            <div className="mt-8 border-t border-b border-gray-200 py-4">
              <nav className="flex justify-center space-x-12">
                <a 
                  href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'home')}
                </a>
                <a 
                  href={`/s/${store.slug}/catalogue${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
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

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{getTranslation(storeLanguage, 'cataloguePageTitle')}</h1>
          
          {/* Product Grid */}
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

        {/* Footer */}
        <div className="bg-white py-8 mt-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            Powered by Mercacio
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const storeSlug = params?.storeSlug as string;
    
    // Add more detailed debugging for the affiliate ID
    console.log('Raw query parameter:', query);
    console.log('Raw aff parameter:', query.aff);
    console.log('Type of aff parameter:', typeof query.aff);
    
    // Make sure we're getting the affiliate ID correctly
    let affiliateId = '';
    if (query.aff) {
      if (typeof query.aff === 'string') {
        affiliateId = query.aff;
      } else if (Array.isArray(query.aff) && query.aff.length > 0) {
        affiliateId = query.aff[0];
      }
    }

    // Check if we need to retrieve a default affiliate ID
    if (!affiliateId) {
      try {
        // Get all available affiliate IDs
        const allAffiliates = await prisma.affiliateProductCommission.findMany({
          select: {
            affiliateId: true
          },
          distinct: ['affiliateId']
        });
        
        if (allAffiliates.length > 0) {
          // Use the first available affiliate ID
          affiliateId = allAffiliates[0].affiliateId;
          console.log(`No affiliateId in URL, using database affiliate: ${affiliateId}`);
        }
      } catch (e) {
        console.error('Error fetching affiliate IDs:', e);
      }
    }
    
    console.log(`Final affiliate ID being used: ${affiliateId}`);

    console.log(`Catalogue page request: storeSlug=${storeSlug}, affiliateId=${affiliateId || 'none'}`);

    const store = await prisma.store.findFirst({
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
      console.log(`Store not found: storeSlug=${storeSlug}`);
      return {
        notFound: true
      };
    }

    // Get product IDs to check for custom commissions
    const productIds = store.products.map(sp => sp.product.id);
    
    // Fetch custom commissions if an affiliate ID is provided
    let customCommissions: Record<string, number> = {};
    if (affiliateId && productIds.length > 0) {
      console.log(`Looking for custom commissions for ${productIds.length} products and affiliate ${affiliateId}`);
      
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
      products: store.products.map(sp => {
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

export default CataloguePage; 