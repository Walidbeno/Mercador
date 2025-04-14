import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface Product {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  basePrice: Decimal;
  commissionRate: Decimal;
  status: string;
  visibility: string;
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

const calculateCommission = (price: Decimal, rate: Decimal): number => {
  return Number(price) * (Number(rate) / 100);
};

const formatCommission = (commission: number, price: Decimal): string => {
  const percentage = ((commission / Number(price)) * 100).toFixed(0);
  return `${percentage}%`;
};

const MarketplacePage: NextPage<Props> = ({ products }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg hover:shadow-lg hover:shadow-gray-300 hover:bg-white transition-all duration-300 overflow-hidden">
              <Link href={`/dashboard/affiliate/marketplace/products/${product.id}`}
                    className="block w-full h-full"
              > 
                <div className="h-48 relative overflow-hidden">
                  <div className="bg-black/75 text-white text-sm rounded-lg px-2 py-1 absolute bottom-2 right-2">
                    <span className="font-medium">
                      {formatCommission(calculateCommission(product.basePrice, product.commissionRate), product.basePrice)}
                    </span>
                  </div>
                  <img
                    src={product.thumbnailUrl || '/images/product-placeholder.png'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.title}</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{formatPrice(product.basePrice)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        visibility: 'public'
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        basePrice: true,
        commissionRate: true,
        status: true,
        visibility: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      props: {
        products: JSON.parse(JSON.stringify(products)) // Serialize Decimal objects
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

export default MarketplacePage; 