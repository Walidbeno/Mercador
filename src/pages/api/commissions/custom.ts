import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handleSetCustomCommission(req, res);
    case 'GET':
      return handleGetCustomCommissions(req, res);
    default:
    return res.status(405).json({ error: 'Method not allowed' });
  }
  }

async function handleSetCustomCommission(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { productId, affiliateId, commission } = req.body;

    // Validate required fields
    if (!productId || !affiliateId || commission === undefined) {
      return res.status(400).json({ 
        error: 'Product ID, Affiliate ID, and commission are required' 
      });
    }

    // Validate commission is a positive number
    if (typeof commission !== 'number' || commission < 0) {
      return res.status(400).json({ 
        error: 'Commission must be a positive number' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update custom commission
    const customCommission = await prisma.affiliateProductCommission.upsert({
      where: {
        productId_affiliateId: {
          productId,
          affiliateId
        }
      },
      update: {
        commission,
        isActive: true
      },
      create: {
        productId,
        affiliateId,
        commission,
        isActive: true
      }
    });

    return res.status(200).json({
      success: true,
      commission: customCommission
    });

  } catch (error) {
    console.error('Error setting custom commission:', error);
    return res.status(500).json({ error: 'Failed to set custom commission' });
  }
}

async function handleGetCustomCommissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { affiliateId, productId } = req.query;

    // Build where clause based on provided filters
    const where: any = {
      isActive: true
    };

    if (affiliateId) {
      where.affiliateId = affiliateId as string;
    }

    if (productId) {
      where.productId = productId as string;
    }

    // Get custom commissions
    const commissions = await prisma.affiliateProductCommission.findMany({
      where,
      include: {
        product: {
          select: {
            title: true,
            basePrice: true,
            commissionRate: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      commissions
    });

  } catch (error) {
    console.error('Error getting custom commissions:', error);
    return res.status(500).json({ error: 'Failed to get custom commissions' });
  }
} 