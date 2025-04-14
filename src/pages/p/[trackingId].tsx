import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';

interface Props {
  landingPage: {
    template: string;
    settings: any;
    customData: any;
    product: {
      name: string;
      description: string;
      basePrice: number;
      currency: string;
    };
  };
}

export default function LandingPage({ landingPage }: Props) {
  // This is a basic example - you'll want to use the template and settings
  // to render the page according to the template structure
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: landingPage.template }}
      data-settings={JSON.stringify(landingPage.settings)}
      data-custom-data={JSON.stringify(landingPage.customData)}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const trackingId = params?.trackingId as string;
  const affiliateId = query.aff as string | undefined;

  const landingPage = await prisma.landingPage.findUnique({
    where: { 
      trackingId,
      ...(affiliateId ? { affiliateId } : {})
    },
    select: {
      template: true,
      settings: true,
      customData: true,
      product: {
        select: {
          name: true,
          description: true,
          basePrice: true,
          currency: true
        }
      }
    }
  });

  if (!landingPage) {
    return {
      notFound: true
    };
  }

  // Track the visit here
  // You can implement visit tracking, analytics, etc.

  // Convert Decimal to number for JSON serialization
  const serializedPage = {
    ...landingPage,
    product: {
      ...landingPage.product,
      basePrice: Number(landingPage.product.basePrice)
    }
  };

  return {
    props: {
      landingPage: serializedPage
    }
  };
}; 