import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
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
      name,
      description,
      logo,
      banner,
      theme,
      settings,
      ownerId // For verification
    } = req.body;

    // Verify store exists and belongs to the owner
    const store = await prisma.store.findFirst({
      where: {
        id: storeId as string,
        ownerId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or unauthorized' });
    }

    // Update store settings
    const updatedStore = await prisma.store.update({
      where: { id: storeId as string },
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

  } catch (error) {
    console.error('Store settings update error:', error);
    return res.status(500).json({ error: 'Failed to update store settings' });
  }
} 