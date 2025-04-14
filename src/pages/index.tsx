import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { templates } from '@/templates';
import { Decimal } from '@prisma/client/runtime/library';

interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  sku: string | null;
  basePrice: Decimal;
  vatRate: Decimal | null;
  vatIncluded: boolean;
  commissionRate: Decimal;
  commissionType: string;
  stockQuantity: number;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  vendorName: string | null;
  salesPageUrl: string | null;
  status: string;
  featured: boolean;
  visibility: string;
  categoryId: string | null;
  createdAt: string;
  _count: {
    landingPages: number;
  };
}

interface Props {
  products: Product[];
}

const formatPrice = (price: Decimal): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(price));
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Home: NextPage<Props> = ({ products }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Mercacio Products
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse and preview landing page templates for our products
          </p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.imageUrl || product.thumbnailUrl || '/images/placeholder.jpg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-sm font-medium">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {product.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.basePrice)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Commission: {product.commissionRate.toString()}%
                    {product.commissionType !== 'percentage' && ` (${product.commissionType})`}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Landing Pages:</span>
                    <span className="font-medium">{product._count.landingPages}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      product.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  {product.vendorName && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Vendor:</span>
                      <span className="font-medium">{product.vendorName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Stock:</span>
                    <span className="font-medium">{product.stockQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Added:</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {Object.keys(templates).map((templateName) => (
                    <Link
                      key={templateName}
                      href={`/api/templates/preview?productId=${product.id}&template=${templateName}`}
                      target="_blank"
                      className="text-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                      {templateName.charAt(0).toUpperCase() + templateName.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: {
            landingPages: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return {
      props: {
        products: products.map(product => ({
          ...product,
          createdAt: product.createdAt.toISOString()
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: []
      }
    };
  }
};

export default Home; 