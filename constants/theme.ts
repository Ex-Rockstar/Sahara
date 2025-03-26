export const colors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  },
  accent: {
    green: '#4CAF50',
    blue: '#2196F3',
    orange: '#FF9800',
    purple: '#9C27B0',
    red: '#FF3B30',
  },
  border: '#EEEEEE',
  shadow: {
    color: '#000000',
    opacity: 0.1,
    offset: { width: 0, height: 2 },
    radius: 4,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 9999,
};

export const commonStyles = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 3,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.round,
      alignItems: 'center',
    },
    secondary: {
      backgroundColor: colors.secondary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.round,
      alignItems: 'center',
    },
  },
  buttonText: {
    primary: {
      color: colors.surface,
      fontSize: typography.body.fontSize,
      fontWeight: '600',
    },
    secondary: {
      color: colors.surface,
      fontSize: typography.body.fontSize,
      fontWeight: '600',
    },
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
  },
}; 