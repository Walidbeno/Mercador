import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.body.apiKey || req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const {
      productId,
      affiliateId,
      trackingId,
      template = 'modern', // default template
      settings = {},
      customData = {},
      locale = 'en'
    } = req.body;

    // Validate required fields
    if (!productId || !affiliateId || !trackingId) {
      return res.status(400).json({ 
        error: 'Required fields missing: productId, affiliateId, trackingId' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update landing page
    const landingPage = await prisma.landingPage.upsert({
      where: {
        trackingId
      },
      create: {
        productId,
        mercacioUserId: affiliateId,
        trackingId,
        template,
        settings,
        customData,
        locale,
        isActive: true,
        affiliateId
      },
      update: {
        template,
        settings,
        customData,
        locale,
        isActive: true,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            title: true,
            description: true,
            basePrice: true,
            commissionRate: true,
            imageUrl: true,
            thumbnailUrl: true,
            galleryUrls: true
          }
        }
      }
    });

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mercacio.net';
    const landingPageUrl = `${baseUrl}/p/${trackingId}`;
    const previewUrl = `${baseUrl}/api/templates/preview?productId=${productId}&template=${template}`;

    return res.status(200).json({
      success: true,
      message: 'Landing page created successfully',
      data: {
        landingPage,
        urls: {
          landing: landingPageUrl,
          preview: previewUrl
        }
      }
    });

  } catch (error) {
    console.error('Landing page sync error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to sync landing page',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 