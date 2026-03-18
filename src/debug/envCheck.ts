export function verifyEnvironment() {
  console.log("=== WAR ROOM ENVIRONMENT CHECK ===");

  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY is missing");
  } else {
    console.log("✅ GOOGLE_API_KEY detected");
  }
}
