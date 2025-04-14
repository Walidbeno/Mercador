import { NextPage } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  thumbnailUrl: string;
  basePrice: number;
  commissionRate: number;
  countries: string[];
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const calculateCommission = (price: number, rate: number): number => {
  return price * (rate / 100);
};

const formatCommission = (commission: number, price: number): string => {
  const percentage = ((commission / price) * 100).toFixed(0);
  return `${percentage}%`;
};

const renderCountryFlags = (countries: string[]): string => {
  return countries.join(', ');
};

const MarketplacePage: NextPage = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch products here
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg hover:shadow-lg hover:shadow-gray-300 hover:bg-white transition-all duration-300 overflow-hidden">
              <Link href={`/dashboard/affiliate/marketplace/products/${product.id}`}
                    className="block w-full h-full"
              > 
                <div className="h-48 relative overflow-hidden">
                  <div className="bg-black/75 text-white text-sm rounded-lg px-2 py-1 absolute bottom-2 left-2">
                    {renderCountryFlags(product.countries)}
                  </div>
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

export default MarketplacePage; 