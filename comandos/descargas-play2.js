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
            // 🔍 1. Búsqueda
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré nada.' }, { quoted: m })

            const url = v.url
            let videoUrl = null
            let filesize = 'Variable'

            // 🚀 --- ARSENAL DE APIS (DIRECTAS AL GRANO) ---
            const apiSources = [
                // Brayan ytmp4v2 (Basado en el JSON que me diste)
                { url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.data?.dl, size: (d) => d.data?.quality },
                // Nexylight (720p)
                { url: `https://api.nexylight.xyz/dl/ytmp4?id=${v.videoId}&quality=720&key=nexy-9ccbbb`, path: (d) => d.download?.url, size: (d) => d.download?.quality },
                // Brayan youtubev2 (Filtro Mp4 con sonido)
                { url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.results?.formats.find(f => f.itag == '18' || f.label.includes('Video'))?.url, size: (d) => '720p' },
                // Brayan ytdl (Backup rápido)
                { url: `https://api.brayanofc.shop/dl/ytdl?url=${encodeURIComponent(url)}&type=mp4&key=api-gmnch`, path: (d) => d.result?.download, size: (d) => d.result?.quality }
            ]

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 8000 })
                    const link = source.path(res.data)
                    if (link) {
                        videoUrl = link
                        filesize = source.size(res.data) || 'Variable'
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) throw new Error('No link found')

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
   › ✦ \`Calidad\`: *${filesize}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

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
            return await conn.sendMessage(chat, { 
                video: { url: videoUrl },
                caption: `> 🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m })

        } catch (err) {
            console.error(err)
            return conn.sendMessage(chat, { text: '> ✐ Misa no pudo descargar el video. Intenta con otro nombre o link.' }, { quoted: m })
        }
    }
}

export default play2Command
