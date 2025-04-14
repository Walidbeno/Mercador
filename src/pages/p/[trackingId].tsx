import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { renderTemplate } from '@/lib/templateRenderer';
import { TemplateType } from '@/templates';

interface Props {
  landingPage: {
    template: TemplateType;
    settings: any;
    customData: any;
    product: {
      title: string;
      description: string;
      shortDescription: string | null;
      basePrice: string;
      commissionRate: string;
      commissionType: string;
      imageUrl: string | null;
      thumbnailUrl: string | null;
      galleryUrls: string[];
    };
  };
}

export default function LandingPage({ landingPage }: Props) {
  const templateHtml = renderTemplate(landingPage.template, {
    ...landingPage.product,
    basePrice: Number(landingPage.product.basePrice),
    commissionRate: Number(landingPage.product.commissionRate)
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: templateHtml }}
      data-settings={JSON.stringify(landingPage.settings)}
      data-custom-data={JSON.stringify(landingPage.customData)}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const trackingId = params?.trackingId as string;
    const preview = query.preview === 'true';

    const landingPage = await prisma.landingPage.findUnique({
      where: { 
        trackingId,
        isActive: true
      },
      select: {
        template: true,
        settings: true,
        customData: true,
        product: {
          select: {
            title: true,
            description: true,
            shortDescription: true,
            basePrice: true,
            commissionRate: true,
            commissionType: true,
            imageUrl: true,
            thumbnailUrl: true,
            galleryUrls: true
          }
        }
      }
    });

    if (!landingPage) {
      return {
        notFound: true
      };
    }

    // Track the visit here (only if not preview)
    if (!preview) {
      // TODO: Implement visit tracking
    }

    // Convert Decimal to string for JSON serialization
    const serializedPage = {
      ...landingPage,
      product: {
        ...landingPage.product,
        basePrice: landingPage.product.basePrice.toString(),
        commissionRate: landingPage.product.commissionRate.toString()
      }
    };

    return {
      props: {
        landingPage: serializedPage
      }
    };
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return {
      notFound: true
    };
  }
}; 