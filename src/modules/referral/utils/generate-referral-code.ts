export function generateReferralCode(): string {
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  );
  const digits = Array.from({ length: 2 }, () =>
    Math.floor(Math.random() * 10).toString()
  );
  const chars = [...letters, ...digits];

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
