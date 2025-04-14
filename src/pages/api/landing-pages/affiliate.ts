import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const validApiKey = await prisma.apiKey.findFirst({
      where: { key: apiKey as string, isActive: true }
    });

    if (!validApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const {
      productId,
      mercacioUserId,
      trackingId, // This will be the affiliate tracking ID from mercacio.store
      template,
      settings,
      customData,
      locale = 'en'
    } = req.body;

    // Validate required fields
    if (!productId || !mercacioUserId || !trackingId || !template) {
      return res.status(400).json({ 
        error: 'ProductId, mercacioUserId, trackingId, and template are required' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update landing page with the tracking ID
    const landingPage = await prisma.landingPage.upsert({
      where: {
        trackingId: trackingId
      },
      create: {
        productId,
        mercacioUserId,
        trackingId,
        template,
        settings,
        customData,
        locale,
        isActive: true
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
            name: true,
            description: true,
            basePrice: true,
            currency: true
          }
        }
      }
    });

    // Generate the URL using the tracking ID
    const url = `https://mercacio.net/p/${trackingId}`;

    return res.status(200).json({
      landingPage,
      url
    });

  } catch (error) {
    console.error('Landing page creation error:', error);
    return res.status(500).json({ error: 'Failed to create landing page' });
  }
} 