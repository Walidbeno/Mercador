import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';

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
  };
  products: StoreProduct[];
}

interface Props {
  store: Store;
  affiliateId: string | null;
}

const CataloguePage: NextPage<Props> = ({ store, affiliateId }) => {
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

  return (
    <Layout title={`${getTranslation(storeLanguage, 'cataloguePageTitle')} | ${store.name}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Store Header */}
        <div className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center">
              <a href={`/s/${store.slug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                {store.logo ? (
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="h-12 w-auto object-contain mr-3"
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
                  href={`/s/${store.slug}`} 
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  {getTranslation(storeLanguage, 'home')}
                </a>
                <a 
                  href={`/s/${store.slug}/catalogue`} 
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  {getTranslation(storeLanguage, 'catalogue')}
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

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{getTranslation(storeLanguage, 'cataloguePageTitle')}</h1>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {store.products.map(({ id, product }) => (
              <a 
                key={id} 
                href={`/s/${store.slug}/p/${product.id}`}
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
                  </div>
                </div>

                {/* Add Order Now button */}
                <div className="px-4 pb-4 mt-2">
                  <a 
                    href={`/s/${store.slug}/p/${product.id}`}
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
    const affiliateId = query.aff as string || ''; // Get affiliate ID from query if present

    const store = await prisma.store.findUnique({
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
      return {
        notFound: true
      };
    }

    // Get product IDs to check for custom commissions
    const productIds = store.products.map(sp => sp.product.id);
    
    // Fetch custom commissions if an affiliate ID is provided
    let customCommissions: Record<string, number> = {};
    if (affiliateId && productIds.length > 0) {
      const affiliateCommissions = await prisma.affiliateProductCommission.findMany({
        where: {
          affiliateId,
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
    }

    // Convert Decimal values to numbers for JSON serialization and apply custom commissions
    const serializedStore = {
      ...store,
      products: store.products.map(sp => {
        // Check if there's a custom commission for this product
        const customCommission = customCommissions[sp.product.id];
        return {
          ...sp,
          product: {
            ...sp.product,
            basePrice: Number(sp.product.basePrice),
            commissionRate: customCommission !== undefined 
              ? customCommission 
              : Number(sp.product.commissionRate)
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