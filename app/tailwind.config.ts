const theme = {
  colors: {
    primary: '#ff9b37',
    'primary-strong': '#e77300',
    accent: '#4edbfb',
    surface: '#fffdfb',
    page: '#f3f3f3',
    border: '#f1e7dc',
    text: '#494949',
    'text-heading': '#1f1f1f',
  },
  fontSize: {
    xs: ['12px', { lineHeight: '1.4' }],
    sm: ['13px', { lineHeight: '1.45' }],
    base: ['16px', { lineHeight: '1.55' }],
    lg: ['18px', { lineHeight: '1.45' }],
    xl: ['22px', { lineHeight: '1.25' }],
    '2xl': ['30px', { lineHeight: '1.18' }],
    '3xl': ['34px', { lineHeight: '1.08' }],
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
  },
  borderRadius: {
    sm: '14px',
    md: '18px',
    lg: '28px',
    xl: '34px',
    full: '999px',
  },
  boxShadow: {
    soft: '0 14px 36px rgba(73, 73, 73, 0.08)',
    card: '0 18px 44px rgba(73, 73, 73, 0.10)',
    floating: '0 24px 70px rgba(73, 73, 73, 0.18)',
  },
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: theme,
  },
}
