import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys'
import pino from 'pino'

/**
 * ꕤ ━━━━━━━━━━ TO IMAGE - 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 ━━━━━━━━━━ ꕤ
 * Versión con Detección Profunda para Yanniel
 */

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'img'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- DETECTOR ULTRA-SENSIBLE ---
        // Intentamos obtener el mensaje citado de todas las rutas posibles en el JSON de Baileys
        let quoted = m.quoted ? m.quoted : (m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null)
        
        // Si el quoted es el mensaje completo, extraemos solo el contenido del mensaje
        let messageContent = quoted?.message ? quoted.message : quoted

        // Buscamos específicamente el stickerMessage
        let stickerMsg = messageContent?.stickerMessage || m.msg?.stickerMessage
        
        // Si no hay sticker, buscamos si es una imagen
        let imageMsg = messageContent?.imageMessage || m.msg?.imageMessage

        if (!stickerMsg && !imageMsg) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita que respondas a un sticker.* ✧\n> *Asegúrate de que el sticker cargue bien antes de responder.*` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // --- DESCARGA SEGURO ---
            // Reconstruimos el objeto para que la función de descarga no se pierda
            const buffer = await downloadMediaMessage(
                { message: messageContent },
                'buffer',
                {},
                { 
                    logger: pino({ level: 'silent' }), 
                    reuploadRequest: conn.updateMediaMessage 
                }
            )

            if (!buffer) throw new Error("Buffer vacío")

            const caption = `
✧ ‧₊˚ *𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚃𝙾 𝙸𝙼𝙶* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Conversión exitosa!
   > ✿ *Tipo:* Sticker ➔ JPEG

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, {
                image: buffer,
                caption: caption
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '📸', key: m.key } })

        } catch (err) {
            console.error("ERROR TOIMG MISA:", err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude extraer la imagen.\n> *Nota:* Intenta reenviar el sticker y responderle de nuevo.` 
            }, { quoted: m })
        }
    }
}

export default toImageMisa
