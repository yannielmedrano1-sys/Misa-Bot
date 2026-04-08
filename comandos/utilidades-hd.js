import fetch from 'node-fetch'

const hdMisaBruteForce = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid
        
        // --- BUSCADOR DE IMAGEN EN ESTRUCTURA CRUDA ---
        let msg = m.quoted ? m.quoted : m
        let quotedMsg = m.msg?.contextInfo?.quotedMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        
        // Intentamos extraer el mensaje de imagen de cualquier rincón
        let imageMsg = msg.imageMessage || 
                       msg.stickerMessage || 
                       quotedMsg?.imageMessage || 
                       quotedMsg?.stickerMessage || 
                       m.message?.imageMessage

        let mime = imageMsg?.mimetype || ''

        console.log("--- DEBUG DE ESTRUCTURA ---")
        console.log("¿Hay ImageMessage?:", !!imageMsg)
        console.log("MIME REAL:", mime)

        // 1. VALIDACIÓN
        if (!imageMsg || (!mime.includes('image') && !mime.includes('webp'))) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa no detecta la imagen.* ✧\n> *Nota:* Asegúrate de responder a una foto directamente.` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA MANUAL (Usando el mediaKey si es necesario)
            // Intentamos descargar el mensaje que encontramos (imageMsg)
            const buffer = await conn.downloadMediaMessage({
                message: m.quoted ? quotedMsg : m.message
            }).catch(() => null) || await m.quoted?.download?.()
            
            if (!buffer) {
                return conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo descargar el archivo del servidor de WhatsApp.*` }, { quoted: m })
            }

            // 3. API VECTOR INK
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const resJson = await response.json()
            const result = JSON.parse(resJson.result || '{}')
            const base64Image = result?.image?.b64_json

            if (!base64Image) throw new Error("API_ERROR")

            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. DISEÑO FINAL MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Mejora exitosa!
   > ✿ *Calidad:* Remini Style

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: outputBuffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR HD:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { text: `> ✐  *Error:* Intenta con otra imagen o revisa si el bot tiene permisos de descarga.` }, { quoted: m })
        }
    }
}

export default hdMisaBruteForce
