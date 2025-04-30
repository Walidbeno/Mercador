import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handleAddToCart(req, res);
    case 'GET':
      return handleGetCart(req, res);
    case 'PUT':
      return handleUpdateCart(req, res);
    case 'DELETE':
      return handleRemoveFromCart(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleAddToCart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { sessionId, productId, quantity = 1 } = req.body;

    if (!sessionId || !productId) {
      return res.status(400).json({ error: 'Session ID and Product ID are required' });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        storeId: storeId as string,
        sessionId,
        status: 'active'
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          storeId: storeId as string,
          sessionId,
          status: 'active',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      });
    }

    // Get store product
    const storeProduct = await prisma.storeProduct.findFirst({
      where: {
        storeId: storeId as string,
        productId,
        isActive: true
      }
    });

    if (!storeProduct) {
      return res.status(404).json({ error: 'Product not found in store' });
    }

    // Add item to cart
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_storeProductId: {
          cartId: cart.id,
          storeProductId: storeProduct.id
        }
      },
      update: {
        quantity: {
          increment: quantity
        }
      },
      create: {
        cartId: cart.id,
        storeProductId: storeProduct.id,
        quantity
      }
    });

    return res.status(200).json({
      success: true,
      cartItem
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

async function handleGetCart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const cart = await prisma.cart.findFirst({
      where: {
        storeId: storeId as string,
        sessionId: sessionId as string,
        status: 'active'
      },
      include: {
        items: {
          include: {
            storeProduct: {
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
            }
          }
        }
      }
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: null
      });
    }

    return res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

async function handleUpdateCart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { sessionId, items } = req.body;

    if (!sessionId || !items) {
      return res.status(400).json({ error: 'Session ID and items are required' });
    }

    const cart = await prisma.cart.findFirst({
      where: {
        storeId: storeId as string,
        sessionId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Update cart items
    for (const item of items) {
      if (item.quantity > 0) {
        await prisma.cartItem.update({
          where: {
            id: item.id
          },
          data: {
            quantity: item.quantity
          }
        });
      } else {
        await prisma.cartItem.delete({
          where: {
            id: item.id
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
}

async function handleRemoveFromCart(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { storeId } = req.query;
    const { sessionId, itemId } = req.body;

    if (!sessionId || !itemId) {
      return res.status(400).json({ error: 'Session ID and Item ID are required' });
    }

    const cart = await prisma.cart.findFirst({
      where: {
        storeId: storeId as string,
        sessionId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ error: 'Failed to remove item from cart' });
  }
} 