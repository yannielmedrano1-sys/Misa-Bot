import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const hdMisaVersionFinal = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid
        
        try {
            // 1. UBICAR EL MENSAJE CON MEDIA
            let msg = m.quoted ? m.quoted : m
            let quotedMsg = m.msg?.contextInfo?.quotedMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage
            
            // Extraer el contenido real de la imagen
            let imageContent = m.message?.imageMessage || 
                               m.message?.stickerMessage || 
                               quotedMsg?.imageMessage || 
                               quotedMsg?.stickerMessage || 
                               msg.imageMessage

            if (!imageContent) {
                return conn.sendMessage(chat, { 
                    text: `> ✐  *No detecto la imagen.* ✧\n> *Asegúrate de responder directamente a una foto.*` 
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA CORRECTA (Usando la función importada de Baileys)
            const buffer = await downloadMediaMessage(
                m.quoted ? { message: quotedMsg } : m,
                'buffer',
                {},
                { 
                    reuploadRequest: conn.updateMediaMessage 
                }
            )

            if (!buffer) throw new Error("No se pudo generar el buffer de imagen")

            // 3. API DE MEJORA (VectorInk)
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const resJson = await response.json()
            const result = JSON.parse(resJson.result || '{}')
            const base64Image = result?.image?.b64_json

            if (!base64Image) throw new Error("La API no devolvió una imagen válida")

            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. DISEÑO MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Mejora exitosa!
   > ✿ *Calidad:* Remini Style

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: outputBuffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR HD MISA:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No se pudo procesar la imagen.\n> *Detalle:* ${e.message}` 
            }, { quoted: m })
        }
    }
}

export default hdMisaVersionFinal
