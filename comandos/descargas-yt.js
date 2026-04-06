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
    noPrefix: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`🖤 *¿Qué quieres escuchar?*\n\nEjemplo: \`${usedPrefix + command} Media Hora\``);

        try {
            // 1. Reacción y Animación de Carga
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            const { key } = await conn.sendMessage(m.chat, { text: '📥 *Descargando:* \`0%\` ▒▒▒▒▒▒▒▒▒▒' });

            const porcentajes = [
                { p: '40%', b: '████▒▒▒▒▒▒' },
                { p: '80%', b: '████████▒▒' },
                { p: '100%', b: '██████████' }
            ];

            for (const step of porcentajes) {
                await new Promise(resolve => setTimeout(resolve, 80));
                await conn.sendMessage(m.chat, { text: `📥 *Descargando:* \`${step.p}\` ${step.b}`, edit: key });
            }

            let v, audioUrl;

            // --- LÓGICA DE APIS (FALLBACK SYSTEM) ---
            try {
                // INTENTO 1: Brayan YouTubePlay
                const res1 = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                if (!res1.data.status) throw new Error();
                v = res1.data.data;
                audioUrl = v.dl;
            } catch {
                try {
                    // INTENTO 2: Nexylight YTmp3 (Usando búsqueda previa o ID)
                    // Nota: Nexy requiere ID, así que primero buscamos con una herramienta de búsqueda si es texto
                    const search = await axios.get(`https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`);
                    const id = search.data.data.videoId;
                    
                    const resNexy = await axios.get(`https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`);
                    if (!resNexy.data.status) throw new Error();
                    
                    v = resNexy.data.data;
                    audioUrl = resNexy.data.download.url;
                } catch {
                    // INTENTO 3: Brayan V2
                    const res2 = await axios.get(`https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(text)}&key=api-gmnch`);
                    if (!res2.data.success) throw new Error('All APIs failed');
                    
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

            // Formateo de vistas a estilo simple (21.1M)
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

            // 2. Éxito: Reacción y Envío de Info
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await conn.sendMessage(m.chat, { 
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

            // 3. Envío del Audio Real
            await conn.sendMessage(m.chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4', 
                fileName: `${v.title}.mp3` 
            }, { quoted: m });

            // 4. Cierre de animación
            await conn.sendMessage(m.chat, { text: '🖤 *Audio enviado con éxito :)*', edit: key });

        } catch (err) {
            console.error(err);
            m.reply('> ✐ no se pudo obtener ese audio, intenta de nuevo.');
        }
    }
};

export default playCommand;
