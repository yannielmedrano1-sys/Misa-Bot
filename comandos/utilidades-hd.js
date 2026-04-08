import fetch from 'node-fetch'

const hdMisaDetector = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, command }) => {
        const chat = m.key.remoteJid
        
        // --- DETECTOR ULTRA-SENSIBLE ---
        // Buscamos en el mensaje citado (m.quoted) o en el mensaje directo (m)
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        // Si no detecta nada, revisamos si es una imagen dentro de un mensaje de "view once" o similares
        if (!mime && q.msg && q.msg.mimetype) mime = q.msg.mimetype

        // 1. VALIDACIÓN
        if (!/image\/(jpe?g|png|webp)/.test(mime)) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *No detecto ninguna imagen.* ✧\n> *Consejo:* Responde directamente a una foto o sticker con *${usedPrefix + command}*.` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA
            const buffer = await q.download?.()
            if (!buffer) return conn.sendMessage(chat, { text: `> ✐  *Error al descargar la imagen.*` }, { quoted: m })

            // 3. PROCESO DE MEJORA (VectorInk API)
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const json = await response.json()
            if (!json.result) throw new Error("API Fallida")
            
            const result = JSON.parse(json.result)
            const base64Image = result.image.b64_json
            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. ENVÍO ESTILO MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Mejora completa! ✧
   > ✿ *Calidad:* Ultra HD

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: outputBuffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR HD:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { text: `> ✐  *Error:* El servidor de mejora no respondió. Intenta de nuevo.` }, { quoted: m })
        }
    }
}

export default hdMisaDetector
