import { modernTemplate, minimalTemplate, TemplateType } from '@/templates';
import { PrismaClient } from '../../../generated/prisma';

type Product = Parameters<PrismaClient['product']['create']>[0]['data'];

export const renderTemplate = (template: TemplateType, product: Product): string => {
  const templateData = {
    title: product.title,
    description: product.description,
    shortDescription: product.shortDescription || '',
    imageUrl: product.imageUrl || '',
    thumbnailUrl: product.thumbnailUrl || '',
    basePrice: Number(product.basePrice),
    commissionRate: Number(product.commissionRate),
    galleryUrls: product.galleryUrls || []
  };

  switch (template) {
    case 'modern':
      return modernTemplate(templateData);
    case 'minimal':
      return minimalTemplate(templateData);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}; 