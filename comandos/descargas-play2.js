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
            return conn.sendMessage(chat, { text: `🖤 *¿Qué video quieres descargar?*\n\nEjemplo: \`${prefijo + command} Al Borde Milo J\`` }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando Video:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            // 1. Búsqueda y descarga en paralelo (Prioridad 1080p)
            let v, videoUrl;
            const apiPromise = (async () => {
                try {
                    // Primero obtenemos metadata básica y URL de YouTube
                    const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                    const ytUrl = search.data.data.url;
                    const vidId = search.data.data.videoId;

                    try {
                        // PRIORIDAD 1: Brayan v2 (1080p)
                        const res1 = await axios.get(`https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(ytUrl)}&quality=1080&key=api-gmnch`);
                        if (!res1.data.status) throw new Error();
                        
                        v = {
                            title: search.data.data.title,
                            thumbnail: search.data.data.image,
                            duration: search.data.data.duration,
                            views: search.data.data.views,
                            url: ytUrl,
                            quality: '1080p'
                        };
                        videoUrl = res1.data.data.dl;
                    } catch {
                        // PRIORIDAD 2: NexyLight (720p) como respaldo
                        const res2 = await axios.get(`https://api.nexylight.xyz/dl/ytmp4?id=${vidId}&quality=720&key=nexy-9ccbbb`);
                        if (!res2.data.status) throw new Error();
                        
                        const d = res2.data.data;
                        v = {
                            title: d.title,
                            thumbnail: d.thumbnail,
                            duration: d.duration,
                            views: d.views,
                            url: d.url,
                            quality: '720p'
                        };
                        videoUrl = res2.data.download.url;
                    }
                } catch (e) {
                    throw new Error('Error en las APIs de Video');
                }
            })();

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            // 2. Animación Épica (Rafaga de edits hasta el 100%)
            for (let i = 1; i <= 100; i += 5) { 
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 30)); 
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando Video:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
                
                if (i + 5 > 100 && valor !== 100) {
                    await new Promise(resolve => setTimeout(resolve, 30));
                    await conn.sendMessage(chat, { text: `📥 *Descargando Video:* \`100%\` ${getBar(100)}`, edit: key });
                }
            }

            // 3. BOMBAZO AL 100%
            await apiPromise; 
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            const formatViews = (views) => {
                let n = parseInt(views?.toString().replace(/\D/g, '')) || 0;
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return n.toString();
            };

            const textoPlay2 = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${v.quality} (MAX)*
   › ⏱ \`Duración\`: *${v.duration}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            // Enviar Info
            await conn.sendMessage(chat, { 
                text: textoPlay2,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝙑𝙞𝙙𝙚𝙤 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙er 🖤',
                        thumbnailUrl: v.thumbnail, 
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

            // Enviar Video
            await conn.sendMessage(chat, { 
                video: { url: videoUrl }, 
                caption: `🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m });

            await conn.sendMessage(chat, { text: '🖤 *Video enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese video, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default play2Command;
