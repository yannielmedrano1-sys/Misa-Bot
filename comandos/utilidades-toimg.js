import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys'
import pino from 'pino'

/**
 * ꕤ ━━━━━━━━━━ TO IMAGE - 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 ━━━━━━━━━━ ꕤ
 * VERSIÓN ULTRA-DETECCIÓN (BYPASS QUOTED ERROR)
 */

const toImageMisaExtra = {
    name: 'toimg',
    alias: ['toimage', 'img'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- BUSCADOR DE STICKER NIVEL DIOS ---
        // 1. Intentamos obtener el mensaje citado desde todas las rutas posibles
        let quotedMsg = m.quoted ? m.quoted : (m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null)
        
        // 2. Si no hay nada citado, salimos
        if (!quotedMsg) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita que respondas a un sticker.* ✧` 
            }, { quoted: m })
        }

        // 3. Extraemos el cuerpo real del mensaje (limpiamos capas de Baileys)
        let msgBody = quotedMsg.message ? quotedMsg.message : quotedMsg
        let type = getContentType(msgBody)
        
        // 4. Verificamos si realmente hay un sticker ahí dentro
        const isSticker = type === 'stickerMessage' || msgBody?.stickerMessage
        const isImage = type === 'imageMessage' || msgBody?.imageMessage

        if (!isSticker && !isImage) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Eso no es un sticker, Light-kun.* ✧` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // --- DESCARGA MANUAL ---
            // Reconstruimos el objeto para que downloadMediaMessage no se confunda
            const buffer = await downloadMediaMessage(
                { message: msgBody },
                'buffer',
                {},
                { 
                    logger: pino({ level: 'silent' }), 
                    reuploadRequest: conn.updateMediaMessage 
                }
            ).catch(async () => {
                // Segundo intento si el primero falla
                return await conn.downloadMediaMessage(msgBody)
            })

            if (!buffer) throw new Error("No se pudo generar el buffer")

            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐓𝐨 𝐈𝐦𝐚𝐠𝐞 ɞ
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
            console.error("ERROR CRÍTICO TOIMG:", err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude procesar el mensaje citado.\n> *Causa:* El sticker no se ha descargado completamente en tu WhatsApp.` 
            }, { quoted: m })
        }
    }
}

export default toImageMisaExtra
