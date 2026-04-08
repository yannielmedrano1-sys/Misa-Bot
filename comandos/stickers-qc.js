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
            // El texto del sticker es lo que escribes o el texto del mensaje que respondes
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '› ✐  *Error:* Debes escribir un mensaje o responder a uno. ✧'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 FOTO PERFIL DEL DUEÑO DEL QC
            const pp = await conn.profilePictureUrl(sender, 'image')
                .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

            // 🔥 NOMBRE DEL DUEÑO
            const db = global.db?.data || {}
            const user = db.users?.[sender] || {}
            const name = user.name || m.pushName || sender.split('@')[0]

            // 🧠 --- LÓGICA DE REPLY (EL RECUADRO DE ARRIBA) ---
            let replyMessage = {}
            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = m.quoted
                replyMessage = {
                    name: quoted.name || quoted.sender.split('@')[0], // Nombre del que respondes
                    text: quoted.text || '', // Texto del que respondes
                    chatId: quoted.sender.split('@')[0]
                }
            }

            const quoteObj = {
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
                    replyMessage: replyMessage // Aquí se inyecta el mensaje respondido
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
            const input = path.join(tmpdir(), `qc-${Date.now()}.png`)
            const output = path.join(tmpdir(), `qc-${Date.now()}.webp`)

            writeFileSync(input, buffer)

            // Usamos FFmpeg para convertirlo en sticker con el tamaño correcto
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=pix_fmt=yuva420p" ${output}`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            await conn.sendMessage(chat, {
                sticker: { url: output }
            }, { quoted: m })

            // Limpieza de archivos temporales
            unlinkSync(input)
            unlinkSync(output)

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("QC ERROR:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, {
                text: '› ✐  *Error:* No se pudo generar el sticker. ✧'
            }, { quoted: m })
        }
    }
}

export default qcCommand
