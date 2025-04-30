import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';

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
  description: string | null;
  logo: string | null;
  banner: string | null;
  theme: any;
  settings: {
    currency: string;
    language: string;
  };
  products: StoreProduct[];
}

interface Props {
  store: Store;
}

const StorePage: NextPage<Props> = ({ store }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(store.settings?.language || 'en', {
      style: 'currency',
      currency: store.settings?.currency || 'EUR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {store.banner && (
            <div className="h-48 w-full rounded-lg overflow-hidden mb-6">
              <img 
                src={store.banner} 
                alt={store.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            {store.logo && (
              <img 
                src={store.logo} 
                alt={store.name} 
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="mt-2 text-gray-600">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {store.products.some(p => p.featured) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {store.products
              .filter(p => p.featured)
              .map(({ id, product }) => (
                <a 
                  key={id} 
                  href={`/s/${store.id}/p/${product.id}`}
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
                        {formatPrice(product.basePrice)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {store.products.map(({ id, product }) => (
            <a 
              key={id} 
              href={`/s/${store.id}/p/${product.id}`}
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
                    {formatPrice(product.basePrice)}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const storeSlug = params?.storeSlug as string;

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

    // Convert Decimal values to numbers for JSON serialization
    const serializedStore = {
      ...store,
      products: store.products.map(sp => ({
        ...sp,
        product: {
          ...sp.product,
          basePrice: Number(sp.product.basePrice),
          commissionRate: Number(sp.product.commissionRate)
        }
      }))
    };

    return {
      props: {
        store: serializedStore
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