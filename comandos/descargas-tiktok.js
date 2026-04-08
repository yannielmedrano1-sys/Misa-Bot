import fetch from 'node-fetch'

const tiktokCommand = {
    name: 'tiktok',
    alias: ['tt', 'tts'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué quieres buscar?*\n\n*Ejemplo:*\n\`${command} https://tiktok.com/... \`` }, { quoted: m })

        const isUrl = text.includes('tiktok.com')
        
        // 🔥 SISTEMA DE APIS ( BrayanOFC como Principal )
        const apis = [
            `https://api.brayanofc.shop/dl/tiktok?url=${encodeURIComponent(text)}&key=api-gmnch`,
            `https://api.stellarwa.xyz/dl/tiktok?url=${encodeURIComponent(text)}&key=YukiWaBot`,
            `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(text)}`
        ]

        await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

        let data = null
        let success = false

        for (const api of apis) {
            try {
                const res = await fetch(api)
                const json = await res.json()
                
                if (json.status && json.data) {
                    data = json.data
                    success = true
                    break 
                }
            } catch (err) {
                continue 
            }
        }

        if (!success || !data) {
            return conn.sendMessage(chat, { text: '› ✐  *Error:* No se pudo obtener el contenido. ✧' }, { quoted: m })
        }

        try {
            const v = isUrl ? data : (Array.isArray(data) ? data[0] : data)
            
            // 🛠️ MAPEADO DE ESTADÍSTICAS
            const vistasReales = v.stats?.plays || v.stats?.playCount || v.views || 0
            const likesReales = v.stats?.likes || v.stats?.likeCount || v.like || 0
            const commentsReales = v.stats?.comments || v.stats?.commentCount || v.comment || 0
            const videoLink = isUrl ? text : `https://www.tiktok.com/@${v.author?.unique_id || 'user'}/video/${v.id}`

            const formatNr = (num) => {
                if (!num || num === 0) return '0'
                return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
            }

            const caption = `
✧ ‧₊˚ *TIKTOK DOWNLOADER* ୧ֹ˖ ⑅

✰ Título: *${v.title || "TikTok Video"}*
   › ✿ \`Autor\`: *${v.author?.nickname || v.nickname || "Anónimo"}*
   › ✦ \`Likes\`: *${formatNr(likesReales)}*
   › ꕤ \`Vistas\`: *${formatNr(vistasReales)}*
   › ❖ \`Coments\`: *${formatNr(commentsReales)}*
   › ❖ \`Link\`: *${videoLink}*
   >Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            const videoUrl = v.dl || v.video || v.url

            await conn.sendMessage(chat, {
                video: { url: videoUrl },
                caption: caption
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* Fallo al enviar el video. ✧' }, { quoted: m })
        }
    }
}

export default tiktokCommand
