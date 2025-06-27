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

const AboutPage: NextPage<Props> = ({ store }) => {
  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';

  return (
    <Layout title={`${getTranslation(storeLanguage, 'aboutPageTitle')} | ${store.name}`}>
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
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
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

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTranslation(storeLanguage, 'aboutPageTitle')}</h1>
            
            <div className="prose prose-lg max-w-none">
              <h2>Our Story</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p>
                    Welcome to {store.name}, where quality meets customer satisfaction. We started our journey in 2020 
                    with a simple mission: to provide exceptional products that enhance our customers' lives.
                  </p>
                  <p>
                    What began as a small online store has now grown into a trusted brand with customers 
                    from around the world. We take pride in curating only the best products and delivering 
                    an exceptional shopping experience.
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={store.logo || "https://via.placeholder.com/600x400?text=Our+Team"} 
                    alt="Our Team" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h2>Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Quality</h3>
                  <p>We are committed to offering only the highest quality products that meet our strict standards.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Customer Service</h3>
                  <p>Our customers are at the heart of everything we do. We strive to provide exceptional service and support.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p>We continuously search for innovative products and solutions to better serve our customers' needs.</p>
                </div>
              </div>
              
              <h2>Our Team</h2>
              <p>
                Behind {store.name} is a dedicated team of professionals passionate about bringing the best 
                products to our customers. From product selection to customer support, our team works 
                tirelessly to ensure your satisfaction.
              </p>
              
              <div className="mt-8">
                <h2>Connect With Us</h2>
                <p>
                  We love hearing from our customers! Feel free to reach out to us with any questions, 
                  feedback, or suggestions. Visit our <a href={`/s/${store.slug}/contact`} className="text-indigo-600 hover:text-indigo-800">Contact page</a> to 
                  get in touch with our team.
                </p>
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

export default AboutPage; 