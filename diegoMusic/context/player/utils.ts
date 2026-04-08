export const parseDuration = (durationStr: string): number => {
  if (!durationStr || durationStr === "00:00") return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 1) return parts[0] * 1000;
  else if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  else if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

  return 0;
};
