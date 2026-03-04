export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSchema } = await import("@/lib/db");
    const { syncIfStale } = await import("@/lib/sync");

    // Init DB schema on startup
    await initSchema();

    // Initial sync
    syncIfStale(false);

    // Auto-sync every 5 minutes
    setInterval(() => {
      syncIfStale(false);
    }, 5 * 60 * 1000);
  }
}
