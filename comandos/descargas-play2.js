/* 
 * Código optimizado por OpenClaw Assistant
 * Basado en trabajo original de Yanniel y ABRAHAN-M
 * https://github.com/yannielmedrano1-sys
 */
import axios from 'axios';
import yts from 'yt-search';

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
            // 🔍 Búsqueda con manejo de errores
            await m.react('🔍');
            
            const search = await yts(text);
            const v = search.videos[0];
            
            if (!v) {
                return conn.sendMessage(chat, { 
                    text: '> ✐ No encontré el video. Intenta ser más específico con el título.' 
                }, { quoted: m });
            }

            const url = v.url;
            const videoId = v.videoId;
            
            // Verificar duración (evitar videos muy largos)
            const durationParts = v.timestamp.split(':').map(Number);
            const totalSeconds = durationParts.length === 3 
                ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
                : durationParts[0] * 60 + durationParts[1];
            
            if (totalSeconds > 1800) {
                return conn.sendMessage(chat, { 
                    text: '> ⚠️ El video es muy largo (>30 min). Prueba con uno más corto.' 
                }, { quoted: m });
            }

            await m.react('⏳');

            // 🚀 APIs optimizadas
            const apiSources = [
                {
                    url: `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}&quality=1080&key=nexy-9ccbbb`,
                    extractor: (d) => d?.download?.url || d?.url,
                    timeout: 15000
                },
                {
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`,
                    extractor: (d) => {
                        const formats = d?.results?.formats;
                        if (!formats) return null;
                        const quality = formats.find(f => f.quality === '1080p') 
                            || formats.find(f => f.quality === '720p')
                            || formats.find(f => f.quality === '480p')
                            || formats[0];
                        return quality?.url;
                    },
                    timeout: 20000
                },
                {
                    url: `https://api.vreden.xyz/api/v1/download/youtube/video?url=${encodeURIComponent(url)}`,
                    extractor: (d) => d?.result?.download?.url || d?.download_url,
                    timeout: 15000
                },
                {
                    url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=api-gmnch`,
                    extractor: (d) => d?.data?.dl || d?.download?.url,
                    timeout: 20000
                }
            ];

            let videoUrl = null;
            let usedApi = '';
            let errors = [];

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { 
                        timeout: source.timeout,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    const link = source.extractor(res.data);
                    if (link && typeof link === 'string' && link.startsWith('http')) {
                        const headCheck = await axios.head(link, { 
                            timeout: 5000,
                            validateStatus: (status) => status < 400
                        }).catch(() => null);
                        
                        if (headCheck || link.includes('googlevideo.com') || link.includes('gstatic.com')) {
                            videoUrl = link;
                            usedApi = source.url.split('/')[2];
                            break;
                        }
                    }
                } catch (e) {
                    errors.push(`${source.url.split('/')[2]}: ${e.message}`);
                    continue;
                }
            }

            if (!videoUrl) {
                await m.react('❌');
                console.error('API Errors:', errors);
                return conn.sendMessage(chat, { 
                    text: '> ✐ No se pudo obtener el video. Los servidores pueden estar saturados.' 
                }, { quoted: m });
            }

            const formatViews = (n) => {
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
                return n.toLocaleString();
            };

            const detectedQuality = videoUrl.includes('1080') ? '1080p' 
                : videoUrl.includes('720') ? '720p' 
                : videoUrl.includes('480') ? '480p' 
                : 'HD';

            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${detectedQuality}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*
   › 🔧 \`API\`: *${usedApi}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: `𝓜𝓲𝓼𝓪 𝙃𝘿 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤 | ${detectedQuality}`,
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            try {
                await conn.sendMessage(chat, { 
                    video: { url: videoUrl },
                    caption: `> 🖤 *${v.title}*\n> 📹 *Calidad:* ${detectedQuality}`,
                    mimetype: 'video/mp4',
                    fileName: `${v.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}_${detectedQuality}.mp4`,
                    jpegThumbnail: await getThumbnail(v.image).catch(() => undefined)
                }, { quoted: m });
                
                await m.react('✅');
            } catch (sendError) {
                if (sendError.message?.includes('file too large') || sendError.message?.includes('413')) {
                    await conn.sendMessage(chat, { 
                        document: { url: videoUrl },
                        mimetype: 'video/mp4',
                        fileName: `${v.title.substring(0, 30)}.mp4`,
                        caption: '> 📁 El video es muy grande, se envía como documento.'
                    }, { quoted: m });
                    await m.react('📁');
                } else {
                    throw sendError;
                }
            }

        } catch (err) {
            console.error('Play2 Error:', err);
            await m.react('❌');
            return conn.sendMessage(chat, { 
                text: '> ✐ Error al procesar el video. Intenta con otro enlace.' 
            }, { quoted: m });
        }
    }
};

async function getThumbnail(imageUrl) {
    try { 
       const response = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 5000 
        });
        return Buffer.from(response.data, 'binary');
    } catch {
        return undefined;
    }
}

export default play2Command; 
        
