import fetch from 'node-fetch'

const stickerSearchCommand = {
    name: 'stickersearch',
    alias: ['stisearch', 'stickerly'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) {
            return conn.sendMessage(chat, {
                text: `› ✐  *¿Qué stickers buscas?*\n\n*Ejemplo:*\n\`${command} milo j\``
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            const endpoint = `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`
            const res = await fetch(endpoint)
            const json = await res.json()

            if (!json.status || !json.resultados || json.resultados.length === 0) {
                return conn.sendMessage(chat, {
                    text: '› ✐  *Error:* No encontré paquetes de stickers con ese nombre. ✧'
                }, { quoted: m })
            }

            // Tomamos los primeros 10 resultados para no saturar el chat
            const resultados = json.resultados.slice(0, 10)
            
            let txt = `✧ ‧₊˚ *STICKERLY SEARCH* ୧ֹ˖ ⑅ ࣪⊹\n`
            txt += `⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n\n`

            for (let i = 0; i < resultados.length; i++) {
                const s = resultados[i]
                txt += `✰ *${i + 1}.* ${s.name}\n`
                txt += `   › ✿ \`Autor\`: *${s.author}*\n`
                txt += `   › ✦ \`Stickers\`: *${s.stickerCount}*\n`
                txt += `   › ꕤ \`Tipo\`: *${s.isAnimated ? 'Animado' : 'Estático'}*\n`
                txt += `   › ❖ \`Link\`: *${s.url}*\n\n`
            }

            txt += `> Powered by 𝓜𝓲𝓼𝓪 ♡`

            // Enviamos el mensaje con la miniatura del primer resultado para que se vea pro
            await conn.sendMessage(chat, {
                image: { url: resultados[0].thumbnailUrl },
                caption: txt.trim()
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("STICKER SEARCH ERROR:", e)
            await conn.sendMessage(chat, {
                text: '› ✐  *Error:* El servidor de stickers no responde. ✧'
            }, { quoted: m })
        }
    }
}

export default stickerSearchCommand
