import { downloadMediaMessage } from '@whiskeysockets/baileys'
import axios from 'axios'
import pino from 'pino'

const hdMisaBrayanAPI = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        try {
            // 1. OBTENER EL CONTENIDO (FOTO O STICKER)
            const quotedMsg = m.quoted ? m.quoted : (m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null)
            let target = quotedMsg ? (quotedMsg.message ? quotedMsg.message : quotedMsg) : m.message
            
            const type = Object.keys(target)[0]
            const mime = (target[type]?.mimetype || target.mimetype || '')

            if (!/image|webp/.test(mime)) {
                return conn.sendMessage(chat, { 
                    text: `> ✐  *Misa necesita una imagen para mejorar.* ✧\n> *Responde a una foto o sticker.*` 
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA DEL BUFFER
            let buffer = await downloadMediaMessage(
                { message: target },
                'buffer',
                {},
                { logger: pino({ level: 'silent' }), reuploadRequest: conn.updateMediaMessage }
            )

            if (!buffer) throw new Error("No se pudo obtener el archivo.")

            // 3. ENVIAR A LA API DE BRAYAN (Upscale)
            // Usamos FormData para enviar el buffer directamente
            const FormData = (await import('form-data')).default
            const form = new FormData()
            form.append('image', buffer, { filename: 'remini.jpg' })

            const res = await axios.post('https://api.brayanofc.shop/tools/upscale', form, {
                headers: { 
                    ...form.getHeaders(),
                    'Accept': 'application/json'
                },
                responseType: 'arraybuffer' // Recibimos la imagen mejorada directamente en buffer
            })

            if (!res.data) throw new Error("La API no devolvió datos.")

            // 4. DISEÑO FINAL MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Imagen reconstruida!
   > ✿ *Calidad:* 4K Ultra High-Res

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                image: Buffer.from(res.data), 
                caption: caption 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR HD BRAYAN API:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude mejorar la imagen.\n> *Nota:* Intenta con una imagen que no sea tan pesada.` 
            }, { quoted: m })
        }
    }
}

export default hdMisaBrayanAPI
