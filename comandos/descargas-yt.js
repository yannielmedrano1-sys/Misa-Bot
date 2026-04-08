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

        if (!text) {
            return conn.sendMessage(chat, { 
                text: `🖤 *¿Qué escuchamos?*\n\n> ✐ \`${prefijo + command} Media Hora\`` 
            }, { quoted: m })
        }

        try {
            // 🔍 1. Búsqueda instantánea
            const search = await yts(text)
            const v = search.videos[0]

            if (!v) return conn.sendMessage(chat, { text: '> ✐ No se encontró nada.' }, { quoted: m })

            // 🚀 2. Intento de descarga (Ráfaga de APIs)
            let audioUrl = null
            const apis = [
                `https://api.nexylight.xyz/dl/ytmp3?id=${v.videoId}&key=nexy-9ccbbb`,
                `https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(v.url)}&key=api-gmnch`
            ]

            for (const api of apis) {
                try {
                    const res = await axios.get(api, { timeout: 4000 }) // Bajamos a 4 seg para saltar rápido
                    audioUrl = res.data?.download?.url || res.data?.data?.dl || res.data?.resultado?.url_dl
                    if (audioUrl) break 
                } catch { continue }
            }

            if (!audioUrl) throw new Error()

            // 📤 3. Envío directo (Sin distracciones)
            await conn.sendMessage(chat, { 
                text: `✧ ‧₊˚ *${v.title}*\n> ✿ Duración: *${v.timestamp}*\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤纵𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image,
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            return await conn.sendMessage(chat, { 
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${v.title}.mp3`
            }, { quoted: m })

        } catch (err) {
            return conn.sendMessage(chat, { text: '> ✐ Error rápido al procesar.' }, { quoted: m })
        }
    }
}

export default playCommand
