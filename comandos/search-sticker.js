import fetch from 'node-fetch'

const stickerlySylphyPack = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'getpack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué paquete quieres?*\n\n*Ejemplo:*\n\`${command} milo j\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el pack para obtener la URL base
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete. ✧' }, { quoted: m })
            }

            const packUrl = searchJson.resultados[0].url
            const packId = packUrl.split('/s/')[1] // Sacamos el ID para el archivo directo

            // 2. Usamos Sylphy para sacar la info estética y confirmar el pack
            const sylphyRes = await fetch(`https://sylphy.xyz/download/stickerly?url=${encodeURIComponent(packUrl)}&api_key=sylphy-zkacFeJ`)
            const sylphyJson = await sylphyRes.json()

            if (!sylphyJson.status) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* Sylphy no pudo procesar el pack. ✧' }, { quoted: m })
            }

            const data = sylphyJson.result
            
            // Construimos el link de descarga directa del PAQUETE COMPLETO
            // Sticker.ly usa esta estructura para sus archivos oficiales
            const directDownload = `https://stickerly.pstatic.net/sticker_pack/${packId}/pack.exstickerpack`

            const caption = `
✧ ‧₊˚ *STICKERLY PACKAGE* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${data.name}*
   › ✿ \`Autor\`: *${data.author.username}*
   › ✦ \`Cantidad\`: *${data.stickerCount} stickers*
   › ꕤ \`Tipo\`: *${data.isAnimated ? 'Animado' : 'Estático'}*

> Abre el archivo de abajo para añadir el paquete completo. ✧

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // 3. Enviamos la portada del pack
            await conn.sendMessage(chat, { 
                image: { url: data.thumbnailUrl }, 
                caption: caption 
            }, { quoted: m })

            // 4. Enviamos el ARCHIVO ÚNICO (.exstickerpack)
            await conn.sendMessage(chat, {
                document: { url: directDownload },
                mimetype: 'application/octet-stream',
                fileName: `${data.name.replace(/[^a-z0-9]/gi, '_')}.exstickerpack`,
                caption: `› ✐  *Paquete listo para agregar.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '> ✐  *Error:* Algo falló con el servidor. ✧' }, { quoted: m })
        }
    }
}

export default stickerlySylphyPack
