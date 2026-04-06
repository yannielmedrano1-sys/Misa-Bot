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
            
            // Animación fluida de 1 a 100
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `1%` ▒▒▒▒▒▒▒▒▒▒' });

            const getBar = (p) => {
                const filled = Math.floor(p / 10);
                return '█'.repeat(filled) + '▒'.repeat(10 - filled);
            };

            for (let i = 1; i <= 100; i++) {
                // Saltos de 10 en 10 para que sea rápido pero se vea el 100%
                if (i % 10 === 0 || i === 1 || i === 100) {
                    await new Promise(resolve => setTimeout(resolve, 40)); 
                    await conn.sendMessage(chat, { 
                        text: `📥 *Descargando:* \`${i}%\` ${getBar(i)}`, 
                        edit: key 
                    });
                }
            }

            // --- LÓGICA DE APIS ---
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

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣效𝙤𝙖𝙙𝙚𝙧 🖤',
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

            await conn.sendMessage(chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese audio, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
