import { downloadContentFromMessage, extractMessageContent } from '@whiskeysockets/baileys'

const readViewOnceMisa = {
    name: 'readviewonce',
    alias: ['read', 'readvo', 'revelar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        const quoted = m.quoted ? m.quoted : m

        // Verificamos si el mensaje citado es ViewOnce
        const isViewOnce = quoted.msg?.viewOnce || quoted.viewOnce || false
        if (!isViewOnce) return conn.sendMessage(chat, { 
            text: `> ✐  *Por favor, responde a un mensaje de "Ver una sola vez" para revelar su contenido.* ✧` 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            const content = extractMessageContent(quoted.message || quoted)
            const messageType = Object.keys(content)[0]
            const mediaMessage = content[messageType]

            const stream = await downloadContentFromMessage(
                mediaMessage,
                messageType.replace('Message', '').toLowerCase()
            )

            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            // DISEÑO MISA CON LETRAS LEGIBLES
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐕𝐢𝐞𝐰𝐎𝐧𝐜𝐞 𝐑𝐞𝐯𝐞𝐚𝐥 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Tipo:* ${messageType.replace('Message', '')}
   > ✿ *Estado:* ¡Contenido revelado!

> 🎀 *Nota:* El contenido ha sido procesado correctamente.

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            if (/video/i.test(messageType)) {
                await conn.sendMessage(chat, { 
                    video: buffer, 
                    caption: caption, 
                    mimetype: 'video/mp4' 
                }, { quoted: m })
            } else if (/image/i.test(messageType)) {
                await conn.sendMessage(chat, { 
                    image: buffer, 
                    caption: caption 
                }, { quoted: m })
            } else if (/audio/i.test(messageType)) {
                await conn.sendMessage(chat, { 
                    audio: buffer, 
                    mimetype: 'audio/ogg; codecs=opus', 
                    ptt: mediaMessage.ptt || false 
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN READVO MISA:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error al intentar revelar el contenido.*\n> [Error: *${e.message}*]` 
            }, { quoted: m })
        }
    }
}

export default readViewOnceMisa
