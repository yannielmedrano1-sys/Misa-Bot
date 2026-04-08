
import fetch from 'node-fetch'

const tiktokCommand = {
    name: 'tiktok',
    alias: ['tt', 'tts'],
    category: 'downloader',
    noPrefix: true,
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid

        if (!text) {
            return conn.sendMessage(chat, {
                text: ` *¿Qué quieres buscar o descargar?*\n\n*Ejemplo:*\n\`${command} gatos\`\n\`${command} https://tiktok.com/... \``
            }, { quoted: m })
        }

        const isUrl = text.includes('tiktok.com')

        const endpoint = isUrl
            ? `https://api.stellarwa.xyz/dl/tiktok?url=${encodeURIComponent(text)}&key=YukiWaBot`
            : `https://api.stellarwa.xyz/search/tiktok?query=${encodeURIComponent(text)}&key=YukiWaBot`

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            const res = await fetch(endpoint)
            const json = await res.json()

            if (!json.status || !json.data) {
                return conn.sendMessage(chat, {
                    text: '› ✐  *Error:* No se encontró contenido multimedia. ✧'
                }, { quoted: m })
            }

            const v = isUrl ? json.data : json.data[0]
            
            const formatNr = (num) => {
                if (!num) return '0'
                return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
            }

            // Aplicando tu nueva estética personalizada
            const caption = `
✧ ‧₊˚ *TIKTOK DOWNLOADER* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Título: *${v.title || "TikTok Video"}*
   › ✿ \`Autor\`: *${v.author?.nickname || v.nickname || "Anónimo"}*
   › ✦ \`Likes\`: *${formatNr(v.stats?.likeCount || v.like)}*
   › ꕤ \`Vistas\`: *${formatNr(v.stats?.playCount || v.views)}*
   › ❖ \`Coments\`: *${formatNr(v.stats?.commentCount || v.comment)}*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            const videoUrl = isUrl 
                ? (Array.isArray(v.dl) ? v.dl[0] : v.dl)
                : v.dl

            await conn.sendMessage(chat, {
                video: { url: videoUrl },
                caption: caption
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("TT ERROR:", e)
            await conn.sendMessage(chat, {
                text: '> ✐  *Error:* No se pudo procesar el TikTok. ✧'
            }, { quoted: m })
        }
    }
}

export default tiktokCommand
