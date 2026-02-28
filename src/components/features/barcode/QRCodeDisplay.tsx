/**
 * QR Code Display Component
 * Alternative to barcode for better mobile scanning
 */

'use client';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 200, className = '' }: QRCodeDisplayProps) {
  // Using Google Charts QR Code API as simple alternative
  // For production, consider using a library like qrcode.react
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(
    value
  )}`;

  return (
    <div className={className}>
      <img src={qrCodeUrl} alt={`QR Code for ${value}`} width={size} height={size} />
    </div>
  );
}
