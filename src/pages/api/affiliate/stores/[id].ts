import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MERCACIO_API_KEY) {
      return res.status(401).json({ error: 'API key not configured' });
    }

    const { id } = req.query; // This is the store ID

    if (req.method === 'GET') {
      // Get store details
      const store = await prisma.store.findUnique({
        where: { id: id as string }
      });

      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      return res.status(200).json({
        success: true,
        store
      });
    }

    if (req.method === 'PATCH') {
      const {
        name,
        description,
        logo,
        banner,
        theme,
        settings,
        ownerId
      } = req.body;

      // Verify store exists and belongs to the owner
      const existingStore = await prisma.store.findFirst({
        where: {
          id: id as string,
          ownerId
        }
      });

      if (!existingStore) {
        return res.status(404).json({ error: 'Store not found or unauthorized' });
      }

      // Update store
      const updatedStore = await prisma.store.update({
        where: { id: id as string },
        data: {
          name: name || undefined,
          description: description || undefined,
          logo: logo || undefined,
          banner: banner || undefined,
          theme: theme || undefined,
          settings: settings || undefined
        }
      });

      return res.status(200).json({
        success: true,
        store: updatedStore
      });
    }
  } catch (error) {
    console.error('Store operation error:', error);
    return res.status(500).json({ error: 'Failed to process store operation' });
  }
} 