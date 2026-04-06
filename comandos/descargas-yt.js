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
            // 1. Reacción inicial
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });
            
            // 2. Animación ÉPICA con muchos edits
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            // Bucle ultra rápido para generar el efecto de "muchos edits"
            for (let i = 1; i <= 100; i += 3) { 
                // Aseguramos que siempre pase por el 100
                let valor = i > 100 ? 100 : i;
                await new Promise(resolve => setTimeout(resolve, 30)); // 30ms para que vuele
                await conn.sendMessage(chat, { 
                    text: `📥 *Descargando:* \`${valor}%\` ${getBar(valor)}`, 
                    edit: key 
                });
                if (valor === 100) break;
                if (i + 3 > 100) i = 97; // Forzamos el último paso al 100
            }

            // --- LÓGICA DE APIS (Solo después del 100%) ---
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

            // 3. Reacción de verificado al terminar
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            // 4. Enviar Info y Audio
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

            // 5. Finalizar la edición del mensaje de descarga
            await conn.sendMessage(chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese audio, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
