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

            // --- 1. OBTENER DATA Y LINKS (SISTEMA DE FALLBACK ANTES DE LA ANIMACIÓN) ---
            let v, audioUrl;
            try {
                const res1 = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                v = res1.data.data;
                audioUrl = v.dl;
            } catch {
                const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                const id = search.data.data.videoId;
                const resNexy = await axios.get(`https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`);
                v = resNexy.data.data;
                audioUrl = resNexy.data.download.url;
            }

            // --- 2. ANIMACIÓN DE RÁFAGA (Sincronizada para impacto inmediato) ---
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            for (let i = 1; i <= 100; i += 10) { 
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 25)); 
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
                
                if (i + 10 > 100 && valor !== 100) {
                    await new Promise(resolve => setTimeout(resolve, 25));
                    await conn.sendMessage(chat, { text: `📥 *Descargando:* \`100%\` ${getBar(100)}`, edit: key });
                }
            }

            // --- 3. DISPARO INSTANTÁNEO AL 100% ---
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            // Función Maestra para Vistas (Detecta Billones, Millones y Miles)
            const formatViews = (views) => {
                if (!views) return "0";
                let str = views.toString().toLowerCase();
                // Extraemos números y puntos para no perder decimales como "1.2"
                let n = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;

                if (str.includes('b') || str.includes('bill')) {
                    return (n >= 1000) ? (n / 1).toFixed(1) + 'B' : n.toFixed(1) + 'B';
                }
                if (str.includes('m') || str.includes('mill')) {
                    return n.toFixed(1) + 'M';
                }
                if (str.includes('k') || str.includes('mil')) {
                    return n.toFixed(1) + 'K';
                }
                
                // Si el número viene puro y es gigante
                if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                
                return n.toLocaleString(); 
            };

            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title || "?"}
   › ✿ \`Canal\`: *${v.author?.name || v.channel || "YouTube"}*
   › ✦ \`Duración\`: *${v.duration || "??:??"}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼α ♡`.trim();

            // Envío de Info con AdReply
            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼α 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙er 🖤',
                        thumbnailUrl: v.image || v.thumbnail, 
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

            // Envío del archivo de Audio
            await conn.sendMessage(chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4', 
                fileName: `${v.title}.mp3` 
            }, { quoted: m });

            // Finalizar mensaje de carga
            await conn.sendMessage(chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese audio, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
