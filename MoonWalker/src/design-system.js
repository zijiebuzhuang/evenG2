// ============================================================================
// Design System - Colors
// ============================================================================

export const COLORS = {
  // Text colors
  textHighlight: '#FFFFFF',       // White text for highlights
  textFirst: '#232323',           // Dark and Accent text
  textSecond: '#7B7B7B',          // Gray text
  textSuccess: '#4BB956',         // Success text
  textError: '#F44336',           // Error text

  // Background colors
  backgroundHighlight: '#232323', // Dark text background
  backgroundFirst: '#FFFFFF',     // White background
  backgroundSecond: '#F6F6F6',    // White gray background
  backgroundThird: '#EEEEEE',     // Main gray background
  backgroundFourth: '#E4E4E4',    // Dark gray background
  backgroundAccent: '#FEF991',    // Yellow background
  backgroundInput: 'rgba(35, 35, 35, 0.08)', // Input background (8% opacity of #232323)
} as const

// ============================================================================
// Design System - Typography
// ============================================================================

export const FONT_FAMILY = '"FK Grotesk Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

// Typography Scale
export const TYPOGRAPHY = {
  // Very large title
  veryLargeTitle: {
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.72,
    fontWeight: 400,
  },
  // Large title
  largeTitle: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.6,
    fontWeight: 400,
  },
  // Medium title
  mediumTitle: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.17,
    fontWeight: 400,
  },
  // Medium body
  mediumBody: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.17,
    fontWeight: 300,
  },
  // Normal title
  normalTitle: {
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.15,
    fontWeight: 400,
  },
  // Normal body
  normalBody: {
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.15,
    fontWeight: 300,
  },
  // Normal subtitle
  normalSubtitle: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.13,
    fontWeight: 400,
  },
  // Normal detail
  normalDetail: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: -0.11,
    fontWeight: 400,
  },
} as const

// ============================================================================
// Helper function to generate CSS from typography object
// ============================================================================

export function typographyToCSS(typography) {
  return `
    font-size: ${typography.fontSize}px;
    line-height: ${typography.lineHeight}px;
    letter-spacing: ${typography.letterSpacing}px;
    font-weight: ${typography.fontWeight};
  `.trim()
}
