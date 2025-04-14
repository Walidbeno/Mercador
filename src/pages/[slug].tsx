import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import { LandingPage } from '@prisma/client';

interface Props {
  landingPage: LandingPage & {
    product: {
      name: string;
      description: string;
      basePrice: number;
      currency: string;
      metadata: any;
    };
  };
}

export default function LandingPage({ landingPage }: Props) {
  // This is a basic example - you'll want to create proper template components
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {landingPage.product.name}
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            {landingPage.product.description}
          </p>
          <div className="mt-8">
            <span className="text-3xl font-bold text-gray-900">
              {landingPage.product.basePrice} {landingPage.product.currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
    include: {
      product: {
        select: {
          name: true,
          description: true,
          basePrice: true,
          currency: true,
          metadata: true,
        },
      },
    },
  });

  if (!landingPage) {
    return {
      notFound: true,
    };
  }

  // Convert Decimal to number for JSON serialization
  const serializedPage = {
    ...landingPage,
    product: {
      ...landingPage.product,
      basePrice: Number(landingPage.product.basePrice),
    },
  };

  return {
    props: {
      landingPage: serializedPage,
    },
  };
}; 