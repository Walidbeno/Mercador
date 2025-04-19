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
      trackingId,
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
            title: true,
            description: true,
            basePrice: true,
            commission: true
          }
        }
      }
    });

    // Generate the URL using the tracking ID
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/p/${trackingId}`;

    return res.status(200).json({
      landingPage,
      url
    });

  } catch (error) {
    console.error('Landing page creation error:', error);
    return res.status(500).json({ error: 'Failed to create landing page' });
  }
} 