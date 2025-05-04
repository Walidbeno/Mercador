import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';

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

  return (
    <Layout title={`${product.title} | ${store.name}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <a href={`/s/${store.slug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                {store.logo ? (
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span>{store.name}</span>
                )}
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{product.title}</span>
            </nav>
            
            {/* Navigation Menu */}
            <div className="mt-4 border-t border-b border-gray-200 py-3">
              <nav className="flex justify-center space-x-12">
                <a 
                  href={`/s/${store.slug}`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'home')}
                </a>
                <a 
                  href={`/s/${store.slug}/catalogue`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'catalogue')}
                </a>
                <a 
                  href={`/s/${store.slug}/about`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'about')}
                </a>
                <a 
                  href={`/s/${store.slug}/policy`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'policy')}
                </a>
                <a 
                  href={`/s/${store.slug}/shipping`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'shipping')}
                </a>
                <a 
                  href={`/s/${store.slug}/contact`} 
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
    const affiliateId = query.aff as string || ''; // Get affiliate ID from query if available

    console.log(`Product page request: storeSlug=${storeSlug}, productId=${productId}, affiliateId=${affiliateId || 'none'}`);

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

      // If there's a custom commission, use it
      if (customCommission) {
        commissionRate = customCommission.commission;
        hasCustomCommission = true;
        console.log(`Found custom commission: ${commissionRate} (default was: ${defaultCommissionRate})`);
      } else {
        console.log(`No custom commission found, using default: ${commissionRate}`);
      }
    }

    // Convert Decimal values to numbers for JSON serialization
    const serializedProduct = {
      ...storeProduct.product,
      basePrice: Number(storeProduct.product.basePrice),
      commissionRate: Number(commissionRate)
    };

    console.log(`Returning product with commission: ${serializedProduct.commissionRate} (hasCustomCommission: ${hasCustomCommission})`);

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