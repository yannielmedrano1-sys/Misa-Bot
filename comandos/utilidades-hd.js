/* * 👑 HD / Upscaler para Misa-Bot
 * Mejora la calidad de tus imágenes con IA
 * Autor: Yanniel & Gemini
 */
import axios from 'axios'

const hdCommand = {
    name: 'hd',
    alias: ['remini', 'upscale', 'mejorar'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { text, args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        
        // Función reply segura para pixel.js
        const reply = (texto) => conn.sendMessage(chat, { text: texto }, { quoted: m })

        // 1. Configuración de métodos y escala
        let method = 1
        let size = 'low'

        if (args[0] && ['1', '2', '3', '4'].includes(args[0])) {
            method = parseInt(args[0])
            if (method === 1) size = 'low'
            else if (method === 2) size = 'medium'
            else if (method === 3 || method === 4) size = 'high'
        }

        // 2. Validación de imagen (Directa o respondida)
        const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message
        const mime = q?.imageMessage?.mimetype || q?.documentMessage?.mimetype || ''

        if (!/image/.test(mime)) {
            return reply(`✧ ‧₊˚ *UPSCALER IA* ୧ֹ˖ ⑅ ࣪⊹\n\n> ✐ *Responde a una imagen para mejorar su calidad.*\n\n> 💡 *Tip:* Puedes usar \`${usedPrefix + command} 2\` para mayor potencia.`)
        }

        await conn.sendMessage(chat, { react: { text: '🕔', key: m.key } })

        try {
            // 3. Descargar la imagen
            const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
            const messageType = q.imageMessage ? 'image' : 'document'
            const stream = await downloadContentFromMessage(q[messageType + 'Message'], messageType)
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            await conn.sendMessage(chat, { react: { text: '✨', key: m.key } })

            // 4. Función de mejora (Ihancer API)
            const ihancer = async (imgBuffer, opts = {}) => {
                const FormData = (await import('form-data')).default
                const form = new FormData()
                form.append('method', opts.method.toString())
                form.append('is_pro_version', 'false')
                form.append('is_enhancing_more', 'false')
                form.append('max_image_size', opts.size)
                form.append('file', imgBuffer, { filename: `misa_${Date.now()}.jpg`, contentType: 'image/jpeg' })

                const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
                    headers: {
                        ...form.getHeaders(),
                        'accept-encoding': 'gzip',
                        'user-agent': 'Dart/3.5 (dart:io)'
                    },
                    responseType: 'arraybuffer',
                    timeout: 60000
                })
                return Buffer.from(data)
            }

            const enhancedBuffer = await ihancer(buffer, { method, size })

            // 5. Formato Estético de Misa
            const infoHD = `✧ ‧₊˚ *IMAGE ENHANCED* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ \`Método\`: *${method}x*
   › 📊 \`Calidad\`: *${size.toUpperCase()}*
   › 🤖 \`IA\`: *Ihancer Engine*

> ⚡ *Imagen optimizada con éxito.*
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, {
                image: enhancedBuffer,
                caption: infoHD
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error('Error en HD:', e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ \`Error:\` La IA está saturada, intenta en un momento.`)
        }
    }
}

export default hdCommand
