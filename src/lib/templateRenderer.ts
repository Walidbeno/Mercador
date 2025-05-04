import { modernTemplate, minimalTemplate, TemplateType } from '@/templates';

type Product = {
  title: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  basePrice: number;
  commissionRate: number; // Fixed commission amount in euros
  galleryUrls?: string[];
  settings?: any;
};

export function renderTemplate(template: TemplateType, product: Product): string {
  // Ensure commission rate is a number
  const processedProduct = {
    ...product,
    commissionRate: Number(product.commissionRate),
    basePrice: Number(product.basePrice),
    settings: product.settings || {
      // Default settings to ensure proper rendering
      showCommission: true,
      showDescription: true,
      showGallery: true
    }
  };

  switch (template) {
    case 'modern':
      return modernTemplate(processedProduct);
    case 'minimal':
      return minimalTemplate(processedProduct);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}