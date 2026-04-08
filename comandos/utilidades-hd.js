import { downloadMediaMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const hdMisaFinalBossFixed = {
    name: 'hd',
    alias: ['remini', 'enhance', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid
        
        try {
            // 1. OBTENER EL MENSAJE CORRECTO
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''

            if (!mime || !/image|webp/.test(mime)) {
                return conn.sendMessage(chat, { 
                    text: `> ✐  *No detecto la imagen.* ✧\n> *Responde directamente a una foto.*` 
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. DESCARGA RECONSTRUIDA (Para evitar el error de Media Key)
            let buffer
            try {
                // Intentamos descargar usando el objeto 'q' directamente
                buffer = await downloadMediaMessage(
                    q,
                    'buffer',
                    {},
                    { 
                        logger: pino({ level: 'silent' }),
                        reuploadRequest: conn.updateMediaMessage 
                    }
                )
            } catch (err) {
                // Si falla, intentamos el método de emergencia
                console.log("INTENTANDO MÉTODO DE EMERGENCIA...")
                buffer = await q.download?.()
            }

            if (!buffer) throw new Error("No se pudo obtener el media key del archivo")

            // 3. API DE MEJORA
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

✰ *Estado:* ¡Imagen reconstruida!
   > ✿ *Calidad:* Remini High-Res

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: outputBuffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR CRÍTICO HD:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error de Llave:* No pude procesar esta imagen específica.\n> *Tip:* Prueba reenviando la foto al grupo y respondiendo de nuevo.` 
            }, { quoted: m })
        }
    }
}

export default hdMisaFinalBossFixed
