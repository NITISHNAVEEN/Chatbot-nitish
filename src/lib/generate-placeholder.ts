/**
 * Generate deterministic placeholder images locally
 * This replaces the external picsum.photos service
 */

export interface PlaceholderOptions {
  width?: number;
  height?: number;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  seed?: string;
}

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

// Color palette for deterministic colors based on seed
const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getColorFromSeed(seed: string): string {
  const index = hashCode(seed) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

function generateSVG(
  width: number,
  height: number,
  backgroundColor: string,
  textColor: string,
  text: string
): string {
  const svgText = encodeURIComponent(text);
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <text
        x="50%"
        y="50%"
        font-size="${Math.min(width, height) / 4}"
        font-family="Arial, sans-serif"
        fill="${textColor}"
        text-anchor="middle"
        dy=".3em"
        opacity="0.8"
      >
        ${text}
      </text>
    </svg>
  `;
}

export function generatePlaceholderDataUrl(options: PlaceholderOptions = {}): string {
  const width = options.width || DEFAULT_WIDTH;
  const height = options.height || DEFAULT_HEIGHT;
  const seed = options.seed || 'default';
  const text = options.text || '📷';
  
  const backgroundColor = options.backgroundColor || getColorFromSeed(seed);
  const textColor = options.textColor || '#FFFFFF';
  
  const svg = generateSVG(width, height, backgroundColor, textColor, text);
  
  // Create data URL for SVG
  const svgData = svg.trim();
  const base64 = Buffer.from(svgData).toString('base64');
  
  return `data:image/svg+xml;base64,${base64}`;
}

// For use in browser environments where Buffer is not available
export function generatePlaceholderDataUrlBrowser(options: PlaceholderOptions = {}): string {
  const width = options.width || DEFAULT_WIDTH;
  const height = options.height || DEFAULT_HEIGHT;
  const seed = options.seed || 'default';
  const text = options.text || '📷';
  
  const backgroundColor = options.backgroundColor || getColorFromSeed(seed);
  const textColor = options.textColor || '#FFFFFF';
  
  const svg = generateSVG(width, height, backgroundColor, textColor, text);
  
  // Create data URL using encodeURIComponent for browser
  const svgData = svg.trim();
  const encoded = encodeURIComponent(svgData);
  
  return `data:image/svg+xml,${encoded}`;
}

// Generate a URL-safe placeholder image (using data URL)
export function getPlaceholderImage(
  seed: string,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT,
  text: string = '📷'
): string {
  const backgroundColor = getColorFromSeed(seed);
  
  return generatePlaceholderDataUrlBrowser({
    width,
    height,
    text,
    backgroundColor,
    textColor: '#FFFFFF',
    seed,
  });
}

// For backwards compatibility with the old placeholder-images system
export const placeholderImages = [
  { id: 1, url: (seed?: string) => getPlaceholderImage(seed || 'image-1') },
  { id: 2, url: (seed?: string) => getPlaceholderImage(seed || 'image-2') },
  { id: 3, url: (seed?: string) => getPlaceholderImage(seed || 'image-3') },
  { id: 4, url: (seed?: string) => getPlaceholderImage(seed || 'image-4') },
  { id: 5, url: (seed?: string) => getPlaceholderImage(seed || 'image-5') },
];

export function getRandomPlaceholderImage(seed?: string): string {
  const image = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  return image.url(seed);
}
