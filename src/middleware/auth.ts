import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth/jwt';
import prisma from '@/lib/prisma';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    mercacioId: string;
    email: string;
    role: string;
  };
}

export const withAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Check for API key first (for app-to-app communication)
      const apiKey = req.headers['x-api-key'];
      if (apiKey) {
        const validApiKey = await prisma.apiKey.findFirst({
          where: { key: apiKey as string, isActive: true }
        });

        if (validApiKey) {
          // Update last used timestamp
          await prisma.apiKey.update({
            where: { id: validApiKey.id },
            data: { lastUsed: new Date() }
          });
          return handler(req, res);
        }
      }

      // Check for JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);

      // Verify session exists
      const session = await prisma.session.findFirst({
        where: {
          token,
          expires: { gt: new Date() }
        }
      });

      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      // Attach user to request
      req.user = {
        id: payload.userId,
        mercacioId: payload.mercacioId,
        email: payload.email,
        role: payload.role
      };

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}; 