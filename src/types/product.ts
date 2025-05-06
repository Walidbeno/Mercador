export interface ProductFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ProductTestimonial {
  text: string;
  author: string;
  rating?: number;
}

export interface CustomSection {
  title: string;
  content: string;
  position: 'top' | 'middle' | 'bottom';
}

export interface ProductSettings {
  customTitle?: string;
  customDescription?: string;
  showGallery?: boolean;
  showDescription?: boolean;
  showCommission?: boolean;
  ctaText?: string;
  ctaButtonText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  testimonials?: ProductTestimonial[];
  customSections?: CustomSection[];
  features?: ProductFeature[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  basePrice: number;
  commissionRate: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  galleryUrls?: string[];
  settings?: ProductSettings;
} 