import fetch from 'node-fetch'

const tiktokCommand = {
    name: 'tiktok',
    alias: ['tt', 'tts'],
    category: 'downloader',
    noPrefix: true, // 🔥 ESTO ERA CLAVE
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        console.log("TIKTOK EJECUTADO") // debug

        const chat = m.key.remoteJid

        if (!text) {
            return conn.sendMessage(chat, {
                text: `🖤 *¿Qué quieres buscar en TikTok?*\n\nEjemplo: \`${command} gatos\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            const res = await fetch(`https://api.stellarwa.xyz/search/tiktok?query=${encodeURIComponent(text)}&key=YukiWaBot`)
            const json = await res.json()

            if (!json.status || !json.data?.length) {
                return conn.sendMessage(chat, {
                    text: '> ✐ No se encontró contenido.'
                }, { quoted: m })
            }

            const v = json.data[0]

            await conn.sendMessage(chat, {
                video: { url: v.dl },
                caption: `🎵 ${v.title || 'Sin título'}`
            }, { quoted: m })

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
