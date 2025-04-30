import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { storeId } = req.query;
    const {
      affiliateId,
      products // Array of { productId, featured, sortOrder }
    } = req.body;

    if (!affiliateId || !products || !Array.isArray(products)) {
      return res.status(400).json({ 
        error: 'affiliateId and products array are required' 
      });
    }

    // Verify store exists and belongs to the affiliate
    const store = await prisma.store.findFirst({
      where: {
        id: storeId as string,
        ownerId: affiliateId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or unauthorized' });
    }

    // Verify all products have approved commissions for this affiliate
    const approvedProducts = await prisma.affiliateProductCommission.findMany({
      where: {
        affiliateId,
        productId: {
          in: products.map(p => p.productId)
        },
        isActive: true
      },
      select: {
        productId: true
      }
    });

    const approvedProductIds = new Set(approvedProducts.map(p => p.productId));
    const unapprovedProducts = products.filter(p => !approvedProductIds.has(p.productId));

    if (unapprovedProducts.length > 0) {
      return res.status(400).json({
        error: 'Some products are not approved for this affiliate',
        unapprovedProducts: unapprovedProducts.map(p => p.productId)
      });
    }

    // Add products to store
    const storeProducts = await Promise.all(
      products.map(async (product) => {
        return prisma.storeProduct.upsert({
          where: {
            storeId_productId: {
              storeId: storeId as string,
              productId: product.productId
            }
          },
          create: {
            storeId: storeId as string,
            productId: product.productId,
            featured: product.featured || false,
            sortOrder: product.sortOrder || 0,
            isActive: true
          },
          update: {
            featured: product.featured || false,
            sortOrder: product.sortOrder || 0,
            isActive: true
          }
        });
      })
    );

    return res.status(200).json({
      success: true,
      addedProducts: storeProducts
    });

  } catch (error) {
    console.error('Error adding approved products:', error);
    return res.status(500).json({ error: 'Failed to add products to store' });
  }
} 