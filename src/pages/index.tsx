import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

interface LandingPage {
  id: string;
  trackingId: string;
  locale: string;
  isActive: boolean;
  createdAt: Date;
  product: {
    name: string;
    basePrice: number;
    currency: string;
  };
}

interface Props {
  landingPages: LandingPage[];
}

const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const Home: NextPage<Props> = ({ landingPages }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Mercacio Landing Pages
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            All active landing pages generated on mercacio.net
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {landingPages.map((page) => (
                <li key={page.id}>
                  <Link 
                    href={`https://www.mercacio.net/p/${page.trackingId}`}
                    className="block hover:bg-gray-50"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {page.product.name}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">ID: {page.trackingId}</span>
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                          <p className="text-sm text-gray-900 font-medium">
                            {formatPrice(page.product.basePrice, page.product.currency)}
                          </p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {page.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Locale: {page.locale.toUpperCase()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Created: {formatDate(page.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const landingPages = await prisma.landingPage.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      trackingId: true,
      locale: true,
      isActive: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          basePrice: true,
          currency: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    props: {
      landingPages: landingPages.map(page => ({
        ...page,
        createdAt: page.createdAt.toISOString()
      }))
    }
  };
};

export default Home; 