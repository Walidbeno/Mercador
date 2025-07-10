import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { storeCache } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handleCreateStore(req, res);
    case 'GET':
      return handleGetStores(req, res);
    case 'DELETE':
      return handleDeleteStore(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleCreateStore(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const {
      name,
      description,
      logo,
      banner,
      theme,
      settings,
      ownerId,
      affiliateId, // Add affiliateId to the request body
    } = req.body;

    // Validate required fields
    if (!name || !ownerId || !affiliateId) {
      return res.status(400).json({ 
        error: 'Name, ownerId, and affiliateId are required' 
      });
    }

    // Generate a UUID for both id and slug
    const storeId = randomUUID();

    // Create store with the generated UUID
    const store = await prisma.store.create({
      data: {
        id: storeId,
        name,
        slug: storeId,
        description,
        logo,
        banner,
        theme,
        settings,
        ownerId,
        affiliateId, // Add affiliateId to store creation
        isActive: true
      }
    });

    // Cache the new store
    await storeCache.set(store);
    console.log(`New store cached: ${store.name} (${store.id})`);

    return res.status(201).json({
      success: true,
      store
    });

  } catch (error) {
    console.error('Store creation error:', error);
    return res.status(500).json({ error: 'Failed to create store' });
  }
}

async function handleGetStores(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    // For listing stores, we'll use the database directly since we need to query by owner
    const stores = await prisma.store.findMany({
      where: {
        ownerId: ownerId as string,
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Cache each store individually for future use
    await Promise.all(stores.map(store => storeCache.set(store)));

    return res.status(200).json({
      success: true,
      stores
    });

  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
}

async function handleDeleteStore(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { storeId, ownerId } = req.body;

    // Validate required fields
    if (!storeId || !ownerId) {
      return res.status(400).json({ 
        error: 'Store ID and Owner ID are required' 
      });
    }

    // First, verify the store exists and belongs to the owner
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId,
        isActive: true
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or unauthorized' });
    }

    // Start a transaction to handle all related data
    const result = await prisma.$transaction(async (tx) => {
      // Soft delete cart items
      await tx.cartItem.updateMany({
        where: {
          cart: {
            storeId: storeId
          }
        },
        data: {
          updatedAt: new Date()
        }
      });

      // Soft delete carts
      await tx.cart.updateMany({
        where: {
          storeId: storeId
        },
        data: {
          status: 'deleted',
          updatedAt: new Date()
        }
      });

      // Soft delete store products
      await tx.storeProduct.updateMany({
        where: {
          storeId: storeId
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Finally, soft delete the store
      const deletedStore = await tx.store.update({
        where: {
          id: storeId
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      return deletedStore;
    });

    // Invalidate the store cache
    await storeCache.invalidate({
      id: result.id,
      slug: result.slug
    });

    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
      store: result
    });

  } catch (error) {
    console.error('Store deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete store' });
  }
} 