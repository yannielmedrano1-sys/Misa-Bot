import fetch from 'node-fetch'

const stickerlyMisaFinal = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'stickerpack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { 
            text: `> ✐  *¿Qué paquete buscas hoy?*\n\n*Ejemplo:*\n\`${command} milo j\`` 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el pack con Brayan
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados?.[0]) {
                return conn.sendMessage(chat, { text: '> ✐  *Error:* No encontré ese paquete en Stickerly. ✧' }, { quoted: m })
            }

            const packUrl = searchJson.resultados[0].url
            const packId = packUrl.split('/s/')[1]

            // 2. Detalles con la estructura 'detalles'
            const detailRes = await fetch(`https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(packUrl)}&key=api-gmnch`)
            const detailJson = await detailRes.json()

            if (!detailJson.status || !detailJson.detalles) {
                return conn.sendMessage(chat, { text: '> ✐  *Error:* 𝓜𝓲𝓼𝓪 no pudo obtener los detalles. ✧' }, { quoted: m })
            }

            const d = detailJson.detalles
            const fileUrl = `https://stickerly.pstatic.net/sticker_pack/${packId}/pack.exstickerpack`

            // DISEÑO 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽
            const caption = `
ʚ 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 𝓢𝓽𝓲𝓬𝓴𝓮𝓻𝓼 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Nombre:* ${d.name}
   > ✿ *Autor:* ${d.author?.username || 'Pochis'}
   > ✦ *Cantidad:* ${d.stickerCount} stickers
   > ꕤ *Tipo:* ${d.isAnimated ? 'Animado' : 'Estático'}

> 🎀 *Instrucciones:* Abre el archivo de abajo para agregar todo el paquete a tu WhatsApp de una.

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // Portada
            await conn.sendMessage(chat, { 
                image: { url: d.thumbnailUrl }, 
                caption: caption 
            }, { quoted: m })

            // 3. ENVIÓ DEL PAQUETE (Con el símbolo > corregido)
            await conn.sendMessage(chat, {
                document: { url: fileUrl },
                mimetype: 'application/octet-stream',
                fileName: `${d.name.replace(/[^a-z0-9]/gi, '_')}.exstickerpack`,
                caption: `> ✐  *Paquete listo para 𝓜𝓲𝓼𝓪*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR 𝓜𝓲𝓼𝓪:", e)
            await conn.sendMessage(chat, { text: '> ✐  *Error:* Algo falló en el servidor de 𝓜𝓲𝓼𝓪. ✧' }, { quoted: m })
        }
    }
}

export default stickerlyMisaFinal
