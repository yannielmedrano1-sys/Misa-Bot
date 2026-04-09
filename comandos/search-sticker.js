/* * 👑 Stickerly Pack Downloader (Fix Error)
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
                return conn.sendMessage(chat, { text: '❌ No encontré resultados.' }, { quoted: m })
            }

            const pack = sData.resultados[0]

            // 2. OBTENER EL ARCHIVO (Aquí es donde ajustamos el path)
            // Intentamos obtener el archivo descargable
            const dlUrl = `https://api.brayanofc.shop/dl/stickerly?url=${encodeURIComponent(pack.url)}&key=api-gmnch`
            
            let packFile = null
            try {
                const { data: dData } = await axios.get(dlUrl)
                // Ajusta esto según lo que responda la API de Brayan (puede ser .result o .url)
                packFile = dData.result || dData.url || dData.data?.url
            } catch (e) {
                console.log("Error en paso de descarga, procediendo solo con info.")
            }

            // 3. ENVIAR INFO
            const infoText = `✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Nombre\`: *${pack.name}*\n   › 👤 \`Autor\`: *${pack.author}*\n   › 📦 \`Cantidad\`: *${pack.stickerCount}*\n\n> 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: infoText,
                contextInfo: {
                    externalAdReply: {
                        title: pack.name,
                        body: 'Click para ver en Sticker.ly 🖤',
                        thumbnailUrl: pack.thumbnailUrl,
                        sourceUrl: pack.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 4. ENVIAR EL ARCHIVO SI EXISTE
            if (packFile) {
                await conn.sendMessage(chat, {
                    document: { url: packFile },
                    mimetype: 'application/octet-stream',
                    fileName: `${pack.name}.wastickers`,
                    caption: `> 🖤 *Pack listo para instalar.*`
                }, { quoted: m })
                await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
            } else {
                // Si no hay archivo, avisamos pero dejamos la info
                await conn.sendMessage(chat, { text: `> ⚠️ *Nota:* No pude generar el archivo .wastickers, pero puedes instalarlo desde el link de arriba.` }, { quoted: m })
            }

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            m.reply('✐ Hubo un problema con la API. Intenta de nuevo.')
        }
    }
}

export default slyCommand
