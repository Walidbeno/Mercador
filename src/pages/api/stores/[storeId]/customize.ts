import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { storeCache } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId } = req.query;
    
    // In a real app, we would validate the user's token here
    // to ensure they have permission to edit this store
    const { 
      name,
      description,
      logo,
      banner,
      theme,
      settings,
      sections
    } = req.body;

    // Verify store exists before updating
    const store = await prisma.store.findUnique({
      where: { id: storeId as string }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Update store with customization data
    const updatedStore = await prisma.store.update({
      where: { id: storeId as string },
      data: {
        name: name || undefined,
        description: description || undefined,
        logo: logo || undefined,
        banner: banner || undefined,
        theme: theme || undefined,
        settings: {
          ...(store.settings as object || {}),
          ...(settings || {}),
          sections: sections || undefined
        }
      }
    });

    // First invalidate the old cache
    await storeCache.invalidate({
      id: storeId as string,
      slug: store.slug
    });
    
    // Then set the new cache
    await storeCache.set(updatedStore);
    
    console.log(`Store cache updated for: ${updatedStore.name} (${updatedStore.id})`);

    return res.status(200).json({
      success: true,
      store: updatedStore
    });

  } catch (error) {
    console.error('Store customization error:', error);
    return res.status(500).json({ error: 'Failed to update store customization' });
  }
} 