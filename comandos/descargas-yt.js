/**
 * ꕤ ━━━━━━━━━━ PLAY MULTI-API (yt-search) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 * Créditos: Yanniel & ABRAHAN-M
 */

import yts from 'yt-search'
import fetch from 'node-fetch'

// Función para obtener buffer de imagen/audio
async function getBuffer(url) {
    const res = await fetch(url)
    return res.buffer()
}

const playMultiApi = {
    name: 'play',
    alias: ['mp3', 'ytmp3', 'ytaudio', 'playaudio'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, args, command, usedPrefix }) => {
        const chat = m.chat
        if (!args[0]) return conn.sendMessage(chat, { text: `> ✐ *Por favor, menciona el nombre o URL del video.*` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 1. 🔎 BÚSQUEDA CON YT-SEARCH
            const search = await yts(text)
            const video = search.videos[0]
            if (!video) return conn.sendMessage(chat, { text: `> ✐ *No encontré resultados para tu búsqueda.*` }, { quoted: m })

            const url = video.url
            const title = video.title
            const vistas = video.views.toLocaleString()
            const duracion = video.timestamp
            const autor = video.author.name
            const imagen = video.image

            // 2. 📥 MENSAJE DE INFO (ESTILO MISA)
            const infoMsg = `✧ ‧₊˚ *YOUTUBE PLAY* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: ${title}
   › ✿ \`Canal\`: *${autor}*
   › ✦ \`Duración\`: *${duracion}*
   › ꕤ \`Vistas\`: *${vistas}*
   › ❖ \`Link\`: *${url}*

> *Descargando audio, por favor espera...*
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                image: { url: imagen }, 
                caption: infoMsg,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: '𝓜𝓲𝓼𝓪 𝘿𝙤纵𝙡𝙤𝙖𝙙𝙚𝙧 🖤',
                        thumbnailUrl: imagen,
                        sourceUrl: url,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m })

            // 3. 🚀 INTENTAR DESCARGA CON MULTI-APIS
            await conn.sendMessage(chat, { react: { text: '📥', key: m.key } })
            const audio = await getAudioFromApis(url)

            if (!audio || !audio.url) {
                return conn.sendMessage(chat, { text: `> ✐ *Error:* Todas las APIs fallaron. Intenta más tarde.` }, { quoted: m })
            }

            // 4. 📤 ENVÍO DEL AUDIO
            await conn.sendMessage(chat, { 
                audio: { url: audio.url }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            conn.sendMessage(chat, { text: `> ✐ *Ocurrió un error:* ${e.message}` }, { quoted: m })
        }
    }
}

// --- 🛠️ MOTOR DE DESCARGA MULTI-API ---
async function getAudioFromApis(url) {
    const apis = [
        { api: 'Axi', endpoint: `https://api.boxmine.xyz/down/ytaudio?url=${encodeURIComponent(url)}`, extractor: res => res?.resultado?.url_dl },    
        { api: 'Ootaizumi', endpoint: `https://api.ootaizumi.xyz/downloader/youtube/play?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download },
        { api: 'Vreden', endpoint: `https://api.vreden.xyz/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=256`, extractor: res => res.result?.download?.url },
        { api: 'Nekolabs', endpoint: `https://api.nekolabs.xyz/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=mp3`, extractor: res => res.result?.downloadUrl }
    ]

    for (const { endpoint, extractor } of apis) {
        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 12000) // 12 segundos por API
            const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
            clearTimeout(timeout)
            
            const link = extractor(res)
            if (link) return { url: link }
        } catch (e) {
            continue // Si una falla, salta a la siguiente
        }
    }
    return null
}

export default playMultiApi
