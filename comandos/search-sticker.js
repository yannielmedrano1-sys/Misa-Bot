import fetch from 'node-fetch'

const stickerlyMisaFinal = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'getpack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué paquete quieres?*\n\n*Ejemplo:*\n\`${command} milo j\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el pack para obtener la URL
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete. ✧' }, { quoted: m })
            }

            const packUrl = searchJson.resultados[0].url

            // 2. Usamos Sylphy para la info (que es más detallada)
            const sylphyRes = await fetch(`https://sylphy.xyz/download/stickerly?url=${encodeURIComponent(packUrl)}&api_key=sylphy-zkacFeJ`)
            const sylphyJson = await sylphyRes.json()

            // 3. Usamos Brayan Detail para el LINK DE DESCARGA (más estable para archivos)
            const detailRes = await fetch(`https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(packUrl)}&key=api-gmnch`)
            const detailJson = await detailRes.json()

            if (!sylphyJson.status && !detailJson.status) {
                throw new Error("Ambas APIs fallaron")
            }

            const data = sylphyJson.result || detailJson.data
            const downloadUrl = detailJson.data?.downloadUrl || `https://api.vreden.my.id/api/stickerly?id=${packUrl.split('/s/')[1]}`

            const caption = `
✧ ‧₊˚ *STICKERLY PACKAGE* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${data.name || data.title}*
   › ✿ \`Autor\`: *${data.author?.username || data.author}*
   › ✦ \`Cantidad\`: *${data.stickerCount} stickers*
   › ꕤ \`Tipo\`: *${data.isAnimated ? 'Animado' : 'Estático'}*

> Abre el archivo de abajo para añadirlo a tu WhatsApp. ✧

> Powered by 𝓜𝓲𝓼α ♡`.trim()

            // Enviamos la portada
            await conn.sendMessage(chat, { 
                image: { url: data.thumbnailUrl }, 
                caption: caption 
            }, { quoted: m })

            // Enviamos el ARCHIVO (.exstickerpack)
            await conn.sendMessage(chat, {
                document: { url: downloadUrl },
                mimetype: 'application/octet-stream',
                fileName: `${(data.name || 'Pack').replace(/[^a-z0-9]/gi, '_')}.exstickerpack`,
                caption: `› ✐  *Paquete listo para 𝓜𝓲𝓼α.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN STICKERLY:", e)
            await conn.sendMessage(chat, { 
                text: '› ✐  *Error:* El servidor de descargas está saturado. Intenta de nuevo en un momento. ✧\n\n> Powered by 𝓜𝓲𝓼α ♡' 
            }, { quoted: m })
        }
    }
}

export default stickerlyMisaFinal
