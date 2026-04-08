/* Código creado por Yanniel, y optimizado por el brother mio 
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
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
            let vistasReales = v.views

            // ⚡ API rápida con timeout
            try {
                const { data: resNexy } = await axios.get(
                    `https://api.nexylight.xyz/dl/ytmp3?id=${id}&key=nexy-9ccbbb`,
                    { timeout: 5000 }
                )

                if (resNexy.status) {
                    audioUrl = resNexy.download.url
                    vistasReales = resNexy.data.views
                }
            } catch {}

            // ⚡ ANIMACIÓN (MISMA ESTÉTICA PERO LIGERA)
            const { key } = await conn.sendMessage(chat, { 
                text: '📥 *Descargando:* `10%` █▒▒▒▒▒▒▒▒▒' 
            })

            const steps = [30, 60, 100]

            const getBar = (p) => {
                const filled = Math.floor(p / 10)
                return '█'.repeat(filled) + '▒'.repeat(10 - filled)
            }

            for (let p of steps) {
                await new Promise(r => setTimeout(r, 120))
                await conn.sendMessage(chat, {
                    text: `📥 *Descargando:* \`${p}%\` ${getBar(p)}`,
                    edit: key
                })
            }

            // 🧠 FORMATEO (igual pero optimizado)
            const formatViews = (views) => {
                if (!views) return "0"
                let str = views.toString().toLowerCase()

                if (/[kmb]/.test(str)) return str.replace(/[^0-9.kmb]/g, '').toUpperCase()

                let n = parseInt(str.replace(/\D/g, '')) || 0

                if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'

                return n.toLocaleString()
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

            const textoPlay = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title || "?"}
   › ✿ \`Canal\`: *${v.author?.name || "YouTube"}*
   › ✦ \`Duración\`: *${v.duration || "??:??"}*
   › ꕤ \`Vistas\`: *${formatViews(vistasReales)}*
   › ❖ \`Link\`: *${v.url}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: textoPlay,
                contextInfo: {
                    externalAdReply: {
                        title: v.title,
                        body: '𝓜𝓲𝓼𝓪  𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: v.image || v.thumbnail,
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m })

            // 🚀 ENVÍO RÁPIDO
            await conn.sendMessage(chat, { 
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${v.title}.mp3`
            }, { quoted: m })

            await conn.sendMessage(chat, { 
                text: '🖤 *Audio enviado con éxito :)*', 
                edit: key 
            })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { 
                text: '> ✐ no se pudo obtener ese audio.' 
            }, { quoted: m })
        }
    }
}

export default playCommand
