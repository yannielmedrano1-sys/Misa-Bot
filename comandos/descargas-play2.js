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
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré nada relacionado con eso.' }, { quoted: m })

            const url = v.url
            let videoUrl = null
            let filesize = 'Variable'

            const apiSources = [
                { url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.data?.dl, sizePath: (d) => d.data?.size },
                { url: `https://api.nexylight.xyz/dl/ytmp4?id=${v.videoId}&quality=720&key=nexy-9ccbbb`, path: (d) => d.download?.url, sizePath: (d) => d.download?.size },
                { url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, path: (d) => d.results?.formats.find(f => f.itag == '18' || f.label.includes('With Sound'))?.url, sizePath: (d) => null },
                { url: `https://api.boxmine.xyz/down/ytvideo?url=${encodeURIComponent(url)}`, path: (d) => d.resultado?.url_dl, sizePath: (d) => d.resultado?.size },
                { url: `https://api.vreden.xyz/api/v1/download/youtube/video?url=${encodeURIComponent(url)}`, path: (d) => d.result?.download?.url, sizePath: (d) => d.result?.download?.size }
            ]

            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 5000 })
                    const link = source.path(res.data)
                    if (link) {
                        videoUrl = link
                        const rawSize = source.sizePath ? source.sizePath(res.data) : null
                        if (rawSize && (rawSize.includes('MB') || rawSize.includes('GB'))) {
                            filesize = rawSize
                            const sizeNum = parseFloat(rawSize.replace(/[^0-9.]/g, ''))
                            if (rawSize.includes('GB') || sizeNum > 150) {
                                return conn.sendMessage(chat, { text: `⚠️ *Demasiado pesado*\n\n> ✿ El video pesa *${rawSize}* y el límite es de 150MB. 🖤` }, { quoted: m })
                            }
                        }
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) throw new Error()

            const formatViews = (n) => {
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Peso\`: *${filesize}*
   › ⏱ \`Duración\`: *${v.timestamp || v.duration}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤𝙬𝙣loader 🖤',
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            return await conn.sendMessage(chat, { 
                video: { url: videoUrl },
                caption: `> 🖤 *${v.title}*`,
                mimetype: 'video/mp4',
                fileName: `${v.title}.mp4`
            }, { quoted: m })

        } catch (err) {
            return conn.sendMessage(chat, { text: '> ✐ Error al obtener el video. Reintenta.' }, { quoted: m })
        }
    }
}

export default play2Command
