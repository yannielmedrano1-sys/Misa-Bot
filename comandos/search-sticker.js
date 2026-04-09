/* * 👑 Stickerly Explorer para Misa-Bot
 * Autor: Yanniel & Gemini
 */
import axios from 'axios'

const slyCommand = {
    name: 'stickerly',
    alias: ['sly', 'pack'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        if (!text) return m.reply(`🖤 *¿Qué stickers buscamos?*\n> Ejemplo: ${usedPrefix + command} Milo J`)

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 1. BUSQUEDA INICIAL
            const searchUrl = `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`
            const { data: sData } = await axios.get(searchUrl)
            
            if (!sData.status || !sData.resultados.length) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return m.reply('> ✐ No encontré nada.')
            }

            const packFound = sData.resultados[0]

            // 2. OBTENER DETALLES (Usando la nueva API que pasaste)
            const detailUrl = `https://api.brayanofc.shop/stickerly/detail?url=${encodeURIComponent(packFound.url)}&key=api-gmnch`
            const { data: dData } = await axios.get(detailUrl)
            
            if (!dData.status) {
                return m.reply('> ✐ Error al obtener detalles del paquete.')
            }

            const info = dData.detalles
            const stickers = info.stickers // Array de imágenes

            // 3. ENVIAR FICHA TÉCNICA
            let caption = `✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹\n\n`
            caption += `✰ \`Nombre\`: *${info.name}*\n`
            caption += `   › 👤 \`Autor\`: *${info.author.name}* (@${info.author.username})\n`
            caption += `   › 📦 \`Cantidad\`: *${info.stickerCount}*\n`
            caption += `   › 📊 \`Vistas\`: *${info.viewCount.toLocaleString()}*\n\n`
            caption += `> 📥 *Link de descarga:* ${info.url}\n\n`
            caption += `> 𝓜𝓲𝓼𝓪 ♡`

            await conn.sendMessage(chat, { 
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: info.name,
                        body: `By ${info.author.name}`,
                        thumbnailUrl: info.thumbnailUrl,
                        sourceUrl: info.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 4. ENVIAR UNA MUESTRA DE STICKERS (Opcional: manda los primeros 3)
            if (stickers && stickers.length > 0) {
                const limit = Math.min(stickers.length, 3) 
                for (let i = 0; i < limit; i++) {
                    await conn.sendMessage(chat, { 
                        sticker: { url: stickers[i].imageUrl } 
                    })
                }
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            m.reply('✐ Hubo un error procesando la solicitud.')
        }
    }
}

export default slyCommand
