import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGetProductCommissions(req, res);
    case 'DELETE':
      return handleDeleteCustomCommission(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetProductCommissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId } = req.query;

    // Get all custom commissions for this product
    const commissions = await prisma.affiliateProductCommission.findMany({
      where: {
        productId: productId as string,
        isActive: true
      },
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
    console.error('Error getting product commissions:', error);
    return res.status(500).json({ error: 'Failed to get product commissions' });
  }
}

async function handleDeleteCustomCommission(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { productId } = req.query;
    const { affiliateId } = req.body;

    if (!affiliateId) {
      return res.status(400).json({ error: 'Affiliate ID is required' });
    }

    // Delete (soft delete by setting isActive to false) the custom commission
    await prisma.affiliateProductCommission.update({
      where: {
        productId_affiliateId: {
          productId: productId as string,
          affiliateId
        }
      },
      data: {
        isActive: false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Custom commission removed successfully'
    });

  } catch (error) {
    console.error('Error deleting custom commission:', error);
    return res.status(500).json({ error: 'Failed to delete custom commission' });
  }
} 