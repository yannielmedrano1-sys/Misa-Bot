import axios from 'axios'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { exec } from 'child_process'

const qcCommand = {
    name: 'qc',
    alias: ['quote'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '✏️ Escribe o responde a un mensaje'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            const quoteObj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#000000',
                width: 512,
                height: 768,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: false,
                    from: { name: sender.split('@')[0] },
                    text: textFinal
                }]
            }

            const res = await axios.post(
                'https://bot.lyo.su/quote/generate',
                quoteObj,
                { headers: { 'Content-Type': 'application/json' } }
            )

            if (!res.data?.result?.image) {
                throw new Error("API no respondió imagen")
            }

            const buffer = Buffer.from(res.data.result.image, 'base64')

            // 🔥 guardar temporal
            const input = path.join(tmpdir(), `qc-${Date.now()}.png`)
            const output = path.join(tmpdir(), `qc-${Date.now()}.webp`)

            writeFileSync(input, buffer)

            // 🔥 CONVERSIÓN REAL A WEBP
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" ${output}`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            // 🔥 enviar sticker real
            await conn.sendMessage(chat, {
                sticker: { url: output }
            }, { quoted: m })

            unlinkSync(input)
            unlinkSync(output)

            await conn.sendMessage(chat, { react: { text: '✔️', key: m.key } })

        } catch (e) {
            console.error("QC ERROR:", e)

            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })

            await conn.sendMessage(chat, {
                text: '❌ Error al crear el sticker (revisa ffmpeg)'
            }, { quoted: m })
        }
    }
}

export default qcCommand
