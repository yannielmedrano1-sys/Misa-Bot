// BY ABRAHAN-M 

import fetch from 'node-fetch'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { exec } from 'child_process'

const emojimixCommand = {
    name: 'emojimix',
    alias: ['emix'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid
        const sender = m.sender || m.key.participant || m.key.remoteJid

        try {
            if (!text || !text.includes('+')) {
                return conn.sendMessage(chat, {
                    text: `✨ *Combina emojis*\n\n📌 Ejemplo:\n\`emojimix 😎+🔥\``
                }, { quoted: m })
            }

            let [emoji1, emoji2] = text.split('+').map(e => e.trim())

            if (!emoji1 || !emoji2) {
                return conn.sendMessage(chat, {
                    text: '❌ Debes usar 2 emojis\nEjemplo: 😎+🔥'
                }, { quoted: m })
            }

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            // 🔥 nombre PRO
            const db = global.db?.data || {}
            const user = db.users?.[sender] || {}

            const name = user.name || m.pushName || sender.split('@')[0]
            const packname = user.metadatos || '✨ Emojis Mix'
            const author = user.metadatos2 || `@${name}`

            const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`

            const res = await fetch(url)
            const json = await res.json()

            if (!json.results || json.results.length === 0) {
                throw new Error('No se encontraron combinaciones 😢')
            }

            for (let result of json.results.slice(0, 3)) {
                const buffer = Buffer.from(await (await fetch(result.url)).arrayBuffer())

                const input = path.join(tmpdir(), `emix-${Date.now()}.png`)
                const output = path.join(tmpdir(), `emix-${Date.now()}.webp`)

                writeFileSync(input, buffer)

                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" ${output}`, (err) => {
                        if (err) reject(err)
                        else resolve()
                    })
                })

                await conn.sendMessage(chat, {
                    sticker: { url: output }
                }, { quoted: m })

                unlinkSync(input)
                unlinkSync(output)
            }

            await conn.sendMessage(chat, { react: { text: '✔️', key: m.key } })

        } catch (e) {
            console.error("EMOJIMIX ERROR:", e)

            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })

            await conn.sendMessage(chat, {
                text: `❌ Error al combinar emojis\n📌 ${e.message}`
            }, { quoted: m })
        }
    }
}

export default emojimixCommand
        
