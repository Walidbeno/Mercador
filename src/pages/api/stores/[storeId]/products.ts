import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      // Check if this is a batch operation
      if (req.body.batch === true) {
        return handleBatchAddProducts(req, res);
      }
      return handleAddProduct(req, res);
    case 'GET':
      return handleGetProducts(req, res);
    case 'DELETE':
      return handleRemoveProduct(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleAddProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { productId, featured = false, sortOrder = 0 } = req.body;

    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId as string }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add product to store
    const storeProduct = await prisma.storeProduct.create({
      data: {
        storeId: storeId as string,
        productId,
        featured,
        sortOrder,
        isActive: true
      },
      include: {
        product: {
          select: {
            title: true,
            description: true,
            basePrice: true,
            commissionRate: true,
            imageUrl: true,
            thumbnailUrl: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      storeProduct
    });

  } catch (error) {
    console.error('Error adding product to store:', error);
    return res.status(500).json({ error: 'Failed to add product to store' });
  }
}

async function handleBatchAddProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { products } = req.body; // Array of { productId, featured, sortOrder }

    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Valid products array is required' });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId as string }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get all unique product IDs
    const productIds = Array.from(new Set(products.map(p => p.productId)));

    // Check if all products exist
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: { id: true }
    });

    const existingProductIds = new Set(existingProducts.map(p => p.id));
    const missingProductIds = productIds.filter(id => !existingProductIds.has(id));

    if (missingProductIds.length > 0) {
      return res.status(400).json({
        error: 'Some products not found',
        missingProductIds
      });
    }

    // Add or update all products
    const results = await Promise.all(
      products.map(async ({ productId, featured = false, sortOrder = 0 }) => {
        return prisma.storeProduct.upsert({
          where: {
            storeId_productId: {
              storeId: storeId as string,
              productId
            }
          },
          create: {
            storeId: storeId as string,
            productId,
            featured,
            sortOrder,
            isActive: true
          },
          update: {
            featured,
            sortOrder,
            isActive: true
          }
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: `${results.length} products added/updated to store`,
      count: results.length
    });

  } catch (error) {
    console.error('Error adding products to store:', error);
    return res.status(500).json({ error: 'Failed to add products to store' });
  }
}

async function handleGetProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;

    const products = await prisma.storeProduct.findMany({
      where: {
        storeId: storeId as string,
        isActive: true
      },
      include: {
        product: {
          select: {
            title: true,
            description: true,
            shortDescription: true,
            basePrice: true,
            commissionRate: true,
            imageUrl: true,
            thumbnailUrl: true,
            galleryUrls: true,
            status: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error fetching store products:', error);
    return res.status(500).json({ error: 'Failed to fetch store products' });
  }
}

async function handleRemoveProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { productId } = req.body;

    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Remove product from store (soft delete)
    await prisma.storeProduct.updateMany({
      where: {
        storeId: storeId as string,
        productId
      },
      data: {
        isActive: false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from store'
    });

  } catch (error) {
    console.error('Error removing product from store:', error);
    return res.status(500).json({ error: 'Failed to remove product from store' });
  }
} 