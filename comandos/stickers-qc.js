// BY ABRAHAN-M AND YANNIEL :D
import axios from 'axios'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { exec } from 'child_process'

const qcCommand = {
    name: 'qc',
    alias: ['quote'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid || m.chat
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            // --- DETECCIÓN DE TEXTO (FIXED PARA REPLY) ---
            // 1. Buscamos el texto en lo que el usuario escribió después del comando
            // 2. Si no hay, buscamos en el texto del mensaje citado (m.quoted o contextInfo)
            const quotedMsg = m.quoted ? m.quoted : (m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null)
            const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || m.quoted?.text || ''
            
            let textFinal = text || quotedText

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '> ✐  *Error:* Escribe un mensaje o responde a uno para crear el sticker. ✧'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 FOTO PERFIL (Con fallback de Misa)
            const pp = await conn.profilePictureUrl(sender, 'image')
                .catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')

            // 🔥 NOMBRE
            const name = m.pushName || sender.split('@')[0] || 'User'

            // 🧠 ESTRUCTURA DE MENSAJES PARA LA API
            const obj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#000000',
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: true,
                    from: {
                        id: 1,
                        name: name,
                        photo: { url: pp }
                    },
                    text: textFinal,
                    replyMessage: m.quoted ? {
                        name: m.quoted.pushName || m.quoted.sender?.split('@')[0] || 'User',
                        text: m.quoted.text || '',
                        id: 1
                    } : undefined
                }]
            }

            const res = await axios.post(
                'https://bot.lyo.su/quote/generate',
                obj,
                { headers: { 'Content-Type': 'application/json' } }
            )

            if (!res.data?.result?.image) throw new Error("API Error")

            const buffer = Buffer.from(res.data.result.image, 'base64')
            const input = path.join(tmpdir(), `qc_${Date.now()}.png`)
            const output = path.join(tmpdir(), `qc_${Date.now()}.webp`)

            writeFileSync(input, buffer)

            // FFmpeg optimizado para stickers de WhatsApp
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${output}`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            await conn.sendMessage(chat, { sticker: { url: output } }, { quoted: m })

            // Limpieza de temporales
            if (existsSync(input)) unlinkSync(input)
            if (existsSync(output)) unlinkSync(output)

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("QC ERROR:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, {
                text: '> ✐  *Error:* No pude generar el sticker. Intenta con un texto más corto. ✧'
            }, { quoted: m })
        }
    }
}

export default qcCommand
