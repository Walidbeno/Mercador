import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handleCreateStore(req, res);
    case 'GET':
      return handleGetStores(req, res);
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
    } = req.body;

    // Validate required fields
    if (!name || !ownerId) {
      return res.status(400).json({ 
        error: 'Name and ownerId are required' 
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
        isActive: true
      }
    });

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

    return res.status(200).json({
      success: true,
      stores
    });

  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
} 