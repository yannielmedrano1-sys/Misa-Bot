import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'

const reminiMisa = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        // 1. VALIDACIÓN DE IMAGEN
        if (!/image\/(jpe?g|png|webp)/.test(mime)) return conn.sendMessage(chat, { 
            text: `> ✐  *Por favor, responde a una imagen para mejorar su calidad.* ✧` 
        }, { quoted: m })

        try {
            // Reacción de espera
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA Y PREPARACIÓN
            const buffer = await q.download()
            const { ext } = await fileTypeFromBuffer(buffer)
            
            // 3. LLAMADA A LA API DE MEJORA
            const imageData = buffer.toString('base64')
            const response = await fetch('https://us-central1-vector-ink.cloudfunctions.net/upscaleImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { image: imageData } })
            })

            const json = await response.json()
            const result = JSON.parse(json.result)
            const base64Image = result.image.b64_json

            if (!base64Image) throw new Error("No se recibió la imagen mejorada")

            // Convertir resultado a Buffer
            const outputBuffer = Buffer.from(base64Image, 'base64')

            // 4. DISEÑO FINAL MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Imagen optimizada!
   > ✿ *Formato:* PNG (Alta Calidad)

> 🎀 *Nota:* La resolución ha sido aumentada artificialmente.

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                image: outputBuffer, 
                caption: caption 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR REVENTADO EN HD:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error al procesar la imagen.*\n> [Detalle: *Servidor de mejora saturado*]` 
            }, { quoted: m })
        }
    }
}

export default reminiMisa
