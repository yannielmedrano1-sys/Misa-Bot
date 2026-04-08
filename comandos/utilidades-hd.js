import fetch from 'node-fetch'

const hdMisaSuperDetector = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid
        
        // --- ESTO ES LO QUE ARREGLA EL "MIME VACÍO" ---
        let q = m.quoted ? m.quoted : m
        
        // Intentamos detectar el MIME de 4 formas distintas para que no falle
        let mime = (q.msg || q).mimetype || 
                   (m.msg || m).mimetype || 
                   q.mediaType || 
                   (m.quoted?.message?.imageMessage?.mimetype) || ''

        console.log("--- DEBUG RECARGADO ---")
        console.log("MIME ENCONTRADO:", mime)

        // 1. SI SIGUE VACÍO, BUSCAMOS MANUALMENTE EN EL MENSAJE CITADO
        if (!mime && m.quoted?.message) {
            const types = Object.keys(m.quoted.message)
            if (types.includes('imageMessage')) mime = 'image/jpeg'
            if (types.includes('stickerMessage')) mime = 'image/webp'
        }

        if (!mime || !mime.includes('image') && !mime.includes('webp')) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *No detecto ninguna imagen.* ✧\n> *Asegúrate de responder directamente a la foto.*` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA FORZADA
            // Si q.download no existe, usamos el método directo de la conexión
            let buffer
            try {
                buffer = await q.download?.()
            } catch {
                buffer = await conn.downloadMediaMessage(q)
            }
            
            if (!buffer) throw new Error("No se pudo descargar el buffer")

            // 3. API DE MEJORA
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const resJson = await response.json()
            const result = JSON.parse(resJson.result)
            const base64Image = result?.image?.b64_json

            if (!base64Image) throw new Error("La API no devolvió imagen")

            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. ENVÍO FINAL
            await conn.sendMessage(chat, { 
                image: outputBuffer, 
                caption: 'ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 ɞ\n> Calidad mejorada con éxito ✧' 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR FINAL HD:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo procesar. Intenta con otra imagen.` }, { quoted: m })
        }
    }
}

export default hdMisaSuperDetector
