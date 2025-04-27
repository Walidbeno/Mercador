import { GetServerSideProps } from 'next';
import Head from 'next/head';
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
      commissionRate: string; // Fixed commission amount in euros
      imageUrl: string | null;
      thumbnailUrl: string | null;
      galleryUrls: string[];
    };
  };
}

export default function LandingPage({ landingPage }: Props) {
  // Ensure we're using the correct commission rate
  const templateData = {
    ...landingPage.product,
    basePrice: Number(landingPage.product.basePrice),
    commissionRate: Number(landingPage.product.commissionRate)
  };

  const templateHtml = renderTemplate(landingPage.template, templateData);

  return (
    <>
      <Head>
        {/* Configuration script must come before the tracking script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.batchTrackingConfig = {
                debug: true, // So you can see what's happening in console
                apiUrl: 'https://www.mercacio.store/api/events', // Your tracking API endpoint
                cookieName: 'mercacio_attribution',
                cookieExpiry: 30 // days
            };
          `
        }} />
        <script 
          src="https://www.mercacio.store/batch-tracking.js" 
          data-auto-init="true"
          async
        />
      </Head>
      <div 
        dangerouslySetInnerHTML={{ __html: templateHtml }}
        data-settings={JSON.stringify(landingPage.settings)}
        data-custom-data={JSON.stringify(landingPage.customData)}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const trackingId = params?.trackingId as string;
    const preview = query.preview === 'true';

    // First, get the landing page with all necessary data
    const landingPage = await prisma.landingPage.findUnique({
      where: { 
        trackingId,
        isActive: true
      },
      select: {
        template: true,
        settings: true,
        customData: true,
        affiliateId: true,
        mercacioUserId: true, // Also get the mercacioUserId as it might be used as affiliateId
        productId: true,
        product: {
          select: {
            title: true,
            description: true,
            shortDescription: true,
            basePrice: true,
            commissionRate: true,
            imageUrl: true,
            thumbnailUrl: true,
            galleryUrls: true
          }
        }
      }
    });

    if (!landingPage) {
      return { notFound: true };
    }

    // Use either affiliateId or mercacioUserId for checking custom commissions
    const effectiveAffiliateId = landingPage.affiliateId || landingPage.mercacioUserId;
    console.log('Effective Affiliate ID:', effectiveAffiliateId);

    // Check for custom commission if there's an affiliateId
    let finalCommissionRate: Decimal = landingPage.product.commissionRate; // Default to product's commission rate

    if (effectiveAffiliateId) {
      console.log(`Checking custom commission for affiliate ${effectiveAffiliateId} and product ${landingPage.productId}`);
      
      const customCommission = await prisma.affiliateProductCommission.findUnique({
        where: {
          productId_affiliateId: {
            productId: landingPage.productId,
            affiliateId: effectiveAffiliateId
          }
        },
        select: {
          commission: true,
          isActive: true
        }
      });

      console.log('Found custom commission:', customCommission);

      if (customCommission && customCommission.isActive) {
        finalCommissionRate = customCommission.commission;
        console.log(`Found active custom commission: €${finalCommissionRate}`);
      } else {
        console.log(`No custom commission found, using default rate: €${finalCommissionRate}`);
      }
    } else {
      console.log(`No affiliate ID provided, using default commission rate: €${finalCommissionRate}`);
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
        commissionRate: finalCommissionRate.toString() // Use the final commission rate
      }
    };

    console.log('Final commission rate being used:', finalCommissionRate.toString());

    return {
      props: {
        landingPage: serializedPage
      }
    };
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return { notFound: true };
  }
}; 