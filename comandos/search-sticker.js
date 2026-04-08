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

            // 🔥 Soporte para múltiples estructuras posibles
            const results =
                json.resultados ||
                json.results ||
                json.result ||
                json.data ||
                []

            if (!Array.isArray(results) || results.length === 0) {
                throw new Error('No encontré paquetes con ese nombre')
            }

            const pack = results[0]

            const packUrl =
                pack.url ||
                pack.link ||
                pack.packUrl ||
                pack.stickerUrl

            if (!packUrl) {
                throw new Error('La API no devolvió URL del paquete')
            }

            const match = packUrl.match(/\/s\/([^/?]+)/)
            const packId = match?.[1]

            if (!packId) {
                throw new Error('No se pudo obtener el ID del pack')
            }

            const fileUrl = `https://stickerly.pstatic.net/sticker_pack/${packId}/pack.exstickerpack`

            const packName =
                pack.name ||
                pack.title ||
                'Sticker Pack'

            const author =
                pack.author?.username ||
                pack.author ||
                'Desconocido'

            const thumb =
                pack.thumbnailUrl ||
                pack.thumbnail ||
                pack.image ||
                null

            const caption = `📦 *PAQUETE ENCONTRADO*

📝 Nombre: ${packName}
👤 Autor: ${author}

✨ Abre el archivo para agregar el pack a WhatsApp`

            if (thumb) {
                await conn.sendMessage(chat, {
                    image: { url: thumb },
                    caption
                }, { quoted: m })
            }

            await conn.sendMessage(chat, {
                document: { url: fileUrl },
                mimetype: 'application/octet-stream',
                fileName: `${packName.replace(/[^a-z0-9]/gi, '_')}.exstickerpack`
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
