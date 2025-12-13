// Shared style constants for glassmorphic UI elements (DRY principle)

export const GLASSMORPHIC_STYLES = {
  // Tab container (top part of frame)
  tabContainer: {
    height: "auto",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    background: "rgba(30, 40, 60, 0.45)",
    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "none",
    fontSize: "0.95rem",
  } as const,

  // Main content panel
  contentPanel: {
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
    borderTop: "none",
    background: "rgba(30, 40, 60, 0.35)",
    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  } as const,

  // Input field
  input: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  } as const,

  // Card/stat box
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.12)",
  } as const,
} as const;

// Border styles for different roles/themes
export const BORDER_STYLES = {
  admin: {
    border: "2px solid rgba(0,255,247,0.18)",
  } as const,
  
  manager: {
    border: "2px solid rgba(168, 85, 247, 0.3)",
  } as const,
  
  kellner: {
    border: "2px solid rgba(251, 191, 36, 0.3)",
  } as const,
} as const;

// Gradient backgrounds for role-specific glows
export const GRADIENT_GLOWS = {
  admin: "bg-gradient-radial from-cyan-400 via-fuchsia-500 to-transparent opacity-60 blur-[32px]",
  manager: "bg-gradient-radial from-purple-400 via-pink-500 to-transparent opacity-60 blur-[32px]",
  kellner: "bg-gradient-radial from-yellow-400 via-orange-500 to-transparent opacity-60 blur-[32px]",
} as const;

// Combine styles based on role
export function getGlassPanelStyles(role: 'admin' | 'manager' | 'kellner' = 'admin') {
  return {
    tabContainer: {
      ...GLASSMORPHIC_STYLES.tabContainer,
      ...BORDER_STYLES[role],
    },
    contentPanel: {
      ...GLASSMORPHIC_STYLES.contentPanel,
      ...BORDER_STYLES[role],
    },
  };
}
