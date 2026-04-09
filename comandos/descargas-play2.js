/* * Código ultra-optimizado y robusto para Misa-Bot
 * Soluciona problemas de APIs caídas y rate limiting
 * Autor: OpenClaw Assistant (basado en Yanniel)
 * FIX: Corregido error de reacciones para Baileys por Gemini
 */
import axios from 'axios';
import yts from 'yt-search';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const play2Command = {
    name: 'play2',
    alias: ['video', 'ytmp4', 'vid'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid;
        const prefijo = usedPrefix || '';

        if (!text) {
            return conn.sendMessage(chat, { 
                text: `🖤 *¿Qué video quieres descargar?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` 
            }, { quoted: m });
        }

        try {
            // Reacción corregida (Buscando)
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } });
            
            let search;
            try {
                search = await yts(text);
            } catch (searchError) {
                console.error('YT Search Error:', searchError.message);
                return conn.sendMessage(chat, { 
                    text: '> ✐ Error al buscar en YouTube. Intenta de nuevo.' 
                }, { quoted: m });
            }
            
            const v = search.videos[0];
            if (!v) {
                return conn.sendMessage(chat, { 
                    text: '> ✐ No encontré el video. Intenta con otro título.' 
                }, { quoted: m });
            }

            const url = v.url;
            const videoId = v.videoId;
            
            // Verificar duración
            const durationParts = v.timestamp.split(':').map(Number);
            const totalSeconds = durationParts.length === 3 
                ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
                : durationParts[0] * 60 + durationParts[1];
            
            if (totalSeconds > 1800) {
                return conn.sendMessage(chat, { 
                    text: '> ⚠️ El video es muy largo (>30 min). Prueba con uno más corto.' 
                }, { quoted: m });
            }

            // Reacción corregida (Procesando)
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            let videoUrl = null;
            let usedApi = '';
            let errors = [];

            const apiSources = [
                {
                    name: 'nexylight',
                    url: `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}&quality=1080&key=nexy-9ccbbb`,
                    extractor: (d) => d?.download?.url || d?.url,
                    timeout: 15000
                },
                {
                    name: 'brayan-youtubev2',
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`,
                    extractor: (d) => {
                        const formats = d?.results?.formats;
                        if (!formats) return null;
                        const quality = formats.find(f => f.quality === '1080p') 
                            || formats.find(f => f.quality === '720p')
                            || formats[0];
                        return quality?.url;
                    },
                    timeout: 20000
                },
                {
                    name: 'cobalt',
                    url: `https://api.cobalt.tools/api/download`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { url: url, vQuality: '1080', downloadMode: 'auto' },
                    extractor: (d) => d?.url,
                    timeout: 20000
                }
            ];

            for (const source of apiSources) {
                try {
                    let res;
                    if (source.method === 'POST') {
                        res = await axios.post(source.url, source.data, {
                            timeout: source.timeout,
                            headers: source.headers || {}
                        });
                    } else {
                        res = await axios.get(source.url, { 
                            timeout: source.timeout,
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });
                    }
                    
                    const link = source.extractor(res.data);
                    if (link && typeof link === 'string' && link.startsWith('http')) {
                        videoUrl = link;
                        usedApi = source.name;
                        break;
                    }
                } catch (e) {
                    errors.push(`${source.name}: ${e.message}`);
                    continue;
                }
            }

            // Fallback yt-dlp
            if (!videoUrl) {
                try {
                    const tempFile = path.join('/tmp', `misa_${Date.now()}.mp4`);
                    await execAsync(`yt-dlp -f "best[filesize<50M]" -o "${tempFile}" "${url}" --no-warnings`, { timeout: 60000 });
                    if (fs.existsSync(tempFile)) {
                        videoUrl = tempFile;
                        usedApi = 'yt-dlp-local';
                    }
                } catch (ytError) {
                    errors.push(`yt-dlp: ${ytError.message}`);
                }
            }

            if (!videoUrl) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } });
                return conn.sendMessage(chat, { 
                    text: `> ✐ No se pudo obtener el video.\n> 🔧 Servidores saturados.\n> 💡 Intenta con otro video o más tarde.` 
                }, { quoted: m });
            }

            const formatViews = (n) => {
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
                return n.toLocaleString();
            };

            const detectedQuality = videoUrl.includes('1080') ? '1080p' : 'HD';

            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${detectedQuality}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › 🔧 \`Fuente\`: *${usedApi}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: `𝓜𝓲𝓼𝓪 𝙃𝘿 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤`,
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // Envío de Video
            if (videoUrl.startsWith('/tmp/')) {
                const videoBuffer = fs.readFileSync(videoUrl);
                await conn.sendMessage(chat, { 
                    video: videoBuffer,
                    caption: `> 🖤 *${v.title}*`,
                    mimetype: 'video/mp4',
                    fileName: `${v.title}.mp4`
                }, { quoted: m });
                fs.unlinkSync(videoUrl);
            } else {
                await conn.sendMessage(chat, { 
                    video: { url: videoUrl },
                    caption: `> 🖤 *${v.title}*`,
                    mimetype: 'video/mp4',
                    fileName: `${v.title}.mp4`
                }, { quoted: m });
            }
            
            return await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('[Play2] Error:', err);
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } });
            return conn.sendMessage(chat, { 
                text: `> ✐ Error inesperado:\n> ${err.message.substring(0, 100)}` 
            }, { quoted: m });
        }
    }
};

export default play2Command;
