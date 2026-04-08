import { downloadMediaMessage } from '@whiskeysockets/baileys'
import pino from 'pino'

/**
 * ꕤ ━━━━━━━━━━ TO IMAGE (PIXEL COMPATIBLE) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const toImageMisaPixel = {
    name: 'toimg',
    alias: ['toimage', 'img'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- RECONSTRUCCIÓN DEL MENSAJE CITADO (PARA TU HANDLER) ---
        // Buscamos el contenido del mensaje al que respondes dentro del contextInfo
        const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        
        // Verificamos si lo que citaste tiene un sticker
        const sticker = quotedMessage?.stickerMessage
        const image = quotedMessage?.imageMessage

        if (!sticker && !image) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita que respondas a un sticker.* ✧` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // --- DESCARGA DEL CONTENIDO ---
            // Creamos una estructura "fake" que Baileys entienda para bajar el archivo
            const buffer = await downloadMediaMessage(
                { 
                    message: quotedMessage // Le pasamos el mensaje citado completo
                },
                'buffer',
                {},
                { 
                    logger: pino({ level: 'silent' }), 
                    reuploadRequest: conn.updateMediaMessage 
                }
            )

            if (!buffer) throw new Error("Buffer nulo")

            // --- DISEÑO MISA ---
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
            console.error("ERROR TOIMG PIXEL:", err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude procesar el sticker citado.\n> *Nota:* Algunos stickers pesados de canales no se pueden convertir.` 
            }, { quoted: m })
        }
    }
}

export default toImageMisaPixel
