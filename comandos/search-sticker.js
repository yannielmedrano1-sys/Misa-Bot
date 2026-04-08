import fetch from 'node-fetch'

const stickerlyMisaFinal = {
    name: 'stickerly',
    alias: ['sly', 'pack'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué paquete quieres?*\n\n*Ejemplo:*\n\`${command} milo j\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el paquete con Brayan (es más rápido buscando)
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré ese paquete. ✧' }, { quoted: m })
            }

            const packUrl = searchJson.resultados[0].url

            // 2. EXTRAEMOS LA INFO CON SYLPHY (El JSON que te gustó)
            const sylphyRes = await fetch(`https://sylphy.xyz/download/stickerly?url=${encodeURIComponent(packUrl)}&api_key=sylphy-zkacFeJ`)
            const sylphyJson = await sylphyRes.json()

            // 3. OBTENEMOS EL ARCHIVO CON BRAYAN DETAIL (Evita el 404)
            const detailRes = await fetch(`https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(packUrl)}&key=api-gmnch`)
            const detailJson = await detailRes.json()

            if (!detailJson.status || !detailJson.data.downloadUrl) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* El servidor no pudo generar el archivo. Intenta de nuevo. ✧' }, { quoted: m })
            }

            const s = sylphyJson.status ? sylphyJson.result : detailJson.data
            const fileUrl = detailJson.data.downloadUrl

            const caption = `
✧ ‧₊˚ *STICKERLY PACKAGE* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${s.name || s.title}*
   › ✿ \`Autor\`: *${s.author?.username || s.author}*
   › ✦ \`Cantidad\`: *${s.stickerCount} stickers*
   › ꕤ \`Tipo\`: *${s.isAnimated ? 'Animado' : 'Estático'}*

> Abre el archivo de abajo para añadirlo a tu WhatsApp. ✧

> Powered by 𝓜𝓲𝓼α ♡`.trim()

            // Enviamos la miniatura
            await conn.sendMessage(chat, { 
                image: { url: s.thumbnailUrl }, 
                caption: caption 
            }, { quoted: m })

            // 4. ENVIAMOS EL ARCHIVO (Aquí ya no debería dar 404)
            await conn.sendMessage(chat, {
                document: { url: fileUrl },
                mimetype: 'application/octet-stream',
                fileName: `${(s.name || 'Pack').replace(/[^a-z0-9]/gi, '_')}.exstickerpack`,
                caption: `› ✐  *Paquete listo para 𝓜𝓲𝓼α.*`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR CRITICO:", e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* El servidor de stickers está caído. ✧' }, { quoted: m })
        }
    }
}

export default stickerlyMisaFinal
