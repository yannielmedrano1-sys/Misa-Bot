import fetch from 'node-fetch'

const stickerlyPackCommand = {
    name: 'stickerly',
    alias: ['sly', 'packstiker'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) {
            return conn.sendMessage(chat, {
                text: `› ✐  *¿Qué paquete quieres agregar?*\n\n*Ejemplo:*\n\`${command} milo j\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el paquete con la API de Brayan
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete.' }, { quoted: m })
            }

            const pack = searchJson.resultados[0]
            
            // 2. Intentamos obtener el archivo descargable (.exstickerpack o zip)
            // La mayoría de estas APIs generan el archivo al pedir el ID del pack
            const packId = pack.url.split('/s/')[1]
            const downloadUrl = `https://api.vreden.my.id/api/stickerly?id=${packId}` // API de respaldo para el archivo

            const caption = `
✧ ‧₊˚ *STICKERLY PACKAGE* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${pack.name}*
   › ✿ \`Autor\`: *${pack.author}*
   › ✦ \`Cantidad\`: *${pack.stickerCount} stickers*
   › ꕤ \`Estado\`: *${pack.isAnimated ? 'Animado' : 'Estático'}*

> Abre el archivo de abajo para agregarlo a tu WhatsApp. ✧

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // 3. Enviamos la info con la miniatura
            await conn.sendMessage(chat, {
                image: { url: pack.thumbnailUrl },
                caption: caption
            }, { quoted: m })

            // 4. Enviamos el archivo del paquete para que lo agreguen directamente
            await conn.sendMessage(chat, {
                document: { url: downloadUrl },
                mimetype: 'application/octet-stream',
                fileName: `${pack.name}.exstickerpack`,
                caption: `› ✐  *Archivo del paquete listo.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* No se pudo generar el archivo del paquete.' }, { quoted: m })
        }
    }
}

export default stickerlyPackCommand
