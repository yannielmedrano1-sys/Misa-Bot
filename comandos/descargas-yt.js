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
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            // 1. Iniciamos la búsqueda en paralelo para que el link esté listo al llegar a 100
            let v, audioUrl;
            const apiPromise = (async () => {
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
            })();

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            // 2. Animación Épica (Controlada para que termine en 100)
            for (let i = 1; i <= 100; i += 4) { 
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 35)); 
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
                
                // Forzamos el paso final al 100 antes de seguir
                if (i + 4 > 100 && valor !== 100) {
                    await new Promise(resolve => setTimeout(resolve, 35));
                    await conn.sendMessage(chat, { text: `📥 *Descargando:* \`100%\` ${getBar(100)}`, edit: key });
                }
            }

            // 3. JUSTO AL LLEGAR AL 100% -> DISPARAMOS TODO
            await apiPromise; // Esperamos el resultado de la API si no ha llegado
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            const formatViews = (views) => {
                let n = parseInt(views?.toString().replace(/\D/g, '')) || 0;
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return n.toString();
            };

            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title || "?"}
   › ✿ \`Canal\`: *${v.author?.name || "YouTube"}*
   › ✦ \`Duración\`: *${v.duration || "??:??"}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            // Envíos simultáneos tras el 100%
            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image || v.thumbnail, 
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4', 
                fileName: `${v.title}.mp3` 
            }, { quoted: m });

            // 4. Edición final del mensaje de carga
            await conn.sendMessage(chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese audio, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
