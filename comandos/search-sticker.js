// BY ABRAHAN-M

import fetch from 'node-fetch'

const stickerlyCommand = {
    name: 'stickerly',
    alias: ['sly', 'pack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid

        if (!text) {
            return conn.sendMessage(chat, {
                text: `📦 *¿Qué paquete buscas?*\n\nEjemplo:\n\`${command} gatos\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, {
                react: { text: '📦', key: m.key }
            })

            const res = await fetch(
                `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-RfQ9E`
            )

            const json = await res.json()

            if (!json.status || !json.resultados?.length) {
                throw new Error('No encontré paquetes con ese nombre')
            }

            const pack = json.resultados[0]

            const match = pack.url.match(/\/s\/([^/?]+)/)
            const packId = match?.[1]

            if (!packId) {
                throw new Error('No se pudo obtener el ID del pack')
            }

            const fileUrl = `https://stickerly.pstatic.net/sticker_pack/${packId}/pack.exstickerpack`

            const caption = `📦 *PAQUETE ENCONTRADO*

📝 Nombre: ${pack.name || 'Sin nombre'}
👤 Autor: ${pack.author?.username || 'Desconocido'}

✨ Abre el archivo para agregar el pack a WhatsApp`

            if (pack.thumbnailUrl) {
                await conn.sendMessage(chat, {
                    image: { url: pack.thumbnailUrl },
                    caption
                }, { quoted: m })
            }

            await conn.sendMessage(chat, {
                document: { url: fileUrl },
                mimetype: 'application/octet-stream',
                fileName: `${(pack.name || 'pack').replace(/[^a-z0-9]/gi, '_')}.exstickerpack`
            }, { quoted: m })

            await conn.sendMessage(chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (e) {
            console.error('STICKERLY ERROR:', e)

            await conn.sendMessage(chat, {
                text: `❌ Error al obtener el paquete\n📌 ${e.message}`
            }, { quoted: m })
        }
    }
}

export default stickerlyCommand
