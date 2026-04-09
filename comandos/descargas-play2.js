/* * 👑 Código DEFINITIVO y Ultra-Optimizado para Misa-Bot
 * Estructura: APIs de BrayanOFC + Detector de Peso + Anti-Crash
 * Autor: Yanniel & Gemini
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
            // 🔍 1. Búsqueda y Validación
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })
            
            const search = await yts(text)
            const v = search.videos[0]
            if (!v) return conn.sendMessage(chat, { text: '> ✐ No encontré nada, loco. Intenta con otro nombre.' }, { quoted: m })

            // ⚠️ Proteger el servidor: Límite de 30 minutos (1800 segundos)
            if (v.seconds > 1800) {
                await conn.sendMessage(chat, { react: { text: '⚠️', key: m.key } })
                return conn.sendMessage(chat, { text: '> ⚠️ *¡Video demasiado largo!* El límite es de 30 minutos para no saturar a Misa.' }, { quoted: m })
            }

            const url = v.url
            let videoUrl = null
            let selectedQuality = 'HD'

            // ⏳ Reacción y Estado de "Grabando/Procesando"
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })
            await conn.sendPresenceUpdate('recording', chat) // Le da un toque premium

            // 🚀 --- ARSENAL DE APIS (RUTAS EXACTAS) ---
            const apiSources = [
                { 
                    url: `https://api.brayanofc.shop/dl/ytmp4v2?url=${encodeURIComponent(url)}&quality=1080&key=api-gmnch`, 
                    path: (d) => d.data?.dl,
                    q: '1080p'
                },
                { 
                    url: `https://api.brayanofc.shop/dl/youtubev2?url=${encodeURIComponent(url)}&key=api-gmnch`, 
                    path: (d) => d.results?.formats?.find(f => f.label.includes('With Sound') || f.itag == '18')?.url,
                    q: '720p/480p'
                },
                { 
                    url: `https://api.brayanofc.shop/dl/ytdl?url=${encodeURIComponent(url)}&type=mp4&key=api-gmnch`, 
                    path: (d) => d.result?.download,
                    q: 'Auto'
                }
            ]

            // 🔄 Buscar link válido
            for (const source of apiSources) {
                try {
                    const res = await axios.get(source.url, { timeout: 15000 })
                    const link = source.path(res.data)
                    if (link && link.startsWith('http')) {
                        videoUrl = link
                        selectedQuality = source.q
                        break 
                    }
                } catch { continue }
            }

            if (!videoUrl) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: '> ✐ Servidores saturados. No pude conseguir el link, intenta de nuevo en un rato.' }, { quoted: m })
            }

            // ⚖️ 2. Analizar el peso del video antes de enviarlo
            let isDocument = false
            try {
                const headRes = await axios.head(videoUrl, { timeout: 5000 })
                const sizeInBytes = headRes.headers['content-length']
                if (sizeInBytes) {
                    const sizeInMb = sizeInBytes / (1024 * 1024)
                    // Si pesa más de 50MB, Baileys dará error al mandarlo como video. Lo mandamos como documento.
                    if (sizeInMb > 50) isDocument = true
                }
            } catch (e) {
                // Si falla el head, no hacemos nada, intentamos enviarlo normal
            }

            // 📊 Formatear vistas para que se vea estético
            const formatViews = (n) => {
                if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
                if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
                return n.toLocaleString()
            }

            // 📤 3. INFO DEL VIDEO (Diseño Misa)
            const textoPlay = `✧ ‧₊˚ *YOUTUBE VIDEO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${v.title}
   › ✦ \`Calidad\`: *${selectedQuality}*
   › ⏱ \`Duración\`: *${v.timestamp}*
   › ꕤ \`Vistas\`: *${formatViews(v.views)}*
   › ❖ \`Formato\`: *${isDocument ? 'Documento (Pesado 📁)' : 'Video 🎥'}*

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

            // 🎥 4. ENVÍO DEL VIDEO O DOCUMENTO
            await conn.sendPresenceUpdate('recording', chat)

            if (isDocument) {
                await conn.sendMessage(chat, { 
                    document: { url: videoUrl },
                    mimetype: 'video/mp4',
                    fileName: `${v.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
                    caption: '> 🖤 El video es muy pesado, se envía como documento.'
                }, { quoted: m })
            } else {
                await conn.sendMessage(chat, { 
                    video: { url: videoUrl },
                    caption: `> 🖤 *${v.title}*`,
                    mimetype: 'video/mp4',
                    fileName: `${v.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`
                }, { quoted: m })
            }

            return await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error('[Play2 Error]:', err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return conn.sendMessage(chat, { text: '> ✐ Hubo un error crítico al procesar la descarga. Avisa a los dueños.' }, { quoted: m })
        }
    }
}

export default play2Command
