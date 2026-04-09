/* Código creado por Yanniel, y optimizado By ABRAHAN-M (el brother mio <3)
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import axios from 'axios'
import yts from 'yt-search'

const play2Command = {
    name: 'play2',
    alias: ['video', 'ytmp4', 'vid'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const prefijo = usedPrefix || ''

        if (!text) return conn.sendMessage(chat, { text: `🖤 *¿Qué video quieres ver?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` }, { quoted: m })

        try {
            // 🔍 1. Búsqueda de YouTube
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré ese video.' }, { quoted: m })

            const url = v.url
            const videoId = v.videoId
            let videoUrl = null
            let finalSize = 'Variable'
            let finalQuality = '1080p'

            // 🚀 --- ARSENAL DE APIS (BASADO EN TUS JSON) ---
            const apiSources = [
                // 1. Brayan ytmp4v2 (Busca el campo "dl")
                { 
                    url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&quality=1080p&key=api-gmnch`, 
                    path: (d) => d.data?.dl,
                    size: (d) => d.data?.size
                },
                // 2. Nexylight (Busca el campo "download.url")
                { 
                    url: `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}&quality=1080&key=nexy-9ccbbb`, 
                    path: (d) => d.download?.url,
                    size: (d) => d.download?.size
                },
                // 3. Brayan youtubev2 (Filtra por etiqueta "With Sound")
                { 
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, 
                    path: (d) => d.results?.formats.find(f => f.label.includes('With Sound') || f.itag == '18')?.url,
                    size: (d) => d.results?.info?.duration // Solo para evitar null
                },
                // 4. Brayan ytdl (Backup final)
                { 
                    url: `https://api.brayanofc.shop/dl/ytdl?url=${encodeURIComponent(url)}&type=mp4&key=api-gmnch`, 
                    path: (d) => d.result?.download,
                    size: (d) => null
                }
            ]

            await m.react('⏳')

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 10000 })
                    const link = source.path(res.data)
                    
                    if (link) {
                        // 🛡️ Filtro de Peso Inteligente
                        const rawSize = source.size ? source.size(res.data) : null
                        if (rawSize && (String(rawSize).includes('MB') || String(rawSize).includes('GB'))) {
                            const sizeNum = parseFloat(rawSize.replace(/[^0-9.]/g, ''))
                            if (String(rawSize).includes('GB') || sizeNum > 150) {
                                return conn.sendMessage(chat, { text: `⚠️ *Demasiado pesado*\n\n> ✿ El video pesa *${rawSize}* y el límite es de 150MB. 🖤` }, { quoted: m })
                            }
                            finalSize = rawSize
                        }
                        videoUrl = link
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) {
                await m.react('❌')
                throw new Error()
            }

            const formatViews = (n) => {
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            // 📤 INFO DEL VIDEO
            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${finalQuality}*
   › ⏱ \`Peso\`: *${finalSize}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 🎥 ENVÍO DEL VIDEO
            await conn.sendMessage(chat, { 
                video: { url: videoUrl },
                caption: `> 🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m })

            return await m.react('✅')

        } catch (err) {
            return conn.sendMessage(chat, { text: '> ✐ Misa no pudo descargar el video. Intenta de nuevo.' }, { quoted: m })
        }
    }
}

export default play2Command
