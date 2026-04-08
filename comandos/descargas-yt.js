/* Código creado por Yanniel, y optimizado By ABRAHAN-M (el brother mio <3)
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import axios from 'axios'
import yts from 'yt-search'
import fetch from 'node-fetch'

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
                text: `🖤 *¿Qué quieres escuchar?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Media Hora\`` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 🔍 1. Búsqueda local con yt-search (Cero fallas de API aquí)
            const search = await yts(text)
            const v = search.videos[0]

            if (!v) {
                return conn.sendMessage(chat, { text: '> ✐ No encontré resultados para tu búsqueda.' }, { quoted: m })
            }

            const url = v.url
            const videoId = v.videoId

            // ⚡ 2. Animación de carga estilo Misa
            const { key } = await conn.sendMessage(chat, { 
                text: '📥 *Buscando:* `15%` █▒▒▒▒▒▒▒▒▒' 
            })

            // 🚀 3. Intentar obtener el link de descarga (Multi-API Fallback)
            let audioUrl = null
            
            // Lista de APIs de respaldo (Lógica de Abrahan-M)
            const apis = [
                `https://api.nexylight.xyz/dl/ytmp3?id=${videoId}&key=nexy-9ccbbb`,
                `https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(url)}&key=api-gmnch`
            ]

            for (const api of apis) {
                try {
                    const res = await axios.get(api, { timeout: 6000 })
                    // Extraer link según la estructura de la API
                    audioUrl = res.data?.download?.url || res.data?.data?.dl || res.data?.resultado?.url_dl
                    if (audioUrl) break 
                } catch (e) {
                    continue
                }
            }

            if (!audioUrl) throw new Error('Todas las APIs fallaron')

            // Actualizar barra al 100%
            await conn.sendMessage(chat, {
                text: `📥 *Descargando:* \`100%\` ██████████`,
                edit: key
            })

            // 🧠 Formateo de vistas
            const formatViews = (views) => {
                if (!views) return "0"
                let n = parseInt(views)
                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✿ \`Canal\`: *${v.author.name}*
   › ✦ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Link\`: *${url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // 📤 Enviar portada e info
            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤纵𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image,
                        sourceUrl: url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 🎵 Enviar el Audio
            await conn.sendMessage(chat, { 
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${v.title}.mp3`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
            await conn.sendMessage(chat, { text: '🖤 *¡Música enviada con éxito!*', edit: key })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: '> ✐ Misa tuvo un problema al descargar el audio. Intenta de nuevo.' 
            }, { quoted: m })
        }
    }
}

export default playCommand
