import axios from 'axios'

const pinterestMisaFixed = {
    name: 'pin',
    alias: ['pinterest'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        // --- CORRECCIÓN DE JID ---
        const chat = m.key.remoteJid || m.chat
        if (!chat) return 

        if (!text) return conn.sendMessage(chat, { text: "✿ ¿ǫᴜé ǫᴜɪᴇʀᴇs ʙᴜsᴄᴀʀ? ᴇᴊᴇᴍᴘʟᴏ: .pin Misa Amane icon" }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })
            let pinsToSent = []

            // Capa 1: Pinterest V2
            try {
                const resV2 = await axios.get(`https://api.brayanofc.shop/search/pinterestv2?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 10000 })
                if (resV2.data?.status && resV2.data.response?.pins?.length > 0) {
                    pinsToSent = resV2.data.response.pins.slice(0, 5).map(p => ({
                        image: p.media.images.orig.url
                    }))
                }
            } catch (e) { console.log("Capa 1 falló...") }

            // Capa 2: Pinterest V1
            if (pinsToSent.length === 0) {
                try {
                    const resV1 = await axios.get(`https://api.brayanofc.shop/search/pinterest?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 10000 })
                    if (resV1.data?.status && resV1.data.data?.length > 0) {
                        pinsToSent = resV1.data.data.slice(0, 5).map(p => ({
                            image: p.hd
                        }))
                    }
                } catch (e) { console.log("Capa 2 falló...") }
            }

            if (pinsToSent.length === 0) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: "❌ No encontré resultados." }, { quoted: m })
            }

            // --- ENVIAR EL PACK ---
            for (let i = 0; i < pinsToSent.length; i++) {
                const pin = pinsToSent[i]
                const caption = i === 0 ? `✧ ‧₊˚ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃 𝚂𝙴𝙰𝚁𝙲𝙷* ୧ֹ˖ ⑅ ࣪⊹\n⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n› ✰ \`Búsqueda\`: *${text}*\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡` : ""

                await conn.sendMessage(chat, { 
                    image: { url: pin.image }, 
                    caption: caption 
                }, { quoted: m })
                
                // Pequeña espera de 1 segundo entre fotos para evitar el error de JID/Relay
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR PIN:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
        }
    }
}

export default pinterestMisaFixed
