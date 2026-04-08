import { downloadMediaMessage } from '@whiskeysockets/baileys'
import P from 'pino'

const readMisa = {
    name: 'read',
    alias: ['ver', 'readvo', 'revelar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        let quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quotedMsg) return conn.sendMessage(chat, { 
            text: `> ✐  *Debes responder a un mensaje de una sola vez.* ✧` 
        }, { quoted: m })

        // Filtramos el contenido real del ViewOnce
        let content = quotedMsg.viewOnceMessageV2?.message
            || quotedMsg.viewOnceMessage?.message
            || quotedMsg.viewOnceMessageV2Extension?.message
            || quotedMsg

        // Verificamos si realmente es un ViewOnce
        let isVo = Object.values(content).some(v =>
            v?.viewOnce || quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessage
        )

        if (!isVo) return conn.sendMessage(chat, { 
            text: `> ✐  *El mensaje citado no es de una sola vez.* ✧` 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            let type = Object.keys(content)[0]
            let media = content[type]

            // Descarga segura con el logger en silent para no llenar la consola de Sky Ultra
            let buffer = await downloadMediaMessage(
                { message: content },
                'buffer',
                {},
                { logger: P({ level: 'silent' }), reuploadRequest: conn.updateMediaMessage }
            )

            if (!buffer) throw new Error('No se pudo generar el buffer')

            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐕𝐢𝐞𝐰𝐎𝐧𝐜𝐞 𝐑𝐞𝐯𝐞𝐚𝐥 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Tipo:* ${type.replace('Message', '')}
   > ✿ *Estado:* Contenido revelado con éxito.

> 🎀 *Nota:* Ya puedes ver el archivo sin restricciones.

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // Manejo de envío por tipo de archivo
            if (type === 'videoMessage') {
                await conn.sendMessage(chat, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: m })
            } else if (type === 'imageMessage') {
                await conn.sendMessage(chat, { image: buffer, caption }, { quoted: m })
            } else if (type === 'audioMessage') {
                // Si es audio, enviamos el archivo y luego el mensaje de texto con el caption
                await conn.sendMessage(chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: media.ptt || false }, { quoted: m })
                await conn.sendMessage(chat, { text: caption }, { quoted: m })
            } else {
                await conn.sendMessage(chat, { document: buffer, mimetype: 'application/octet-stream', fileName: 'Misa_Reveal.bin' }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '👁️', key: m.key } })

        } catch (e) {
            console.error("💥 MISA VIEW ONCE ERROR:", e.message)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude procesar este mensaje.\n> [Error: *${e.message}*]` 
            }, { quoted: m })
        }
    }
}

export default readMisa
