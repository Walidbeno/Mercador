import { GetServerSideProps, NextPage } from 'next';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { useState } from 'react';
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

const ContactPage: NextPage<Props> = ({ store }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get store language from settings or default to English
  const storeLanguage = store.settings?.language || 'en';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would submit this data to your backend
    console.log('Form submitted:', formState);
    setIsSubmitted(true);
  };

  return (
    <Layout title={`${getTranslation(storeLanguage, 'contactPageTitle')} | ${store.name}`}>
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
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{getTranslation(storeLanguage, 'contactPageTitle')}</h1>
            
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-2">{getTranslation(storeLanguage, 'thankYouTitle')}</h3>
                <p>{getTranslation(storeLanguage, 'thankYouMessage')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-xl font-semibold mb-4">{getTranslation(storeLanguage, 'contactFormTitle')}</h2>
                  <p className="text-gray-600 mb-6">
                    {getTranslation(storeLanguage, 'contactFormSubtitle')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>info@{store.slug}.com</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {getTranslation(storeLanguage, 'nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {getTranslation(storeLanguage, 'emailLabel')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        {getTranslation(storeLanguage, 'messageLabel')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formState.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      {getTranslation(storeLanguage, 'sendButton')}
                    </button>
                  </form>
                </div>
              </div>
            )}
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

export default ContactPage; 