import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import pino from 'pino'

const hdMisaFinalBossFixed = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid || m.chat
        
        try {
            // 1. DETECCIÓN DEL CONTENIDO (PIXEL COMPATIBLE)
            // Buscamos el mensaje citado desde la raíz por si m.quoted viene vacío
            const quotedMsg = m.quoted ? m.quoted : (m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null)
            
            // Si no hay citado, usamos el mensaje actual (por si envió la foto con el comando en el caption)
            let target = quotedMsg ? (quotedMsg.message ? quotedMsg.message : quotedMsg) : m.message
            
            // Extraemos el tipo y el mimetype
            const type = Object.keys(target)[0]
            const mime = (target[type]?.mimetype || target.mimetype || '')

            if (!/image|webp/.test(mime)) {
                return conn.sendMessage(chat, { 
                    text: `> ✐  *Misa no ve ninguna imagen aquí.* ✧\n> *Responde a una foto o envía una con el comando.*` 
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA BLINDADA
            let buffer = await downloadMediaMessage(
                { message: target },
                'buffer',
                {},
                { 
                    logger: pino({ level: 'silent' }), 
                    reuploadRequest: conn.updateMediaMessage 
                }
            )

            if (!buffer) throw new Error("No se pudo obtener el buffer")

            // 3. API DE MEJORA (REMINI)
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            if (!response.ok) throw new Error("Fallo en la conexión con la API")

            const resJson = await response.json()
            // La API devuelve un string JSON dentro de result, hay que parsearlo
            const result = JSON.parse(resJson.result || '{}')
            const base64Image = result?.image?.b64_json

            if (!base64Image) throw new Error("La API no devolvió una imagen")
            
            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. DISEÑO MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Imagen reconstruida!
   > ✿ *Calidad:* Remini High-Res

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                image: outputBuffer, 
                caption: caption 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR CRÍTICO HD MISA:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error de Procesamiento.* ✧\n> *Nota:* La API puede estar saturada. Intenta de nuevo en unos segundos.` 
            }, { quoted: m })
        }
    }
}

export default hdMisaFinalBossFixed
