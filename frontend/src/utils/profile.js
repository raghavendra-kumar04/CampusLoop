/**
 * Helper to verify whether a student profile is complete.
 * Buyers and sellers must complete Major, Graduation Year, and Bio before buying or selling.
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  const hasMajor = Boolean(user.major && String(user.major).trim().length > 0);
  const hasGradYear = Boolean(user.graduationYear && Number(user.graduationYear) > 0);
  const hasBio = Boolean(user.bio && String(user.bio).trim().length > 0);
  return hasMajor && hasGradYear && hasBio;
};
