/* * 👑 Stickerly Pack Downloader (Direct Add)
 * Autor: Yanniel & Gemini
 */
import axios from 'axios'

const slyCommand = {
    name: 'stickerly',
    alias: ['sly', 'pack'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        if (!text) return m.reply(`🖤 *¿Qué paquete buscamos?*\n> Ejemplo: ${usedPrefix + command} Milo J`)

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 1. BUSCAR EL PAQUETE
            const searchUrl = `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`
            const { data: sData } = await axios.get(searchUrl)
            
            if (!sData.status || !sData.resultados.length) {
                return m.reply('❌ No encontré resultados.')
            }

            const packFound = sData.resultados[0]

            // 2. OBTENER EL PACK (WASTICKERS)
            // Usamos la API de descarga para obtener el archivo físico .wastickers
            const dlUrl = `https://api.brayanofc.shop/dl/stickerly?url=${encodeURIComponent(packFound.url)}&key=api-gmnch`
            const { data: dData } = await axios.get(dlUrl)
            
            const packFile = dData.result || dData.url || dData.data?.url

            // 3. ENVIAR INFO ESTÉTICA
            const infoText = `✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Nombre\`: *${packFound.name}*\n   › 👤 \`Autor\`: *${packFound.author}*\n   › 📦 \`Cantidad\`: *${packFound.stickerCount}*\n\n> 📥 *Descarga el archivo de abajo para añadirlo.*`.trim()

            await conn.sendMessage(chat, { 
                text: infoText,
                contextInfo: {
                    externalAdReply: {
                        title: packFound.name,
                        body: '𝓜𝓲𝓼𝓪 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝘽𝙤𝙩 🖤',
                        thumbnailUrl: packFound.thumbnailUrl,
                        sourceUrl: packFound.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 4. ENVIAR EL PAQUETE PARA "AÑADIR"
            if (packFile) {
                await conn.sendMessage(chat, {
                    document: { url: packFile },
                    mimetype: 'application/octet-stream', 
                    fileName: `${packFound.name}.wastickers`,
                    caption: `> 🖤 *Toca para instalar el paquete completo.*`
                }, { quoted: m })
            } else {
                m.reply('⚠️ No pude generar el archivo, usa el link de la info.')
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            m.reply('✐ Error al procesar el paquete.')
        }
    }
}

export default slyCommand
