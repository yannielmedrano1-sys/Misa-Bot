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
            // Mantenemos tu lógica original de texto
            let textFinal = text || m.quoted?.text

            if (!textFinal) {
                return conn.sendMessage(chat, {
                    text: '› ✐  *Error:* Debes escribir un mensaje o responder a uno. ✧'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 FOTO PERFIL
            const pp = await conn.profilePictureUrl(sender, 'image')
                .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

            // 🔥 NOMBRE (WHATSAPP + DB + FALLBACK)
            const db = global.db?.data || {}
            const user = db.users?.[sender] || {}
            const name = user.name || m.pushName || sender.split('@')[0]

            // 🧠 --- LÓGICA DE REPLY (EL CAMBIO ESTÁ AQUÍ) ---
            let replyMessage = {}
            if (m.quoted) {
                replyMessage = {
                    name: m.quoted.name || m.quoted.sender.split('@')[0],
                    text: m.quoted.text || '',
                    id: 1 // La API a veces necesita un ID interno para mostrar el reply
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
                    replyMessage: replyMessage // <--- Ahora sí lleva info si hay quoted
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

            // Tu comando de ffmpeg original
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" ${output}`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            await conn.sendMessage(chat, {
                sticker: { url: output }
            }, { quoted: m })

            // Limpieza
            if (fs.existsSync(input)) unlinkSync(input)
            if (fs.existsSync(output)) unlinkSync(output)

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("QC ERROR:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await conn.sendMessage(chat, {
                text: '› ✐  *Error:* No se pudo generar el quote con reply. ✧'
            }, { quoted: m })
        }
    }
}

export default qcCommand
