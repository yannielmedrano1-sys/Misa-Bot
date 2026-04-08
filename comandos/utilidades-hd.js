import fetch from 'node-fetch'

const hdMisaFinalBoss = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid
        
        // --- DEPURACIÓN (Míralo en tu consola de Sky Ultra) ---
        console.log("--- DEBUG MISA HD ---")
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        console.log("MIME DETECTADO:", mime)
        // -----------------------------------------------------

        // 1. VALIDACIÓN MANUAL (Si no hay mime, intentamos forzar la detección)
        if (!mime || !mime.includes('image')) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *No detecto ninguna imagen.* ✧\n> *Uso:* Responde a una foto con el comando *hd*.` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA DEL BUFFER
            // Usamos una descarga más compatible con diferentes versiones de Baileys
            const buffer = await q.download?.() || await conn.downloadMediaMessage(q)
            
            if (!buffer) {
                return conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo obtener el archivo de imagen.*` }, { quoted: m })
            }

            // 3. PROCESO CON LA API
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const resText = await response.text()
            let json
            try {
                json = JSON.parse(resText)
            } catch (e) {
                throw new Error("Respuesta de API inválida")
            }

            const result = JSON.parse(json.result)
            const base64Image = result?.image?.b64_json

            if (!base64Image) throw new Error("No hay imagen en la respuesta")

            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. DISEÑO MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Mejora completada! ✧

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: outputBuffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN HD:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* El servidor de mejora está saturado. Intenta con otra foto.` 
            }, { quoted: m })
        }
    }
}

export default hdMisaFinalBoss
