import { Capacitor } from '@capacitor/core';

/**
 * Configuración centralizada de la aplicación
 * Toda configuración debe venir de aquí - no magic strings/numbers
 */

export const CONFIG = {
  // API
  API: {
    BASE_URL: Capacitor.isNativePlatform()
      ? 'https://api-mobile.pharmaser.com.co'//'http://192.168.1.88:8052'
      : '/api',
    TIMEOUT: 10_000,
    RETTRIES: 2,
  },

  // Auth
  AUTH: {
    SESSION_DURATION_MS: 4 * 60 * 60 * 1000, // 4 horas
    STORAGE_KEY: 'session',
  },

  // Documentos
  DOCUMENT: {
    TEMP_SSC_KEY: 'ssc',
    ORIGEN_APP: 'APP',
  },

  // QR
  QR: {
    MIN_PARTS: 6,
    SEPARATOR: '|',
    VALUE_SEPARATOR: ':',
  },

  // Fechas
  DATE: {
    FORMAT_DATE: 'yyyy-MM-dd',
    FORMAT_TIME: 'HH:mm:ss',
  },

  // Firma
  SIGNATURE: {
    SVG_WIDTH: 800,
    SVG_HEIGHT: 300,
    STROKE_COLOR: '#053F5C',
    STROKE_WIDTH: 3,
    EXPORT_STROKE_COLOR: 'black',
    EXPORT_STROKE_WIDTH: 2,
  },

  // Scanner
  SCANNER: {
    DOCUMENT_RESULT_FORMAT: 'JPEG' as const,
    DOCUMENT_SCANNER_MODE: 'FULL' as const,
    DOCUMENT_PAGE_LIMIT: 1,
  },

  // OCI Object Storage
  OCI: {
    NAMESPACE: 'idiliyph1zvh',
    REGION: 'us-ashburn-1',
    BUCKET: 'testing',
    // URL base: https://{namespace}.objectstorage.{region}.oci.customer-oci.com
    // Formato completo: /n/{namespace}/b/{bucket}/o/{object-name}
  },
} as const;

// Tipos derivados de config (para type safety)
export type DocumentType = 'formula' | 'firma';
export type SignatureMethod = 'FIRMA' | 'FOTO';

// Colores del tema - Design Tokens
export const THEME = {
  colors: {
    primary: '#053F5C',
    accent: '#429EBD',
    secondary: '#45a9db',
    light: '#9FE7F5',
    background: '#F8FAFB',
    backgroundGradient: '#E8F4F8',
    white: '#FFFFFF',
    error: '#ef4444',
    success: '#10b981',
    text: {
      primary: '#053F5C',
      secondary: 'rgba(5, 63, 92, 0.6)',
      muted: 'rgba(5, 63, 92, 0.5)',
      disabled: 'rgba(5, 63, 92, 0.4)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
  },
  borderRadius: {
    sm: '8px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '50%',
  },
  shadows: {
    sm: '0 2px 12px rgba(0,0,0,0.04)',
    md: '0 4px 20px rgba(0,0,0,0.06)',
    lg: '0 8px 30px rgba(247, 173, 25, 0.35)',
    button: '0 4px 20px rgba(247, 173, 25, 0.35)',
    card: '0 2px 12px rgba(0,0,0,0.04)',
    menu: '0 10px 40px rgba(0,0,0,0.12)',
  },
  transitions: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
} as const;

// Rutas tipadas
export const ROUTES = {
  LOGIN: '/login',
  STEP_1_QR: '/step-1',
  STEP_2_DOCUMENT: '/step-2',
  STEP_3_SIGNATURE: '/step-3-signature',
  STEP_3_PICTURE: '/step-3-picture',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
