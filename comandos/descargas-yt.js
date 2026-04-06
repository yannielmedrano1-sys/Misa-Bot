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
    noPrefix: true, // <--- Habilitado para que funcione sin prefijo
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, usedPrefix, command }) => {
        // Definimos el chat de forma segura para evitar el error de jidDecode
        const chat = m.key.remoteJid;

        if (!text) {
            return conn.sendMessage(chat, { text: `🖤 *¿Qué quieres escuchar?*\n\nEjemplo: \`${usedPrefix + command} Media Hora\`` }, { quoted: m });
        }

        try {
            // 1. Reacción y Animación
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });
            
            const { key } = await conn.sendMessage(chat, { text: '📥 *Descargando:* `0%` ▒▒▒▒▒▒▒▒▒▒' });

            const porcentajes = [
                { p: '40%', b: '████▒▒▒▒▒▒' },
                { p: '80%', b: '████████▒▒' },
                { p: '100%', b: '██████████' }
            ];

            for (const step of porcentajes) {
                await new Promise(resolve => setTimeout(resolve, 80));
                await conn.sendMessage(chat, { text: `📥 *Descargando:* \`${step.p}\` ${step.b}`, edit: key });
            }

            let v, audioUrl;

            // --- LÓGICA DE APIS ---
            try {
                const res1 = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                if (!res1.data.status) throw new Error();
                v = res1.data.data;
                audioUrl = v.dl;
            } catch {
                try {
                    const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                    const id = search.data.data.videoId;
                    const resNexy = await axios.get(`https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`);
                    v = resNexy.data.data;
                    audioUrl = resNexy.data.download.url;
                } catch {
                    const res2 = await axios.get(`https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(text)}&key=api-gmnch`);
                    const info = res2.data.results.info;
                    v = {
                        title: info.title,
                        image: info.thumbnail,
                        duration: info.duration,
                        author: { name: info.channel.name.replace('Channel: ', '') },
                        url: text.includes('http') ? text : 'https://youtu.be/' + info.id,
                        views: info.channel.subscribers 
                    };
                    audioUrl = res2.data.results.formats.find(f => f.itag === "140")?.url;
                }
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

> Powered by 𝓜𝓲𝓼α ♡`.trim();

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼α 𝘿𝙤𝙬𝙣𝙡𝙤ᴀ𝙙𝙚𝙧 🖤',
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
            // Reemplazamos m.reply por conn.sendMessage para evitar el error de "not a function"
            await conn.sendMessage(chat, { text: '> ✐ no se pudo obtener ese audio, intenta de nuevo.' }, { quoted: m });
        }
    }
};

export default playCommand;
