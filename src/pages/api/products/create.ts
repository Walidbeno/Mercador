import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
      mercacioId,
      name,
      description,
      basePrice,
      currency = 'EUR',
      metadata,
      landingPages = []
    } = req.body;

    // Create or update product
    const product = await prisma.product.upsert({
      where: { mercacioId },
      create: {
        mercacioId,
        name,
        description,
        basePrice,
        currency,
        metadata
      },
      update: {
        name,
        description,
        basePrice,
        currency,
        metadata
      }
    });

    // Create landing pages
    const createdPages = await Promise.all(
      landingPages.map(async (page: {
        mercacioUserId: string;
        template: string;
        locale: string;
        affiliateId?: string;
        customData?: any;
        settings?: any;
      }) => {
        const trackingId = `${page.mercacioUserId}-${mercacioId}`;
        
        return prisma.landingPage.create({
          data: {
            productId: product.id,
            mercacioUserId: page.mercacioUserId,
            trackingId,
            template: page.template,
            locale: page.locale,
            affiliateId: page.affiliateId,
            customData: page.customData,
            settings: page.settings,
            isActive: true
          }
        });
      })
    );

    return res.status(200).json({
      product,
      landingPages: createdPages
    });
  } catch (error) {
    console.error('Product creation error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
} 