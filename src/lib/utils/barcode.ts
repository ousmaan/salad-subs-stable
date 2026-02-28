/**
 * Barcode generation utilities
 * Uses jsbarcode to generate CODE128 barcodes
 */

import JsBarcode from 'jsbarcode';

export interface BarcodeOptions {
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

/**
 * Generate barcode as SVG string
 */
export function generateBarcodeSVG(
  value: string,
  options: BarcodeOptions = {}
): string {
  // Create a temporary SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  const defaultOptions: BarcodeOptions = {
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 14,
    margin: 10,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    JsBarcode(svg, value, {
      format: 'CODE128',
      width: mergedOptions.width,
      height: mergedOptions.height,
      displayValue: mergedOptions.displayValue,
      fontSize: mergedOptions.fontSize,
      margin: mergedOptions.margin,
    });

    return svg.outerHTML;
  } catch (error) {
    console.error('Error generating barcode:', error);
    throw new Error('Failed to generate barcode');
  }
}

/**
 * Generate barcode as base64 data URL
 */
export function generateBarcodeDataURL(
  value: string,
  options: BarcodeOptions = {}
): string {
  const canvas = document.createElement('canvas');

  const defaultOptions: BarcodeOptions = {
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 14,
    margin: 10,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: mergedOptions.width,
      height: mergedOptions.height,
      displayValue: mergedOptions.displayValue,
      fontSize: mergedOptions.fontSize,
      margin: mergedOptions.margin,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    throw new Error('Failed to generate barcode');
  }
}

/**
 * Server-side barcode generation (returns SVG string)
 */
export function generateBarcodeServer(
  value: string,
  options: BarcodeOptions = {}
): string {
  const defaultOptions: BarcodeOptions = {
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 14,
    margin: 10,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Generate SVG manually for server-side
  const svgParts: string[] = [];
  const xmlHeader = '<?xml version="1.0" standalone="no"?>';
  
  svgParts.push(xmlHeader);
  svgParts.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1">');
  
  // This is a simplified version - in production, use a proper server-side barcode library
  // or generate on client-side only
  svgParts.push(`<text x="10" y="20" font-size="${mergedOptions.fontSize}">${value}</text>`);
  svgParts.push('</svg>');

  return svgParts.join('');
}
