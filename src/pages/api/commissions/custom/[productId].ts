import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate that the API key starts with 'mercacio_pk_'
    if (!apiKey.toString().startsWith('mercacio_pk_')) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Get productId from URL
    const productId = req.query.productId as string;
    const {
      affiliateId,
      commission, // Fixed commission amount in euros
      isActive = true
    } = req.body;

    console.log('Received commission update request:', {
      method: req.method,
      productId,
      affiliateId,
      commission,
      isActive
    });

    // Validate required fields
    if (!affiliateId) {
      return res.status(400).json({ 
        error: 'Required field missing: affiliateId' 
      });
    }

    // If commission is not provided, remove any custom commission
    if (commission === undefined || commission === null) {
      // Check if a custom commission exists
      const existingCommission = await prisma.affiliateProductCommission.findUnique({
        where: {
          productId_affiliateId: {
            productId,
            affiliateId
          }
        }
      });

      if (existingCommission) {
        // Delete the custom commission to revert to default
        await prisma.affiliateProductCommission.delete({
          where: {
            id: existingCommission.id
          }
        });

        console.log('Removed custom commission for:', { productId, affiliateId });
        return res.status(200).json({
          success: true,
          message: 'Custom commission removed, reverting to default product commission',
          synced: true
        });
      }

      return res.status(200).json({
        success: true,
        message: 'No custom commission found, using default product commission',
        synced: true
      });
    }

    // Validate commission amount
    const amount = parseFloat(commission);
    if (isNaN(amount) || amount < 0) {
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
      create: {
        productId,
        affiliateId,
        commission: amount,
        isActive,
        externalSync: true
      },
      update: {
        commission: amount,
        isActive,
        externalSync: true,
        updatedAt: new Date()
      }
    });

    console.log('Updated custom commission:', customCommission);
    return res.status(200).json({
      success: true,
      message: 'Custom commission updated successfully',
      data: customCommission,
      synced: true
    });

  } catch (error) {
    console.error('Custom commission error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update custom commission',
      details: error instanceof Error ? error.message : 'Unknown error',
      synced: false
    });
  }
} 