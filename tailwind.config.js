/** Design system "Artisanal Teranga Luxe" (issu de Stitch) */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.html', './public/assets/js/**/*.js', './public/admin.html'],
  theme: {
    extend: {
      colors: {
        'on-surface-variant': '#d4c4b7', 'surface-container': '#281d18', 'secondary-container': '#5b4136',
        'primary-fixed-dim': '#f0bd8b', 'tertiary-container': '#fd904b', 'surface-tint': '#f0bd8b',
        'surface-variant': '#3f322c', 'surface-dim': '#1b110c', 'surface-container-highest': '#3f322c',
        'on-secondary': '#422b21', 'inverse-surface': '#f4ded5', secondary: '#e4bfb0',
        error: '#ffb4ab', 'surface-container-lowest': '#160c07', 'on-primary-fixed': '#2c1600',
        'on-tertiary-container': '#6c2e00', outline: '#9c8e82', 'on-secondary-container': '#d1ae9f',
        'surface-container-high': '#332722', 'on-background': '#f4ded5', tertiary: '#ffb88f',
        background: '#1b110c', surface: '#1b110c', 'on-tertiary': '#532200', 'primary-fixed': '#ffdcbd',
        'on-primary': '#482904', 'inverse-primary': '#7d562d', 'surface-container-low': '#241914',
        'outline-variant': '#50453b', 'secondary-fixed-dim': '#e4bfb0', 'secondary-fixed': '#ffdbcd',
        'on-surface': '#f4ded5', 'surface-bright': '#443630', 'primary-container': '#d4a373',
        'on-primary-container': '#5b3912', primary: '#f2be8c',
      },
      borderRadius: { DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', '2xl': '0.75rem', full: '9999px' },
      spacing: {
        'space-sm': '0.75rem', 'space-md': '1.25rem', 'space-lg': '2rem', 'margin-sm': '1.25rem',
        'space-xs': '0.375rem', margin: '2.5rem', gutter: '1.5rem', 'gutter-sm': '1rem', 'space-xl': '3.5rem',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['56px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['38px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-sm': ['22px', { lineHeight: '30px', fontWeight: '500' }],
        'title-md': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
