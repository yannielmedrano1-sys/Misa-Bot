import fetch from 'node-fetch'

const stickerlyTurbo = {
    name: 'stickerly',
    alias: ['sly', 'pack', 'stkly'],
    category: 'stickers',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { text: `› ✐  *¿Qué stickers quieres?*\n\n*Ejemplo:*\n\`${command} milo j\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📦', key: m.key } })

            // 1. Buscamos el pack con la API de Brayan
            const searchRes = await fetch(`https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`)
            const searchJson = await searchRes.json()

            if (!searchJson.status || !searchJson.resultados.length) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* No encontré nada. ✧' }, { quoted: m })
            }

            const pack = searchJson.resultados[0]
            const packUrl = pack.url

            // 2. Extracción Full con Sylphy
            const sylphyRes = await fetch(`https://sylphy.xyz/download/stickerly?url=${encodeURIComponent(packUrl)}&api_key=sylphy-zkacFeJ`)
            const sylphyJson = await sylphyRes.json()

            if (!sylphyJson.status) {
                return conn.sendMessage(chat, { text: '› ✐  *Error:* Falló la extracción de Sylphy. ✧' }, { quoted: m })
            }

            const data = sylphyJson.result
            const info = `
✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ Pack: *${data.name}*
   › ✿ \`Autor\`: *${data.author.username}*
   › ✦ \`Total\`: *${data.stickerCount} stickers*
   › ꕤ \`Tipo\`: *${data.isAnimated ? 'Animado' : 'Estático'}*

> Enviando ráfaga completa... ¡Disfruta! ♡

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // Enviamos la portada con el branding
            await conn.sendMessage(chat, { image: { url: data.thumbnailUrl }, caption: info }, { quoted: m })

            // 3. MODO TURBO (Sin Delay)
            // Usamos Promise.all para que se manden lo más rápido posible según la conexión del panel
            data.stickers.forEach(async (stk) => {
                await conn.sendMessage(chat, { 
                    sticker: { url: stk.imageUrl } 
                })
            })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error(e)
            await conn.sendMessage(chat, { text: '› ✐  *Error:* Algo salió mal en el modo turbo. ✧' }, { quoted: m })
        }
    }
}

export default stickerlyTurbo
