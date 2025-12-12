declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  export interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    publicExcludes?: string[];
    buildExcludes?: string[] | ((path: string) => boolean)[];
    scope?: string;
    sw?: string;
  }
  
  export default function withPWA(pwaConfig?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
} 