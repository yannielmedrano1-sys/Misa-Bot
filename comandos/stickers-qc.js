import axios from 'axios'

const qcCommand = {
    name: 'qc',
    alias: ['quote'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '✏️ Escribe o responde a un mensaje'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            const quoteObj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#000000',
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: false,
                    from: { name: sender.split('@')[0] },
                    text: textFinal
                }]
            }

            const res = await axios.post(
                'https://bot.lyo.su/quote/generate',
                quoteObj,
                { headers: { 'Content-Type': 'application/json' } }
            )

            if (!res.data?.result?.image) {
                throw new Error("API no respondió imagen")
            }

            const buffer = Buffer.from(res.data.result.image, 'base64')

            // 🔥 AQUÍ ESTÁ LA MAGIA
            await conn.sendImageAsSticker(chat, buffer, m, {
                packname: '✨ Misa Bot',
                author: sender.split('@')[0]
            })

            await conn.sendMessage(chat, { react: { text: '✔️', key: m.key } })

        } catch (e) {
            console.error("QC ERROR:", e.response?.data || e.message)

            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })

            await conn.sendMessage(chat, {
                text: '❌ Error al crear el sticker'
            }, { quoted: m })
        }
    }
}

export default qcCommand
