import axios from 'axios'
import { config } from '../config.js'

const playCommand = {
    name: 'play',
    alias: ['audio', 'music', 'ytmp3'],
    category: 'downloader',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const prefijo = usedPrefix || ''

        if (!text) {
            return conn.sendMessage(chat, {
                text: `🖤 *¿Qué quieres escuchar?*\n\nEjemplo: \`${prefijo + command} Media Hora\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 🔍 Buscar video
            const { data: searchData } = await axios.get(
                `https://api.brayanofc.shop/dl/youtubeplay?query=${encodeURIComponent(text)}&key=api-gmnch`
            )

            const v = searchData.data
            const id = v.videoId

            let audioUrl = v.dl
            let vistas = v.views

            // ⚡ Intento rápido con API principal
            try {
                const { data: nexy } = await axios.get(
                    `https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`,
                    { timeout: 5000 } // evita bloqueos largos
                )

                if (nexy.status) {
                    audioUrl = nexy.download.url
                    vistas = nexy.data.views
                }
            } catch {}

            // ⚡ Solo un mensaje de progreso (rápido)
            const { key } = await conn.sendMessage(chat, {
                text: '📥 *Procesando audio...*'
            })

            // 🧠 Formatear vistas
            const formatViews = (views) => {
                if (!views) return "0"
                let n = parseInt(views.toString().replace(/\D/g, '')) || 0

                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'

                return n.toLocaleString()
            }

            await conn.sendMessage(chat, { react: { text: '🎶', key: m.key } })

            // 📄 Info
            await conn.sendMessage(chat, {
                text: `✧ *YOUTUBE AUDIO*

✰ Título: ${v.title}
› Canal: ${v.author?.name || "YouTube"}
› Duración: ${v.duration}
› Vistas: ${formatViews(vistas)}
› Link: ${v.url}`,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: 'Audio listo 🎧',
                        thumbnailUrl: v.image || v.thumbnail,
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 🚀 ENVÍO DIRECTO (más rápido)
            await conn.sendMessage(chat, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${v.title}.mp3`
            }, { quoted: m })

            await conn.sendMessage(chat, {
                text: '✅ *Listo, disfruta tu audio*',
                edit: key
            })

        } catch (err) {
            console.error(err)

            await conn.sendMessage(chat, {
                text: '❌ *Error al obtener el audio*'
            }, { quoted: m })
        }
    }
}

export default playCommand
