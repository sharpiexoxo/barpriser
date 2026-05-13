export async function register() {
  // Runs once when the Next.js server starts (not during build)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDb } = await import("./lib/db");
    try {
      await initDb();
      console.log("Database initialized");
    } catch (e) {
      console.error("Database init failed:", e);
    }
  }
}
