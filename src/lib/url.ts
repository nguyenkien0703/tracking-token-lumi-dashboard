export function buildAppUrl(path: string): URL {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  return new URL(path, base);
}
