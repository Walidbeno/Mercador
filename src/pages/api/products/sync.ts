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
      id,
      title,
      description,
      short_description,
      sku,
      base_price,
      vat_rate,
      vat_included,
      commission,
      stock_quantity,
      thumbnail_url,
      image_url,
      gallery_urls,
      vendor_name,
      sales_page_url,
      status,
      featured,
      visibility,
      category_id
    } = req.body;

    // Validate required fields
    if (!id || !title || !description || !base_price || !commission) {
      return res.status(400).json({ 
        error: 'Required fields missing: id, title, description, base_price, commission' 
      });
    }

    // Create or update product
    const product = await prisma.product.upsert({
      where: { id },
      create: {
        id,
        title,
        description,
        shortDescription: short_description,
        sku,
        basePrice: base_price,
        vatRate: vat_rate,
        vatIncluded: vat_included,
        commissionRate: commission,
        stockQuantity: stock_quantity,
        thumbnailUrl: thumbnail_url,
        imageUrl: image_url,
        galleryUrls: gallery_urls || [],
        vendorName: vendor_name,
        salesPageUrl: sales_page_url,
        status,
        featured,
        visibility,
        categoryId: category_id
      },
      update: {
        title,
        description,
        shortDescription: short_description,
        sku,
        basePrice: base_price,
        vatRate: vat_rate,
        vatIncluded: vat_included,
        commissionRate: commission,
        stockQuantity: stock_quantity,
        thumbnailUrl: thumbnail_url,
        imageUrl: image_url,
        galleryUrls: gallery_urls || [],
        vendorName: vendor_name,
        salesPageUrl: sales_page_url,
        status,
        featured,
        visibility,
        categoryId: category_id,
        updatedAt: new Date()
      }
    });

    return res.status(200).json({
      message: 'Product synchronized successfully',
      product
    });

  } catch (error) {
    console.error('Product sync error:', error);
    return res.status(500).json({ error: 'Failed to sync product' });
  }
} 