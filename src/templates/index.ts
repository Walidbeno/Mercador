export * from './modern';
export * from './minimal';

export const templates = {
  modern: 'modern',
  minimal: 'minimal'
} as const;

export type TemplateType = keyof typeof templates; 