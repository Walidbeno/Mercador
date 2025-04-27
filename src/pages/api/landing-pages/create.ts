import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key against environment variable
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const {
      productId,
      mercacioUserId,
      mercacioProductId,
      trackingId,
      template,
      settings,
      customData,
      locale = 'en',
      affiliateId
    } = req.body;

    // Validate required fields
    if (!productId || !mercacioUserId || !mercacioProductId || !template || !trackingId) {
      return res.status(400).json({ 
        error: 'ProductId, mercacioUserId, mercacioProductId, trackingId, and template are required' 
      });
    }

    // Check if trackingId already exists
    const existingTrackingPage = await prisma.landingPage.findUnique({
      where: { trackingId }
    });

    if (existingTrackingPage) {
      return res.status(409).json({ 
        error: 'Landing page with this tracking ID already exists' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if this user already has a landing page for this product and locale
    const existingUserPage = await prisma.landingPage.findFirst({
      where: {
        productId,
        mercacioUserId,
        locale
      }
    });

    if (existingUserPage) {
      return res.status(409).json({ 
        error: 'Landing page already exists for this user, product, and locale combination' 
      });
    }

    // Create landing page
    const landingPage = await prisma.landingPage.create({
      data: {
        productId,
        mercacioUserId,
        trackingId,
        template,
        settings,
        customData,
        locale,
        affiliateId,
        isActive: true
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

    // Generate URLs for both formats
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const legacyUrl = `${baseUrl}/p/${trackingId}`;
    const refUrl = `${baseUrl}/ref/${trackingId}`;
    
    // If there's an affiliate, add their ID to the URLs
    const finalLegacyUrl = affiliateId ? `${legacyUrl}?aff=${affiliateId}` : legacyUrl;
    const finalRefUrl = affiliateId ? `${refUrl}?aff=${affiliateId}` : refUrl;

    return res.status(201).json({
      landingPage,
      urls: {
        legacy: finalLegacyUrl,
        reference: finalRefUrl
      },
      trackingId
    });

  } catch (error) {
    console.error('Landing page creation error:', error);
    return res.status(500).json({ error: 'Failed to create landing page' });
  }
} 