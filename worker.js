export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const update = await request.json();
        
        // Wenn eine Textnachricht ankommt
        if (update.message && update.message.text) {
          const text = update.message.text;
          
          if (text.includes("/stats")) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: env.ALERT_CHAT_ID,
                text: "✅ Bot is responding! Stats will be here soon.",
                parse_mode: "Markdown"
              }),
            });
          }
        }
        
        return new Response("OK");
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }
    
    return new Response("Worker Active");
  }
};
