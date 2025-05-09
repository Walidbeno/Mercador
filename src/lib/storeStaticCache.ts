import fs from 'fs';
import path from 'path';

const STATIC_STORES_DIR = path.join(process.cwd(), 'public', 'static-stores');

// Ensure cache directory exists
if (!fs.existsSync(STATIC_STORES_DIR)) {
  fs.mkdirSync(STATIC_STORES_DIR, { recursive: true });
}

/**
 * Store static cache manager
 * - Generates static JSON files for stores
 * - Updates them when store data changes
 * - Maintains the same link structure
 */
export const storeStaticCache = {
  /**
   * Get the cache path for a store (by ID or slug)
   */
  getPath: (identifier: string, type: 'id' | 'slug' = 'id'): string => {
    return path.join(STATIC_STORES_DIR, `${type}-${identifier}.json`);
  },

  /**
   * Check if a store exists in the static cache
   */
  exists: (identifier: string, type: 'id' | 'slug' = 'id'): boolean => {
    const cachePath = storeStaticCache.getPath(identifier, type);
    return fs.existsSync(cachePath);
  },

  /**
   * Get a store from the static cache
   */
  get: (identifier: string, type: 'id' | 'slug' = 'id'): any | null => {
    const cachePath = storeStaticCache.getPath(identifier, type);
    
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    
    try {
      const cacheContent = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(cacheContent);
    } catch (error) {
      console.error(`Error reading store static cache (${type}:${identifier}):`, error);
      return null;
    }
  },
  
  /**
   * Create or update a store in the static cache
   */
  set: (store: any): void => {
    if (!store || !store.id) {
      console.error('Cannot cache store without ID');
      return;
    }
    
    try {
      // Create both ID and slug based files for easy lookup
      const idCachePath = storeStaticCache.getPath(store.id, 'id');
      
      // Store metadata to track when the cache was created
      const storeWithMeta = {
        ...store,
        _cache: {
          timestamp: Date.now(),
          version: '1.0'
        }
      };
      
      // Write the ID-based cache file
      fs.writeFileSync(idCachePath, JSON.stringify(storeWithMeta, null, 2));
      
      // If store has a slug, also create a slug-based reference
      if (store.slug) {
        const slugCachePath = storeStaticCache.getPath(store.slug, 'slug');
        
        // For the slug version, we store a reference to the ID cache
        // This avoids duplication of large store data
        const slugReference = {
          _type: 'reference',
          id: store.id,
          name: store.name,
          updatedAt: Date.now()
        };
        
        fs.writeFileSync(slugCachePath, JSON.stringify(slugReference, null, 2));
      }
      
      console.log(`Static store generated for: ${store.name} (${store.id})`);
    } catch (error) {
      console.error(`Error writing store static cache for ${store.id}:`, error);
    }
  },
  
  /**
   * Invalidate cache for a specific store
   * This removes the static files, forcing regeneration
   */
  invalidate: (store: { id: string, slug?: string } | string): void => {
    try {
      let storeId: string;
      let slug: string | undefined;
      
      if (typeof store === 'string') {
        storeId = store;
      } else {
        storeId = store.id;
        slug = store.slug;
      }
      
      // Remove the ID-based cache file
      const idCachePath = storeStaticCache.getPath(storeId, 'id');
      if (fs.existsSync(idCachePath)) {
        fs.unlinkSync(idCachePath);
      }
      
      // Also remove slug-based reference if available
      if (slug) {
        const slugCachePath = storeStaticCache.getPath(slug, 'slug');
        if (fs.existsSync(slugCachePath)) {
          fs.unlinkSync(slugCachePath);
        }
      }
      
      console.log(`Static store cache invalidated for: ${storeId}`);
    } catch (error) {
      console.error('Error invalidating store static cache:', error);
    }
  },
  
  /**
   * Get all cached store slugs
   */
  getAllSlugs: (): string[] => {
    try {
      const files = fs.readdirSync(STATIC_STORES_DIR);
      return files
        .filter(file => file.startsWith('slug-') && file.endsWith('.json'))
        .map(file => file.replace('slug-', '').replace('.json', ''));
    } catch (error) {
      console.error('Error reading store slugs:', error);
      return [];
    }
  }
}; 