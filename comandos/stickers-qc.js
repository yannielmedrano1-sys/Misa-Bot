// BY ABRAHAN-M

import axios from 'axios'
import fs from 'fs'

const qcCommand = {
    name: 'qc',
    alias: ['quote'],
    category: 'stickers',
    noPrefix: true,
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid

        // 🔥 FIX sender global
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '✏️ *Escribe un texto o responde a un mensaje*'
                }, { quoted: m })
            }

            if (textFinal.length > 30) {
                await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
                return conn.sendMessage(chat, {
                    text: '❌ *Máximo 30 caracteres*'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            const target = m.quoted ? 
                (m.quoted.sender || m.quoted.participant) : 
                sender

            const pp = await conn.profilePictureUrl(target, 'image')
                .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

            const db = global.db?.data || {}
            const userGlobal = db.users?.[target] || {}

            const nombre = userGlobal.name || target.split('@')[0]

            const quoteObj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#000000',
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: true,
                    from: {
                        id: 1,
                        name: nombre,
                        photo: { url: pp }
                    },
                    text: textFinal,
                    replyMessage: {}
                }]
            }

            const json = await axios.post(
                'https://bot.lyo.su/quote/generate',
                quoteObj,
                { headers: { 'Content-Type': 'application/json' } }
            )

            const buffer = Buffer.from(json.data.result.image, 'base64')

            const user = db.users?.[sender] || {}
            const name = user.name || sender.split('@')[0]

            const meta1 = user.metadatos ? String(user.metadatos).trim() : ''
            const meta2 = user.metadatos2 ? String(user.metadatos2).trim() : ''

            let texto1 = meta1 || '✨ Misa Bot'
            let texto2 = meta2 || `@${name}`

            const file = `./tmp/qc-${Date.now()}.webp`
            fs.writeFileSync(file, buffer)

            await conn.sendImageAsSticker(chat, file, m, {
                packname: texto1,
                author: texto2
            })

            fs.unlinkSync(file)

            await conn.sendMessage(chat, { react: { text: '✔️', key: m.key } })

        } catch (e) {
            console.error(e)

            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })

            await conn.sendMessage(chat, {
                text: '❌ *Error al crear el sticker*'
            }, { quoted: m })
        }
    }
}

export default qcCommand
