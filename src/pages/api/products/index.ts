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
      action,
      id,
      title,
      description,
      shortDescription,
      basePrice,
      commission,
      stockQuantity = 0,
      imageUrl,
      galleryUrls = [],
      status = 'draft',
      featured = false,
      visibility = 'public',
      vatRate,
      vatIncluded = false,
      sku,
      vendorName,
      salesPageUrl,
      categoryId
    } = req.body;

    // Validate required fields
    if (!id || !title || !description || !basePrice || !commission) {
      return res.status(400).json({ 
        error: 'Required fields missing: id, title, description, basePrice, commission' 
      });
    }

    if (action === 'delete') {
      const deletedProduct = await prisma.product.delete({
        where: { id }
      });
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        product: deletedProduct
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
        basePrice: parseFloat(basePrice),
        commissionRate: parseFloat(commission),
        stockQuantity,
        imageUrl,
        galleryUrls,
        status,
        featured,
        visibility,
        vatRate: vatRate ? parseFloat(vatRate) : null,
        vatIncluded,
        sku,
        vendorName,
        salesPageUrl,
        categoryId
      },
      update: {
        title,
        description,
        shortDescription,
        basePrice: parseFloat(basePrice),
        commissionRate: parseFloat(commission),
        stockQuantity,
        imageUrl,
        galleryUrls,
        status,
        featured,
        visibility,
        vatRate: vatRate ? parseFloat(vatRate) : null,
        vatIncluded,
        sku,
        vendorName,
        salesPageUrl,
        categoryId
      }
    });

    return res.status(200).json({
      success: true,
      message: action === 'update' ? 'Product updated successfully' : 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Product sync error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to sync product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 