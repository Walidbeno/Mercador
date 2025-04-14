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
      name,
      domain,
      description,
      settings
    } = req.body;

    // Validate required fields
    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain are required' });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ 
        error: 'Invalid domain format. Use only letters, numbers, and hyphens. Cannot start or end with hyphen.' 
      });
    }

    // Check if domain is already taken
    const existingStore = await prisma.store.findUnique({
      where: { domain }
    });

    if (existingStore) {
      return res.status(409).json({ error: 'Domain already taken' });
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        domain,
        description,
        settings,
        isActive: true
      }
    });

    return res.status(201).json({
      store,
      urls: {
        store: `https://${domain}.mercacio.store`,
        admin: `https://${domain}.mercacio.store/admin`
      }
    });

  } catch (error) {
    console.error('Store creation error:', error);
    return res.status(500).json({ error: 'Failed to create store' });
  }
} 