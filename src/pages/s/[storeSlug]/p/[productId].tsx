import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  commissionRate: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  galleryUrls: string[];
}

interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  settings: {
    currency: string;
    language: string;
    logoSize?: number;
  };
}

interface Props {
  store: Store;
  product: Product;
  affiliateId: string | null;
  hasCustomCommission: boolean;
}

const ProductPage: NextPage<Props> = ({ store, product, affiliateId, hasCustomCommission }) => {
  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';
  
  // Add state for the test affiliate ID
  const [testAffiliateId, setTestAffiliateId] = useState('');
  const [showTestBanner, setShowTestBanner] = useState(true);

  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);

  // Add tracking event logging
  useEffect(() => {
    const logTrackingEvent = async () => {
      try {
        const eventData = {
          event: 'product_view',
          storeId: store.id,
          storeName: store.name,
          productId: product.id,
          productTitle: product.title,
          basePrice: product.basePrice,
          commissionRate: product.commissionRate,
          hasCustomCommission,
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
  }, [store.id, store.name, product.id, product.title, product.basePrice, product.commissionRate, hasCustomCommission, affiliateId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(store.settings?.language || 'en', {
      style: 'currency',
      currency: store.settings?.currency || 'EUR'
    }).format(price);
  };

  const calculateTotalPrice = (basePrice: number, commissionRate: number) => {
    return basePrice + commissionRate;
  };

  const totalPrice = calculateTotalPrice(product.basePrice, product.commissionRate);
  
  // Function to apply test affiliate ID
  const applyTestAffiliateId = () => {
    if (testAffiliateId) {
      window.location.href = `${window.location.pathname}?aff=${testAffiliateId}`;
    }
  };

  useEffect(() => {
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
  }, [affiliateId, router.query.isOwner]);

  return (
    <Layout title={`${product.title} | ${store.name}`}>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('isOwner', isOwner ? 'false' : 'true');
                    window.location.href = url.toString();
                  }}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                >
                  {isOwner ? 'Exit Owner Mode' : 'Enter Owner Mode'}
                </button>
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
        {/* Navigation */}
        <div className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <div className="flex items-center justify-between w-full">
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
                
                {isOwner && (
                  <a
                    href={`/s/${store.slug}/editor${affiliateId ? `?aff=${affiliateId}` : ''}`}
                    className="px-3 py-1 bg-indigo-600 text-sm text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
                  >
                    Edit Store
                  </a>
                )}
              </div>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{product.title}</span>
            </nav>
            
            {/* Navigation Menu */}
            <div className="mt-4 border-t border-b border-gray-200 py-3">
              <nav className="flex justify-center space-x-12">
                <a 
                  href={`/s/${store.slug}${affiliateId ? `?aff=${affiliateId}` : ''}`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
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

        {/* Product Details */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200">
                <img 
                  src={product.imageUrl || product.thumbnailUrl || '/images/placeholder.jpg'} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.galleryUrls && product.galleryUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.galleryUrls.map((url, index) => (
                    <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={url} 
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              {product.shortDescription && (
                <p className="text-xl text-gray-600 mb-6">{product.shortDescription}</p>
              )}

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-col mb-4">
                  <div className="text-gray-600 text-sm">{getTranslation(storeLanguage, 'basePrice')}:</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {formatPrice(product.basePrice)}
                  </div>
                </div>
                <div className="flex flex-col mb-4">
                  <div className="text-gray-600 text-sm">{getTranslation(storeLanguage, 'commission')}:</div>
                  <div className="text-xl font-semibold text-indigo-600 flex items-center">
                    + {formatPrice(product.commissionRate)}
                    {hasCustomCommission && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col mb-4 pt-2 border-t border-gray-200">
                  <div className="text-gray-700 text-sm font-medium">{getTranslation(storeLanguage, 'totalPrice')}:</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </div>
                </div>
                <button 
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow text-lg"
                  onClick={() => {
                    // Handle purchase/add to cart
                    window.parent.postMessage('purchase_clicked', '*');
                  }}
                >
                  {getTranslation(storeLanguage, 'orderNowButton')} →
                </button>
              </div>

              <div className="prose prose-lg max-w-none">
                {product.description}
              </div>
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
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const storeSlug = params?.storeSlug as string;
    const productId = params?.productId as string;
    
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

    console.log(`==== PRODUCT PAGE DEBUG ====`);
    console.log(`URL params: storeSlug=${storeSlug}, productId=${productId}`);
    console.log(`Using affiliateId: '${affiliateId}'`);

    const storeProduct = await prisma.storeProduct.findFirst({
      where: {
        product: { id: productId },
        store: { slug: storeSlug },
        isActive: true
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            settings: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            shortDescription: true,
            basePrice: true,
            commissionRate: true,
            imageUrl: true,
            thumbnailUrl: true,
            galleryUrls: true
          }
        }
      }
    });

    if (!storeProduct) {
      console.log(`Product not found: storeSlug=${storeSlug}, productId=${productId}`);
      return {
        notFound: true
      };
    }

    console.log(`Found product: ${storeProduct.product.title}`);
    console.log(`Default commission rate: ${storeProduct.product.commissionRate}`);
    
    // Get the default commission rate
    const defaultCommissionRate = storeProduct.product.commissionRate;
    
    // Check for custom commission if there's an affiliate ID
    let commissionRate = defaultCommissionRate;
    let hasCustomCommission = false;
    
    if (affiliateId) {
      console.log(`Looking for custom commission for product ${storeProduct.product.id} and affiliate ${affiliateId}`);
      
      // Try to find a custom commission for this affiliate and product
      const customCommission = await prisma.affiliateProductCommission.findFirst({
        where: {
          productId: storeProduct.product.id,
          affiliateId: affiliateId,
          isActive: true
        },
        select: {
          commission: true
        }
      });

      console.log(`Raw database result:`, customCommission);

      // If there's a custom commission, use it
      if (customCommission) {
        commissionRate = customCommission.commission;
        hasCustomCommission = true;
        console.log(`Found custom commission: ${commissionRate} (default was: ${defaultCommissionRate})`);
      } else {
        // Try a direct database query to see all commissions for this product
        const allCommissions = await prisma.affiliateProductCommission.findMany({
          where: {
            productId: storeProduct.product.id,
            isActive: true
          },
          select: {
            affiliateId: true,
            commission: true
          }
        });
        
        console.log(`All commissions for product ${storeProduct.product.id}:`, allCommissions);
        
        console.log(`No matching custom commission found, using default: ${commissionRate}`);
      }
    }

    // Convert Decimal values to numbers for JSON serialization
    const serializedProduct = {
      ...storeProduct.product,
      basePrice: Number(storeProduct.product.basePrice),
      commissionRate: Number(commissionRate)
    };

    console.log(`Final product with commission: ${serializedProduct.commissionRate} (hasCustomCommission: ${hasCustomCommission})`);

    return {
      props: {
        store: storeProduct.store,
        product: serializedProduct,
        affiliateId: affiliateId || null,
        hasCustomCommission: hasCustomCommission
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      notFound: true
    };
  }
};

export default ProductPage; 