import { Capacitor } from '@capacitor/core';
import { prepareZXingModule } from 'barcode-detector/pure';

export interface ProductInfo {
  barcode: string;
  productName: string | null;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
}

prepareZXingModule({
  overrides: { locateFile: (path: string) => `wasm/${path}` },
  equalityFn: Object.is,
  fireImmediately: false,
});

export async function scanBarcode(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Web scanning requires ScannerOverlay component');
  }
  try {
    const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
    const result = await BarcodeScanner.scan();
    return result.barcodes[0]?.displayValue ?? null;
  } catch (e) {
    console.error('Barcode scan cancelled or failed:', e);
    return null;
  }
}

export function isNativeBarcodeScanAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export async function lookupProduct(barcode: string): Promise<ProductInfo | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      barcode,
      productName: p.product_name || null,
      brand: p.brands || null,
      imageUrl: p.image_url || null,
      quantity: p.quantity || null,
    };
  } catch {
    return null;
  }
}
