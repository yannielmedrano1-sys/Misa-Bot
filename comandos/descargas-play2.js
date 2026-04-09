/* Código optimizado por Yanniel & Gemini
   Estructura de APIs: BrayanOFC (ytmp4v2, youtubev2, ytdl)
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

        if (!text) return conn.sendMessage(chat, { text: `🖤 *¿Qué video buscamos hoy?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` }, { quoted: m })

        try {
            // 🔍 1. Búsqueda
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré nada, loco.' }, { quoted: m })

            const url = v.url
            let videoUrl = null
            let selectedQuality = '1080p'

            // ⏳ Reacción de procesando (Forma correcta Baileys)
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 🚀 --- ARSENAL DE APIS (RUTAS EXACTAS SEGÚN TUS JSON) ---
            const apiSources = [
                // 1. ytmp4v2 (Prioridad 1080p - Ruta: data.dl)
                { 
                    url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&quality=1080&key=api-gmnch`, 
                    path: (d) => d.data?.dl 
                },
                // 2. youtubev2 (Ruta: results.formats -> El que tenga sonido)
                { 
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, 
                    path: (d) => d.results?.formats?.find(f => f.label.includes('With Sound') || f.itag == '18')?.url 
                },
                // 3. ytdl (Backup - Ruta: result.download)
                { 
                    url: `https://api.brayanofc.shop/dl/ytdl?url=${encodeURIComponent(url)}&type=mp4&key=api-gmnch`, 
                    path: (d) => d.result?.download 
                }
            ]

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 15000 })
                    const link = source.path(res.data)
                    if (link) {
                        videoUrl = link
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: '> ✐ No pude conseguir el link de descarga. Intenta con otro video.' }, { quoted: m })
            }

            // 📊 Formatear vistas
            const formatViews = (n) => {
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            // 📤 INFO DEL VIDEO
            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${selectedQuality}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚rer 🖤',
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

            return await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return conn.sendMessage(chat, { text: '> ✐ Hubo un error crítico al procesar la descarga.' }, { quoted: m })
        }
    }
}

export default play2Command
