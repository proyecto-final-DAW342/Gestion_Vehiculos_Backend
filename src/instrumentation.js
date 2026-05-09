import nodeCron from "node-cron";

export async function register() {
  // Esto solo se ejecuta en el servidor
  if (process.env.NEXT_RUNTIME === "nodejs") {
    nodeCron.schedule("* * * * * *", () => {
      console.log("✅ Cron funcionando cada segundo en el servidor");
    });
  }
}
