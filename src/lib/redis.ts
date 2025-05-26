import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

// Initialize Redis client with retries and timeouts
export const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: true
});

// Handle Redis connection events
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('ready', () => {
  console.log('Redis client is ready');
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

// Test the connection
async function testConnection() {
  try {
    await redis.ping();
    console.log('Redis connection test successful');
  } catch (error) {
    console.error('Redis connection test failed:', error);
    // Don't throw here, let the application continue but log the error
  }
}

// Run the test when the module is imported
testConnection();

export const storeCache = {
  /**
   * Get a store from the cache
   */
  async get(identifier: string, type: 'id' | 'slug' = 'slug'): Promise<any | null> {
    try {
      const key = `store:${type}:${identifier}`;
      const cached = await redis.get(key);
      
      if (!cached) {
        return null;
      }

      const store = JSON.parse(cached);
      
      // If this is a slug reference, fetch the actual store data
      if (type === 'slug' && store._type === 'reference') {
        return this.get(store.id, 'id');
      }
      
      return store;
    } catch (error) {
      console.error(`Error getting store from cache (${type}:${identifier}):`, error);
      // Return null on error to allow fallback to database
      return null;
    }
  },

  /**
   * Set a store in the cache
   */
  async set(store: any, expiresIn: number = 3600): Promise<void> {
    try {
      if (!store || !store.id) {
        throw new Error('Cannot cache store without ID');
      }

      // Cache by ID
      const idKey = `store:id:${store.id}`;
      const storeData = JSON.stringify({
        ...store,
        _cache: {
          timestamp: Date.now(),
          version: '1.0'
        }
      });

      // Use pipeline to set both keys atomically
      const pipeline = redis.pipeline();
      
      pipeline.setex(idKey, expiresIn, storeData);

      // Cache slug reference if available
      if (store.slug) {
        const slugKey = `store:slug:${store.slug}`;
        const slugData = JSON.stringify({
          _type: 'reference',
          id: store.id,
          name: store.name,
          updatedAt: Date.now()
        });
        
        pipeline.setex(slugKey, expiresIn, slugData);
      }

      await pipeline.exec();
      console.log(`Store cached successfully: ${store.name} (${store.id})`);
    } catch (error) {
      console.error(`Error caching store ${store?.id}:`, error);
      // Don't throw, let the application continue without caching
    }
  },

  /**
   * Invalidate store cache
   */
  async invalidate(store: { id: string; slug?: string } | string): Promise<void> {
    try {
      const storeId = typeof store === 'string' ? store : store.id;
      const slug = typeof store === 'string' ? undefined : store.slug;

      // Use pipeline to delete both keys atomically
      const pipeline = redis.pipeline();
      
      // Remove ID-based cache
      pipeline.del(`store:id:${storeId}`);

      // Remove slug-based reference if available
      if (slug) {
        pipeline.del(`store:slug:${slug}`);
      }

      await pipeline.exec();
      console.log(`Store cache invalidated: ${storeId}`);
    } catch (error) {
      console.error('Error invalidating store cache:', error);
      // Don't throw, let the application continue
    }
  },

  /**
   * Get all cached store slugs
   */
  async getAllSlugs(): Promise<string[]> {
    try {
      const keys = await redis.keys('store:slug:*');
      return keys.map(key => key.replace('store:slug:', ''));
    } catch (error) {
      console.error('Error getting store slugs:', error);
      return [];
    }
  }
}; 