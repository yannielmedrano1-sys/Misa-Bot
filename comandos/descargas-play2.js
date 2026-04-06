/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import axios from 'axios';
import { config } from '../config.js';

const play2Command = {
    name: 'play2',
    alias: ['video', 'ytmp4', 'vid'],
    category: 'downloader',
    isOwner: false,
    noPrefix: true, 
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid;
        const prefijo = usedPrefix ? usedPrefix : '';

        if (!text) {
            return conn.sendMessage(chat, { text: `🖤 *¿Qué video quieres descargar?*\n\nEjemplo: \`${prefijo + command} Media Hora Yan Block\`` }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            // --- 1. DATA Y LINKS (3 APIS REALES - OPTIMIZADO) ---
            const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
            const v = search.data.data;
            const ytUrl = v.url;
            const vidId = v.videoId;

            let videoUrl, vistasReales = v.views, calidad = '720p';

            // Ejecución directa de las 3 APIs fijas
            try {
                // API 1: Brayan v2 (1080p/720p)
                const res1 = await axios.get(`https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(ytUrl)}&quality=720&key=api-gmnch`);
                videoUrl = res1.data.data.dl;
            } catch {
                try {
                    // API 2: NexyLight (La más estable por ID)
                    const res2 = await axios.get(`https://api.nexylight.xyz/dl/ytmp4?id=${vidId}&quality=720&key=nexy-9ccbbb`);
                    videoUrl = res2.data.download.url;
                    vistasReales = res2.data.data.views;
                } catch {
                    // API 3: Brayan v1 (Fallback final)
                    const res3 = await axios.get(`https://api.brayanofc.shop/dl/ytmp4?url=${encodeURIComponent(ytUrl)}&key=api-gmnch`);
                    videoUrl = res3.data.result.downloadUrl;
                    calidad = '360p/480p';
                }
            }

            // --- 2. ANIMACIÓN REFINADA (Más rápida: 25ms) ---
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando Video:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            for (let i = 1; i <= 100; i += 5) { 
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 25)); // Bajamos de 35ms a 25ms
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando Video:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
            }

            // --- 3. FORMATEO DE VISTAS (EL FIX DE 1B) ---
            const formatViews = (views) => {
                if (!views) return "0";
                let str = views.toString().toLowerCase();
                if (/[kmb]/.test(str)) return str.replace(/[^0-9.kmb]/g, '').toUpperCase();
                let n = parseInt(str.replace(/\D/g, '')) || 0;
                if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return n.toLocaleString(); 
            };

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            const textoPlay2 = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${calidad}*
   › ⏱ \`Duración\`: *${v.duration}*
   › ꕤ \`Vistas\`: *${formatViews(vistasReales)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            // Envío en paralelo para ganar velocidad
            await Promise.all([
                conn.sendMessage(chat, { 
                    text: textoPlay2,
                    contextInfo: {
                        externalAdReply: {
                            title: v.title,
                            body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙er 🖤',
                            thumbnailUrl: v.image, 
                            sourceUrl: v.url,
                            mediaType: 1,
                            renderLargerThumbnail: true, 
                            showAdAttribution: false 
                        }
                    }
                }, { quoted: m }),
                conn.sendMessage(chat, { 
                    video: { url: videoUrl }, 
                    caption: `🖤 *${v.title}*`,
                    mimetype: 'video/mp4'
                }, { quoted: m })
            ]);

            await conn.sendMessage(chat, { text: '🖤 *Video enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ error crítico, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default play2Command;
