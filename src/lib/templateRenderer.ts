import { modernTemplate, minimalTemplate, TemplateType } from '@/templates';

type Product = {
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  basePrice: number;
  commissionRate: number;
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