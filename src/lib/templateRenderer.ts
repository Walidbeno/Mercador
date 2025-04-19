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
};

export function renderTemplate(template: TemplateType, product: Product): string {
  switch (template) {
    case 'modern':
      return modernTemplate(product);
    case 'minimal':
      return minimalTemplate(product);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
} 