export const interestsArray = (value: string) =>
  value
    .split(",")
    .map((interest) => interest.trim())
    .filter(Boolean);
