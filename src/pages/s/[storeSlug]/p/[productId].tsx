import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';

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
}

const ProductPage: NextPage<Props> = ({ store, product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(store.settings?.language || 'en', {
      style: 'currency',
      currency: store.settings?.currency || 'EUR'
    }).format(price);
  };

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
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(product.basePrice)}
                </div>
                <button 
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow text-lg"
                  onClick={() => {
                    // Handle purchase/add to cart
                    window.parent.postMessage('purchase_clicked', '*');
                  }}
                >
                  Buy Now →
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const storeSlug = params?.storeSlug as string;
    const productId = params?.productId as string;

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
      return {
        notFound: true
      };
    }

    // Convert Decimal values to numbers for JSON serialization
    const serializedProduct = {
      ...storeProduct.product,
      basePrice: Number(storeProduct.product.basePrice),
      commissionRate: Number(storeProduct.product.commissionRate)
    };

    return {
      props: {
        store: storeProduct.store,
        product: serializedProduct
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