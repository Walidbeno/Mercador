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
  };
}

interface Props {
  store: Store;
}

const PolicyPage: NextPage<Props> = ({ store }) => {
  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';

  return (
    <Layout title={`${getTranslation(storeLanguage, 'policyPageTitle')} | ${store.name}`}>
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
                  href={`/s/${store.slug}/policy`} 
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  {getTranslation(storeLanguage, 'policy')}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTranslation(storeLanguage, 'policyPageTitle')}</h1>
            
            <div className="prose prose-lg max-w-none">
              <h2>{getTranslation(storeLanguage, 'termsTitle')}</h2>
              <p>Bienvenido a nuestra tienda. A continuación, se detallan los términos y condiciones que rigen la compra de productos en nuestra plataforma.</p>
              
              <h3>1. Proceso de Compra</h3>
              <p>Al realizar una compra en nuestra tienda, usted acepta todos los términos y condiciones establecidos en esta política. El proceso de compra es simple y seguro, utilizando métodos de pago confiables.</p>
              
              <h3>2. Precios y Pagos</h3>
              <p>Todos los precios mostrados en nuestra tienda incluyen los impuestos aplicables. Aceptamos varios métodos de pago que se muestran durante el proceso de checkout.</p>
              
              <h3>3. Envío y Entrega</h3>
              <p>Para productos digitales, la entrega se realiza inmediatamente después de la confirmación del pago. Para productos físicos, los tiempos de entrega pueden variar según su ubicación.</p>
              
              <h3>4. Política de Devoluciones</h3>
              <p>Si no está satisfecho con su compra, puede solicitar un reembolso dentro de los 30 días posteriores a la compra. Para productos digitales, evaluaremos cada caso individualmente.</p>
              
              <h3>5. Privacidad</h3>
              <p>Protegemos su información personal y nunca la compartiremos con terceros sin su consentimiento explícito. Para más información, consulte nuestra Política de Privacidad.</p>
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

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
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

export default PolicyPage; 