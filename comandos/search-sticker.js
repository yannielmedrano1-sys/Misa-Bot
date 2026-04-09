/* * 👑 Stickerly Downloader para Misa-Bot
 * Fix: Error de m.reply
 * Autor: Yanniel & Gemini
 */
import axios from 'axios'

const slyCommand = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'stickerpack'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const prefijo = usedPrefix || ''

        // Función interna para reemplazar m.reply y evitar el error
        const reply = (texto) => conn.sendMessage(chat, { text: texto }, { quoted: m })

        if (!text) {
            return reply(`🖤 *¿Qué paquete buscamos hoy?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Milo J\``)
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 1. BUSCAR EL PAQUETE
            const searchUrl = `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`
            const { data: sData } = await axios.get(searchUrl)
            
            if (!sData.status || !sData.resultados.length) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return reply('> ✐ No encontré ningún paquete con ese nombre.')
            }

            const pack = sData.resultados[0]

            // 2. OBTENER EL ARCHIVO .WASTICKERS (Para el botón de añadir)
            const dlUrl = `https://api.brayanofc.shop/dl/stickerly?url=${encodeURIComponent(pack.url)}&key=api-gmnch`
            let packFile = null
            try {
                const { data: dData } = await axios.get(dlUrl)
                packFile = dData.result || dData.url || dData.data?.url
            } catch (e) {
                console.log("Error obteniendo el archivo descargable.")
            }

            // 3. ENVIAR INFO ESTÉTICA
            const infoText = `✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹\n⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n\n✰ \`Nombre\`: *${pack.name}*\n   › 👤 \`Autor\`: *${pack.author}*\n   › 📦 \`Stickers\`: *${pack.stickerCount}*\n\n> 📥 *Descarga el archivo de abajo para añadirlo a tu WhatsApp.*\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: infoText,
                contextInfo: {
                    externalAdReply: {
                        title: pack.name,
                        body: '𝓜𝓲𝓼𝓪 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝘽𝙤𝙩 🖤',
                        thumbnailUrl: pack.thumbnailUrl,
                        sourceUrl: pack.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 4. ENVIAR EL PAQUETE FÍSICO
            if (packFile) {
                await conn.sendMessage(chat, {
                    document: { url: packFile },
                    mimetype: 'application/octet-stream',
                    fileName: `${pack.name}.wastickers`,
                    caption: `> 🖤 *Aquí tienes el paquete listo.*`
                }, { quoted: m })
            } else {
                reply('> ⚠️ No pude generar el archivo .wastickers, pero puedes usar el link de arriba.')
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error('[Stickerly Error]:', err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply('> ✐ Hubo un error crítico al procesar el paquete.')
        }
    }
}

export default slyCommand
