// BY ABRAHAN-M 

import fetch from 'node-fetch'

const emojimixCommand = {
    name: 'emojimix',
    alias: ['emix'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            if (!text || !text.includes('+')) {
                return conn.sendMessage(chat, {
                    text: `✨ *Combina emojis*\n\n📌 Ejemplo:\n\`emojimix 😎+🔥\``
                }, { quoted: m })
            }

            let [emoji1, emoji2] = text.split('+').map(e => e.trim())

            if (!emoji1 || !emoji2) {
                return conn.sendMessage(chat, {
                    text: '❌ Debes usar 2 emojis\nEjemplo: 😎+🔥'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 Nombre PRO (igual que QC)
            const db = global.db?.data || {}
            const user = db.users?.[sender] || {}

            const name = user.name || m.pushName || sender.split('@')[0]
            const packname = user.metadatos || '✨ Emojis Mix'
            const author = user.metadatos2 || `@${name}`

            // 🔥 API EMOJI KITCHEN
            const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`

            const res = await fetch(url)
            const json = await res.json()

            if (!json.results || json.results.length === 0) {
                throw new Error('No se encontraron combinaciones 😢')
            }

            // 🔥 ENVÍO DIRECTO COMO STICKER
            for (let result of json.results.slice(0, 5)) {
                const buffer = await (await fetch(result.url)).arrayBuffer()

                await conn.sendImageAsSticker(
                    chat,
                    Buffer.from(buffer),
                    m,
                    {
                        packname,
                        author
                    }
                )
            }

            await conn.sendMessage(chat, { react: { text: '✔️', key: m.key } })

        } catch (e) {
            console.error("EMOJIMIX ERROR:", e)

            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })

            await conn.sendMessage(chat, {
                text: `❌ Error al combinar emojis\n📌 ${e.message}`
            }, { quoted: m })
        }
    }
}

export default emojimixCommand
