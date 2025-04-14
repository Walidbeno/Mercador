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
      id,
      title,
      description,
      shortDescription,
      sku,
      basePrice,
      vatRate,
      vatIncluded,
      commissionRate,
      commissionType = 'percentage',
      stockQuantity = 0,
      thumbnailUrl,
      imageUrl,
      galleryUrls = [],
      vendorName,
      salesPageUrl,
      status = 'draft',
      featured = false,
      visibility = 'public',
      categoryId
    } = req.body;

    // Validate required fields
    if (!id || !title || !description || !basePrice || !commissionRate) {
      return res.status(400).json({ 
        error: 'Required fields missing: id, title, description, basePrice, commissionRate' 
      });
    }

    // Create or update product
    const product = await prisma.product.upsert({
      where: { id },
      create: {
        id,
        title,
        description,
        shortDescription,
        sku,
        basePrice,
        vatRate,
        vatIncluded,
        commissionRate,
        commissionType,
        stockQuantity,
        thumbnailUrl,
        imageUrl,
        galleryUrls,
        vendorName,
        salesPageUrl,
        status,
        featured,
        visibility,
        categoryId
      },
      update: {
        title,
        description,
        shortDescription,
        sku,
        basePrice,
        vatRate,
        vatIncluded,
        commissionRate,
        commissionType,
        stockQuantity,
        thumbnailUrl,
        imageUrl,
        galleryUrls,
        vendorName,
        salesPageUrl,
        status,
        featured,
        visibility,
        categoryId
      }
    });

    return res.status(200).json({
      message: 'Product synchronized successfully',
      product
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
} 