import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { templates, TemplateType } from '@/templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, template = 'modern' } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Validate template type
    if (!Object.keys(templates).includes(template as string)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId as string }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check for custom commission
    let commission = Number(product.basePrice) * (Number(product.commissionRate) / 100);
    
    if (req.query.affiliateId) {
      const customCommission = await prisma.affiliateProductCommission.findUnique({
        where: {
          productId_affiliateId: {
            productId: product.id,
            affiliateId: req.query.affiliateId as string
          }
        }
      });

      if (customCommission) {
        commission = Number(customCommission.commission);
      }
    }

    // Map product data to template format
    const templateData = {
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription || '',
      imageUrl: product.imageUrl || '',
      thumbnailUrl: product.thumbnailUrl || '',
      basePrice: Number(product.basePrice),
      commission: Number(product.commission),
      galleryUrls: product.galleryUrls
    };

    // Generate HTML
    let html = '';
    if (template === 'modern') {
      const { modernTemplate } = await import('@/templates/modern');
      html = modernTemplate(templateData);
    } else {
      const { minimalTemplate } = await import('@/templates/minimal');
      html = minimalTemplate(templateData);
    }

    // Set content type to HTML
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Template preview error:', error);
    return res.status(500).json({ error: 'Failed to generate template preview' });
  }
} 