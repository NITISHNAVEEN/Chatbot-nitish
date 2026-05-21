// Re-export placeholder functions from the new module
export { getPlaceholderImage, getRandomPlaceholderImage, placeholderImages } from './generate-placeholder';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

