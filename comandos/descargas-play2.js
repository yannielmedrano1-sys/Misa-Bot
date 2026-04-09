/* * Código optimizado para Misa-Bot
 * Incluye Fallback de seguridad y APIs de alta disponibilidad
 * Autor: Yanniel & Gemini
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
            // Reacción segura
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } });
            
            let search = await yts(text);
            const v = search.videos[0];
            
            if (!v) {
                return conn.sendMessage(chat, { text: '> ✐ No encontré el video.' }, { quoted: m });
            }

            const url = v.url;
            const videoId = v.videoId;
            
            // Límite de 30 min para evitar ban del número
            const durationParts = v.timestamp.split(':').map(Number);
            const totalSeconds = durationParts.length === 3 
                ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
                : durationParts[0] * 60 + durationParts[1];
            
            if (totalSeconds > 1800) {
                return conn.sendMessage(chat, { text: '> ⚠️ Video demasiado largo (>30 min).' }, { quoted: m });
            }

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            let videoUrl = null;
            let usedApi = '';

            // 🚀 APIs ORDENADAS POR EFECTIVIDAD PARA MISA-BOT
            const apiSources = [
                {
                    name: 'Brayan-API',
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`,
                    extractor: (d) => d?.results?.formats?.find(f => f.quality === '720p')?.url || d?.results?.formats[0]?.url
                },
                {
                    name: 'Cobalt-Tools',
                    url: `https://api.cobalt.tools/api/download`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    data: { url: url, vQuality: '720', downloadMode: 'video' },
                    extractor: (d) => d?.url
                },
                {
                    name: 'Nexy-DL',
                    url: `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}&quality=720&key=nexy-9ccbbb`,
                    extractor: (d) => d?.download?.url || d?.url
                }
            ];

            for (const source of apiSources) {
                try {
                    let res;
                    if (source.method === 'POST') {
                        res = await axios.post(source.url, source.data, { headers: source.headers, timeout: 15000 });
                    } else {
                        res = await axios.get(source.url, { timeout: 15000 });
                    }
                    
                    const link = source.extractor(res.data);
                    if (link && link.startsWith('http')) {
                        videoUrl = link;
                        usedApi = source.name;
                        break;
                    }
                } catch (e) { continue; }
            }

            // 🛟 FALLBACK: yt-dlp (Solo si tienes el binario instalado en el server)
            if (!videoUrl) {
                try {
                    const tempFile = path.join(process.cwd(), `tmp_${Date.now()}.mp4`);
                    await execAsync(`yt-dlp -f "mp4[height<=720]" --max-filesize 50M -o "${tempFile}" "${url}"`);
                    if (fs.existsSync(tempFile)) {
                        videoUrl = tempFile;
                        usedApi = 'Local-Server';
                    }
                } catch (fallbackErr) {
                    console.error('Fallback falló');
                }
            }

            if (!videoUrl) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } });
                return conn.sendMessage(chat, { text: '> ✐ Todas las APIs fallaron. Reintenta en unos minutos.' });
            }

            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
✰ Título: ${v.title}
   › ⏱ \`Duración\`: *${v.timestamp}*
   › 🔧 \`Fuente\`: *${usedApi}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: `𝓜𝓲𝓼𝓪 𝙃𝘿 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚R 🖤`,
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // ENVÍO FINAL
            if (videoUrl.includes('tmp_')) {
                // Envío desde archivo local
                await conn.sendMessage(chat, { 
                    video: fs.readFileSync(videoUrl), 
                    caption: `> 🖤 *${v.title}*`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                fs.unlinkSync(videoUrl); // Borrar basura
            } else {
                // Envío desde URL
                await conn.sendMessage(chat, { 
                    video: { url: videoUrl }, 
                    caption: `> 🖤 *${v.title}*`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error(err);
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } });
        }
    }
};

export default play2Command;
