import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys'
import pino from 'pino'

/**
 * ꕤ ━━━━━━━━━━ TO IMAGE - 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 ━━━━━━━━━━ ꕤ
 */

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'img'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- VALIDACIÓN DE MENSAJE CITADO ---
        const quoted = m.quoted ? m.quoted : (m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null)
        
        if (!quoted) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita que respondas a un sticker.* ✧` 
            }, { quoted: m })
        }

        // Detectamos el tipo de contenido citado
        const quotedType = getContentType(quoted)
        
        // Solo permitimos stickerMessage o imageMessage
        if (quotedType !== "stickerMessage" && quotedType !== "imageMessage") {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Eso no es un sticker, Light-kun.* ✧` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // --- DESCARGA DEL BUFFER ---
            // Usamos la estructura simplificada para que Baileys no se confunda de participante
            const buffer = await downloadMediaMessage(
                { message: quoted },
                'buffer',
                {},
                { 
                    logger: pino({ level: 'silent' }), 
                    reuploadRequest: conn.updateMediaMessage 
                }
            )

            if (!buffer) throw new Error("No se pudo generar el buffer")

            // --- DISEÑO FINAL MISA ---
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
                text: `> ✐  *Error:* No pude procesar el archivo.\n> *Nota:* Si es un sticker animado, usa el comando de video.` 
            }, { quoted: m })
        }
    }
}

export default toImageMisa
