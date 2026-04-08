// BY ABRAHAN-M AND YANNIEL :D

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
            // El texto que irá en el sticker
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '›✐  *Error:* Escribe algo o responde a un texto. ✧'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 FOTO PERFIL
            const pp = await conn.profilePictureUrl(sender, 'image')
                .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

            // 🔥 NOMBRE
            const name = m.pushName || sender.split('@')[0]

            // 🧠 --- LÓGICA DE RECUADRO (REPLY) ---
            let messages = [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: name,
                    photo: { url: pp }
                },
                text: textFinal,
                replyMessage: {} 
            }]

            // Si el usuario está respondiendo a alguien...
            if (m.quoted) {
                messages[0].replyMessage = {
                    name: m.quoted.name || m.quoted.sender.split('@')[0],
                    text: m.quoted.text || '',
                    chatId: parseInt(m.quoted.sender.split('@')[0]) || 1
                }
            }

            const quoteObj = {
                type: 'quote',
                format: 'png',
                backgroundColor: '#000000',
                width: 512,
                height: 768,
                scale: 2,
                messages: messages
            }

            const res = await axios.post(
                'https://bot.lyo.su/quote/generate',
                quoteObj,
                { headers: { 'Content-Type': 'application/json' } }
            )

            const buffer = Buffer.from(res.data.result.image, 'base64')
            const input = path.join(tmpdir(), `qc-${Date.now()}.png`)
            const output = path.join(tmpdir(), `qc-${Date.now()}.webp`)

            writeFileSync(input, buffer)

            // FFmpeg para hacerlo sticker transparente y rápido
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" ${output}`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            await conn.sendMessage(chat, { sticker: { url: output } }, { quoted: m })

            unlinkSync(input)
            unlinkSync(output)
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* La API no pudo procesar el quote. ✧' }, { quoted: m })
        }
    }
}

export default qcCommand
