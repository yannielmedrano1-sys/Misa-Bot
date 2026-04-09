/* * 👑 Stickerly Pack Downloader para Misa-Bot
 * Envía Info + Archivo .wastickers instalable
 * Autor: Yanniel & Gemini
 */
import axios from 'axios'

const slyCommand = {
    name: 'stickerly',
    alias: ['sly', 'stickerpack', 'pack'],
    category: 'downloader',
    noPrefix: true,

    run: async (conn, m, { text, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const prefijo = usedPrefix || ''

        if (!text) return conn.sendMessage(chat, { text: `🖤 *¿Qué paquete buscamos hoy?*\n\n> ✐ *Ejemplo:* \`${prefijo + command} Milo J\`` }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            // 1. BUSCAR EL PAQUETE (Usamos la API de búsqueda que ya tienes)
            const searchUrl = `https://api.brayanofc.shop/stickerly/search?query=${encodeURIComponent(text)}&key=api-gmnch`
            const searchRes = await axios.get(searchUrl)
            
            if (!searchRes.data.status || !searchRes.data.resultados.length) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: '> ✐ No encontré nada con ese nombre.' }, { quoted: m })
            }

            const pack = searchRes.data.resultados[0] // El más relevante

            // 2. ENVIAR LA INFO ESTÉTICA
            const infoText = `✧ ‧₊˚ *STICKERLY PACK* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ \`Nombre\`: *${pack.name}*
   › 👤 \`Autor\`: *${pack.author}*
   › 📦 \`Cantidad\`: *${pack.stickerCount}*
   › 🎞️ \`Tipo\`: *${pack.isAnimated ? 'Animado 🎞️' : 'Estático 🖼️'}*

> ⏳ *Preparando archivo del paquete...*
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: infoText,
                contextInfo: {
                    externalAdReply: {
                        title: pack.name,
                        body: '𝓜𝓲𝓼𝓪 𝙎𝙩𝙞𝙘𝙠𝙚𝙧 𝘽𝙤𝙩 🖤',
                        thumbnailUrl: pack.thumbnailUrl,
                        sourceUrl: pack.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            // 3. OBTENER EL ARCHIVO DEL PAQUETE (.wastickers)
            // Usamos la ruta de descarga de BrayanOFC
            const dlUrl = `https://api.brayanofc.shop/dl/stickerly?url=${encodeURIComponent(pack.url)}&key=api-gmnch`
            const dlRes = await axios.get(dlUrl)
            
            // La API de descarga suele devolver un campo 'result' con el link del archivo
            const packFile = dlRes.data.result || dlRes.data.data?.url 

            if (!packFile) {
                return conn.sendMessage(chat, { text: '> ✐ No pude generar el archivo del paquete, pero puedes usar el link de arriba.' }, { quoted: m })
            }

            // 4. ENVIAR EL PAQUETE COMO DOCUMENTO
            await conn.sendMessage(chat, {
                document: { url: packFile },
                mimetype: 'application/octet-stream', // MIME necesario para paquetes de stickers
                fileName: `${pack.name}.wastickers`,
                caption: `> 🖤 *Aquí tienes tu paquete:* ${pack.name}\n> *Ábrelo con la app de Stickerly o súbelo directamente.*`
            }, { quoted: m })

            return await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return conn.sendMessage(chat, { text: '> ✐ Hubo un error crítico al procesar el paquete.' }, { quoted: m })
        }
    }
}

export default slyCommand
