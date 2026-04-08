import fetch from 'node-fetch'

const stickerlyPackCommand = {
    name: 'stickerly',
    alias: ['sly', 'packstiker', 'stickerpack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) {
            return conn.sendMessage(chat, {
                text: `› ✐  *¿Qué paquete quieres descargar?*\n\n*Ejemplo:*\n\`${command} milo j\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el paquete para obtener el ID/Link
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete.' }, { quoted: m })
            }

            const pack = searchJson.resultados[0]
            const packUrl = pack.url // Link tipo https://sticker.ly/s/XXXXX

            // 2. Obtenemos el detalle y el archivo descargable con la nueva API
            const detailRes = await fetch(`https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(packUrl)}&key=api-gmnch`)
            const detailJson = await detailRes.json()

            if (!detailJson.status) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No pude obtener el archivo del paquete.' }, { quoted: m })
            }

            const d = detailJson.data
            
            const caption = `
✧ ‧₊˚ *STICKERLY PACKAGE* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${d.title || pack.name}*
   › ✿ \`Autor\`: *${d.author || pack.author}*
   › ✦ \`Cantidad\`: *${d.stickerCount || pack.stickerCount} stickers*
   › ꕤ \`Estado\`: *${d.isAnimated ? 'Animado' : 'Estático'}*

> Abre el archivo de abajo para añadirlo a tu WhatsApp. ✧

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // 3. Enviamos la miniatura con la info
            await conn.sendMessage(chat, {
                image: { url: d.thumbnailUrl || pack.thumbnailUrl },
                caption: caption
            }, { quoted: m })

            // 4. Enviamos el archivo .exstickerpack para instalación directa
            await conn.sendMessage(chat, {
                document: { url: d.downloadUrl },
                mimetype: 'application/octet-stream',
                fileName: `${d.title || 'Pack'}.exstickerpack`,
                caption: `› ✐  *Paquete listo para instalar.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("STICKERLY DETAIL ERROR:", e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* El servidor de stickers no responde. ✧' }, { quoted: m })
        }
    }
}

export default stickerlyPackCommand
