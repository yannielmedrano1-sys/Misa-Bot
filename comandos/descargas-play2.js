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

        if (!text) return conn.sendMessage(chat, { text: `🖤 *¿Qué video quieres ver en Full HD?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` }, { quoted: m })

        try {
            // 🔍 1. Búsqueda de alta precisión
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré el video, intenta ser más específico.' }, { quoted: m })

            const url = v.url
            let videoUrl = null
            let calidadFinal = '1080p'

            // 🚀 --- ARSENAL DE APIS HD (PRIORIDAD 1080p) ---
            const apiSources = [
                // Fuente 1: Nexylight forzando Full HD
                { url: `https://api.nexylight.xyz/dl/ytmp4?id=${v.videoId}&quality=1080&key=nexy-9ccbbb`, path: (d) => d.download?.url },
                // Fuente 2: Brayan Youtubev2 (Suele dar el mejor bitrate)
                { url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.results?.formats.find(f => f.quality === '1080p' || f.label.includes('1080'))?.url },
                // Fuente 3: Backup Brayan v2 (720p/1080p dinámico)
                { url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.data?.dl },
                // Fuente 4: Vreden (Alta calidad)
                { url: `https://api.vreden.xyz/api/v1/download/youtube/video?url=${encodeURIComponent(url)}`, path: (d) => d.result?.download?.url }
            ]

            // Mostrar mensaje de "procesando" para que el usuario no se desespere
            await m.react('⏳')

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 10000 }) // 10 seg de espera para archivos grandes
                    const link = source.path(res.data)
                    if (link) {
                        videoUrl = link
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) {
                await m.react('❌')
                return conn.sendMessage(chat, { text: '> ✐ Misa no pudo encontrar un servidor estable para 1080p en este video. Intenta con otro.' }, { quoted: m })
            }

            const formatViews = (n) => {
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${calidadFinal} (Full HD)*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝙃𝘿 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 🎥 ENVÍO DEL VIDEO (Con mimetype correcto para evitar errores)
            await conn.sendMessage(chat, { 
                video: { url: videoUrl },
                caption: `> 🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m })
            
            return await m.react('✅')

        } catch (err) {
            console.error(err)
            return conn.sendMessage(chat, { text: '> ✐ Misa tuvo un error crítico. Puede que el servidor de descarga esté caído.' }, { quoted: m })
        }
    }
}

export default play2Command
