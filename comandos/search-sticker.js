import fetch from 'node-fetch'

const stickerlyFileCommand = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'getpack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué paquete quieres?*\n\n*Ejemplo:*\n\`${command} milo j\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el paquete para obtener el Link de Sticker.ly
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete. ✧' }, { quoted: m })
            }

            const pack = searchJson.resultados[0]

            // 2. Usamos el endpoint de DETAIL para obtener el archivo descargable (.exstickerpack)
            const detailRes = await fetch(`https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(pack.url)}&key=api-gmnch`)
            const detailJson = await detailRes.json()

            if (!detailJson.status || !detailJson.data.downloadUrl) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No pude generar el archivo del paquete. ✧' }, { quoted: m })
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

            // 3. Enviamos la portada de Misa
            await conn.sendMessage(chat, { image: { url: d.thumbnailUrl || pack.thumbnailUrl }, caption: caption }, { quoted: m })

            // 4. Enviamos el ARCHIVO DEL PAQUETE para agregar directamente
            await conn.sendMessage(chat, {
                document: { url: d.downloadUrl },
                mimetype: 'application/octet-stream', // Esto hace que el cel lo reconozca como archivo de sistema
                fileName: `${d.title || 'Pack'}.exstickerpack`,
                caption: `› ✐  *Paquete de stickers listo.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* Falló la creación del paquete. ✧' }, { quoted: m })
        }
    }
}

export default stickerlyFileCommand
