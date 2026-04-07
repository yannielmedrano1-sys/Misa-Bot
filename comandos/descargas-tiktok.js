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
                text: `🖤 *¿Qué quieres buscar o descargar?*\n\nEjemplo:\n\`${command} gatos\`\n\`${command} https://tiktok.com/... \``
            }, { quoted: m })
        }

        // 🔥 DETECTAR LINK REAL
        const isUrl = text.includes('tiktok.com')

        const endpoint = isUrl
            ? `https://api.stellarwa.xyz/dl/tiktok?url=${encodeURIComponent(text)}&key=YukiWaBot`
            : `https://api.stellarwa.xyz/search/tiktok?query=${encodeURIComponent(text)}&key=YukiWaBot`

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            const res = await fetch(endpoint)
            const json = await res.json()

            if (!json.status) {
                return conn.sendMessage(chat, {
                    text: '> ✐ No se encontró contenido.'
                }, { quoted: m })
            }

            // 👉 SI ES LINK
            if (isUrl) {
                const v = json.data
                const videoUrl = Array.isArray(v.dl) ? v.dl[0] : v.dl

                await conn.sendMessage(chat, {
                    video: { url: videoUrl },
                    caption: `🎵 ${v.title || 'TikTok'}`
                }, { quoted: m })

            } else {
                // 👉 SI ES BÚSQUEDA
                const v = json.data[0]

                await conn.sendMessage(chat, {
                    video: { url: v.dl },
                    caption: `🎵 ${v.title || 'TikTok'}`
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)

            await conn.sendMessage(chat, {
                text: '❌ Error al procesar TikTok'
            }, { quoted: m })
        }
    }
}

export default tiktokCommand
