import axios from 'axios'

const pinterestMisa = {
    name: 'pin',
    alias: ['pinterest'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        if (!text) return conn.sendMessage(m.chat, { text: "✿ ¿ǫᴜé ǫᴜɪᴇʀᴇs ʙᴜsᴄᴀʀ? ᴇᴊᴇᴍᴘʟᴏ: .pin Misa Amane icon" }, { quoted: m })

        try {
            await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
            let pinsToSent = []

            // --- CAPA 1: Pinterest V2 ---
            try {
                const resV2 = await axios.get(`https://api.brayanofc.shop/search/pinterestv2?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 15000 })
                if (resV2.data?.status && resV2.data.response?.pins?.length > 0) {
                    pinsToSent = resV2.data.response.pins.slice(0, 5).map(p => ({
                        image: p.media.images.orig.url,
                        author: p.uploader?.full_name || "Pinterest"
                    }))
                }
            } catch (e) { console.log("Capa 1 falló...") }

            // --- CAPA 2: Pinterest V1 ---
            if (pinsToSent.length === 0) {
                try {
                    const resV1 = await axios.get(`https://api.brayanofc.shop/search/pinterest?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 15000 })
                    if (resV1.data?.status && resV1.data.data?.length > 0) {
                        pinsToSent = resV1.data.data.slice(0, 5).map(p => ({
                            image: p.hd,
                            author: p.full_name || "Pinterest"
                        }))
                    }
                } catch (e) { console.log("Capa 2 falló...") }
            }

            // --- CAPA 3: Nexy ---
            if (pinsToSent.length === 0) {
                try {
                    const { data: resNexy } = await axios.get(`https://api.nexylight.xyz/search/pinterest?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (resNexy.status && resNexy.data?.length > 0) {
                        pinsToSent = resNexy.data.slice(0, 5).map(p => ({
                            image: p.image,
                            author: p.pinner || "Pinterest"
                        }))
                    }
                } catch (e) { console.log("Capa 3 falló...") }
            }

            if (pinsToSent.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(m.chat, { text: "❌ No encontré resultados para esa búsqueda." }, { quoted: m })
            }

            // --- ENVIAR EL PACK DE 5 ---
            for (let i = 0; i < pinsToSent.length; i++) {
                const pin = pinsToSent[i]
                
                // Diseño Misa solo en la primera imagen para no spamear texto
                const caption = i === 0 ? `
✧ ‧₊˚ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝚂𝙴𝙰𝚁𝙲𝙷* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ✰ \`Búsqueda\`: *${text}*
› ✿ \`Resultados\`: *5 fotos*

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim() : ""

                await conn.sendMessage(m.chat, { 
                    image: { url: pin.image }, 
                    caption: caption 
                }, { quoted: m })
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR PIN:", e)
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
        }
    }
}

export default pinterestMisa
