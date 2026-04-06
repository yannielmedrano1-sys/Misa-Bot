/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import axios from 'axios';
import { config } from '../config.js';

const playCommand = {
    name: 'play',
    alias: ['audio', 'music', 'ytmp3'],
    category: 'downloader',
    isOwner: false,
    noPrefix: true, 
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid;
        const prefijo = usedPrefix ? usedPrefix : '';

        if (!text) {
            return conn.sendMessage(chat, { text: `🖤 *¿Qué quieres escuchar?*\n\nEjemplo: \`${prefijo + command} Media Hora\`` }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            // --- 1. DATA PRIMERO (SISTEMA ULTRA-FAST) ---
            let v, audioUrl, vistasReales;
            const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
            v = search.data.data;
            const id = v.videoId;

            try {
                const resNexy = await axios.get(`https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`);
                if (resNexy.data.status) {
                    audioUrl = resNexy.data.download.url;
                    vistasReales = resNexy.data.data.views;
                } else throw new Error();
            } catch {
                audioUrl = v.dl;
                vistasReales = v.views;
            }

            // --- 2. ANIMACIÓN RÁFAGA (Ultra rápida: 15ms) ---
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            for (let i = 1; i <= 100; i += 20) { // Saltos de 20 en 20
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 15)); 
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando:* \`${valor}%\` ██${'█'.repeat(Math.floor(valor/10))}`, 
                    edit: key 
                });
            }
            await conn.sendMessage(chat, { text: `📥 *Descargando:* \`100%\` ██████████`, edit: key });

            // --- 3. FORMATEO Y DISPARO SIMULTÁNEO ---
            const formatViews = (views) => {
                if (!views) return "0";
                let str = views.toString().toLowerCase();
                if (/[kmb]/.test(str)) return str.replace(/[^0-9.kmb]/g, '').toUpperCase();
                let n = parseInt(str.replace(/\D/g, '')) || 0;
                if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return n.toString();
            };

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title || "?"}
   › ✿ \`Canal\`: *${v.author?.name || "YouTube"}*
   › ✦ \`Duración\`: *${v.duration || "??:??"}*
   › ꕤ \`Vistas\`: *${formatViews(vistasReales)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼α ♡`.trim();

            // Usamos Promise.all para que el texto y el audio salgan "PUM" al mismo tiempo
            await Promise.all([
                conn.sendMessage(chat, { 
                    text: textoPlay,
                    contextInfo: {
                        externalAdReply: {
                            title: v.title,
                            body: '𝓜𝓲𝓼α 𝘿𝙤𝙬𝙣𝙡𝙤α𝙙er 🖤',
                            thumbnailUrl: v.image || v.thumbnail, 
                            sourceUrl: v.url,
                            mediaType: 1,
                            renderLargerThumbnail: true, 
                            showAdAttribution: false 
                        }
                    }
                }, { quoted: m }),
                conn.sendMessage(chat, { 
                    audio: { url: audioUrl }, 
                    mimetype: 'audio/mp4', 
                    fileName: `${v.title}.mp3` 
                }, { quoted: m })
            ]);

            await conn.sendMessage(chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ error al procesar, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
