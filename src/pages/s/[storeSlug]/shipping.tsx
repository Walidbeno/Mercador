import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { getTranslation } from '@/lib/translations';

interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  settings: {
    currency: string;
    language: string;
    logoSize?: number;
  };
}

interface Props {
  store: Store;
}

const ShippingPage: NextPage<Props> = ({ store }) => {
  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';

  return (
    <Layout title={`${getTranslation(storeLanguage, 'shippingPageTitle')} | ${store.name}`}>
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
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
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
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTranslation(storeLanguage, 'shippingPageTitle')}</h1>
            
            <div className="prose prose-lg max-w-none">
              <h2>Shipping Information</h2>
              <p>We want to make sure you receive your products as quickly and efficiently as possible. Please review our shipping policy below.</p>
              
              <h3>1. Processing Time</h3>
              <p>All orders are processed within 1-2 business days after receiving your order confirmation. If we are experiencing high volume, this may be extended to 3 business days.</p>
              
              <h3>2. Shipping Methods & Delivery Time</h3>
              <p>We offer the following shipping methods:</p>
              <ul>
                <li>Standard Shipping: 5-7 business days</li>
                <li>Express Shipping: 2-3 business days</li>
                <li>International Shipping: 7-14 business days</li>
              </ul>
              
              <h3>3. Shipping Costs</h3>
              <p>Shipping costs are calculated based on the weight of your order and your location. The exact cost will be calculated during checkout before payment is completed.</p>
              
              <h3>4. Tracking Information</h3>
              <p>Once your order ships, you will receive a tracking number via email that will allow you to track your package.</p>
              
              <h3>5. International Shipping</h3>
              <p>We ship internationally to most countries. Please note that international orders may be subject to import duties and taxes when the shipment reaches the destination country. The customer is responsible for payment of these charges.</p>
              
              <h3>6. Digital Products</h3>
              <p>For digital products, delivery is immediate after payment confirmation. You will receive an email with download instructions or access credentials.</p>
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

    const store = await prisma.store.findFirst({
      where: { 
        slug: storeSlug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        settings: true
      }
    });

    if (!store) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        store
      }
    };
  } catch (error) {
    console.error('Error fetching store:', error);
    return {
      notFound: true
    };
  }
};

export default ShippingPage; 