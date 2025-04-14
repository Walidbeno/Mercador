import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { createToken } from '@/lib/auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mercacioId, email, name, role = 'USER', metadata } = req.body;

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

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { mercacioId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          mercacioId,
          email,
          name,
          role: role as 'ADMIN' | 'AFFILIATE' | 'USER',
          metadata
        }
      });
    } else {
      // Update user data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          role: role as 'ADMIN' | 'AFFILIATE' | 'USER',
          metadata
        }
      });
    }

    // Create new session
    const token = createToken(user);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hour expiry

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expires
      }
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        mercacioId: user.mercacioId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
} 