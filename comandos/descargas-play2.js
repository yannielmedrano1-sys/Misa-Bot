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

            // --- 1. OBTENER DATA Y LINKS (SISTEMA DE FALLBACKS COMPLETO) ---
            let v, videoUrl, vistasReales;
            const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
            const ytUrl = search.data.data.url;
            const vidId = search.data.data.videoId;

            v = {
                title: search.data.data.title,
                thumbnail: search.data.data.image,
                duration: search.data.data.duration,
                url: ytUrl,
                quality: '1080p'
            };

            // --- ESCALADA DE CALIDAD Y APIS ---
            try {
                // NIVEL 1: Brayan v2 (1080p)
                const res1 = await axios.get(`https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(ytUrl)}&quality=1080&key=api-gmnch`);
                if (!res1.data.status) throw new Error();
                videoUrl = res1.data.data.dl;
                vistasReales = search.data.data.views;
            } catch {
                try {
                    // NIVEL 2: NexyLight (720p - Alta estabilidad)
                    const res2 = await axios.get(`https://api.nexylight.xyz/dl/ytmp4?id=${vidId}&quality=720&key=nexy-9ccbbb`);
                    if (!res2.data.status) throw new Error();
                    videoUrl = res2.data.download.url;
                    vistasReales = res2.data.data.views;
                    v.quality = '720p';
                } catch {
                    try {
                        // NIVEL 3: Brayan v1 (MP4 directo)
                        const res3 = await axios.get(`https://api.brayanofc.shop/dl/ytmp4?url=${encodeURIComponent(ytUrl)}&key=api-gmnch`);
                        videoUrl = res3.data.result.downloadUrl;
                        vistasReales = search.data.data.views;
                        v.quality = res3.data.result.quality || '480p';
                    } catch {
                        try {
                            // NIVEL 4: API Alternativa (Delirius o Similares)
                            const res4 = await axios.get(`https://deliriussapi-oficial.vercel.app/download/ytmp4?url=${encodeURIComponent(ytUrl)}`);
                            videoUrl = res4.data.data.download.url;
                            vistasReales = res4.data.data.views;
                            v.quality = '720p';
                        } catch {
                            // NIVEL 5: Fallback de emergencia (ID-Based)
                            const res5 = await axios.get(`https://api.zenkey.my.id/api/download/ytmp4?url=${encodeURIComponent(ytUrl)}&apikey=zenkey`);
                            videoUrl = res5.data.result.downloadUrl;
                            vistasReales = search.data.data.views;
                        }
                    }
                }
            }

            // --- 2. ANIMACIÓN ORIGINAL (35ms / 5%) ---
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando Video:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            for (let i = 1; i <= 100; i += 5) { 
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 35)); 
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando Video:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
                
                if (i + 5 > 100 && valor !== 100) {
                    await new Promise(resolve => setTimeout(resolve, 35));
                    await conn.sendMessage(chat, { text: `📥 *Descargando Video:* \`100%\` ${getBar(100)}`, edit: key });
                }
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
   › ✦ \`Calidad\`: *${v.quality}*
   › ⏱ \`Duración\`: *${v.duration}*
   › ꕤ \`Vistas\`: *${formatViews(vistasReales)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            // ARTILLERÍA FINAL
            await conn.sendMessage(chat, { 
                text: textoPlay2,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪  𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.thumbnail, 
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(chat, { 
                video: { url: videoUrl }, 
                caption: `🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m });

            await conn.sendMessage(chat, { text: '🖤 *Video enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese video, todas las APIs están caídas.' }, { quoted: m });
        }
    }
};

export default play2Command;
