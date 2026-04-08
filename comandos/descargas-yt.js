/* Código creado por Yanniel, y optimizado By ABRAHAN-M (el brother mio <3)
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import axios from 'axios'
import yts from 'yt-search'

const playCommand = {
    name: 'play',
    alias: ['audio', 'music', 'ytmp3'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const prefijo = usedPrefix || ''

        if (!text) return conn.sendMessage(chat, { text: `🖤 *¿Qué quieres escuchar?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` }, { quoted: m })

        try {
            // 🔍 1. Búsqueda inteligente (aunque solo pongan "Romero")
            const search = await yts(text)
            const v = search.videos[0]

            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré nada relacionado con eso.' }, { quoted: m })

            const url = v.url
            const videoId = v.videoId
            let audioUrl = null
            let calidad = '128kbps' 

            // 🚀 --- ARSENAL DE APIS ACTUALIZADO (MÁXIMA ESTABILIDAD) ---
            const apiSources = [
                // Nueva API v2 (ytmp3v2)
                { url: `https://api.brayanofc.shop/dl/ytmp3v2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.data?.dl },
                // Nueva API v2 (youtubev2) - Buscando el formato Mp3
                { url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.results?.formats.find(f => f.label === 'Download Mp3')?.url },
                // Nexylight (Muy estable)
                { url: `https://api.nexylight.xyz/dl/ytmp3?id=${videoId}&key=nexy-9ccbbb`, path: (d) => d.download?.url },
                // API v1 (ytmp3)
                { url: `https://api.brayanofc.shop/dl/ytmp3?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.result?.downloadUrl },
                // Backups adicionales
                { url: `https://api.boxmine.xyz/down/ytaudio?url=${encodeURIComponent(url)}`, path: (d) => d.resultado?.url_dl },
                { url: `https://api.vreden.xyz/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}`, path: (d) => d.result?.download?.url }
            ]

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 4000 })
                    const link = source.path(res.data)
                    if (link) {
                        audioUrl = link
                        if (res.data?.data?.quality) calidad = res.data.data.quality
                        break 
                    }
                } catch { continue }
            }

            if (!audioUrl) throw new Error()

            const formatViews = (n) => {
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            // 📤 ENVIAR INFO (TU FORMATO ORIGINAL)
            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${calidad}*
   › ❀ \`Duración\`: *${v.timestamp || v.duration}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by *𝓜𝓲𝓼𝓪* ♡`.trim()

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

            // 🎵 Envío directo del audio
            return await conn.sendMessage(chat, { 
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${v.title}.mp3`
            }, { quoted: m })

        } catch (err) {
            return conn.sendMessage(chat, { text: '> ✐ No pude descargar el audio con ninguna fuente. Reintenta más tarde.' }, { quoted: m })
        }
    }
}

export default playCommand
