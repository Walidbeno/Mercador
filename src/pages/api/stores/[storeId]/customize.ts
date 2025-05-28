import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { storeCache } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId } = req.query;
    console.log('Received customize request for store:', storeId);
    
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

    console.log('Received sections data:', sections);

    // Verify store exists before updating
    const store = await prisma.store.findUnique({
      where: { id: storeId as string }
    });

    if (!store) {
      console.log('Store not found:', storeId);
      return res.status(404).json({ error: 'Store not found' });
    }

    console.log('Current store settings:', store.settings);

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
          sections: settings?.sections ? settings.sections.map((section: any) => ({
            id: section.id,
            type: section.type,
            title: section.title || '',
            content: section.content || '',
            order: section.order || 0,
            settings: {
              ...section.settings,
              subtitle: section.settings?.subtitle || '',
              buttonText: section.settings?.buttonText || 'Shop Now'
            }
          })) : undefined
        }
      }
    });

    console.log('Updated store settings:', updatedStore.settings);

    // First invalidate the old cache
    console.log('Invalidating cache for store:', storeId);
    await storeCache.invalidate({
      id: storeId as string,
      slug: store.slug
    });
    
    // Then set the new cache
    console.log('Setting new cache for store:', storeId);
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