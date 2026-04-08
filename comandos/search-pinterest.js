import axios from 'axios'

const pinterestMisaAlbum = {
    name: 'pin',
    alias: ['pinterest'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid || m.chat
        if (!chat) return 

        if (!text) return conn.sendMessage(chat, { text: "✿ ¿ǫᴜé ǫᴜɪᴇʀᴇs ʙᴜsᴄᴀʀ? ᴇᴊᴇᴍᴘʟᴏ: .pin Misa Amane icon" }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })
            let pinsToSent = []

            // --- RECOLECCIÓN DE IMÁGENES ---
            try {
                const resV2 = await axios.get(`https://api.brayanofc.shop/search/pinterestv2?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 10000 })
                if (resV2.data?.status && resV2.data.response?.pins?.length > 0) {
                    pinsToSent = resV2.data.response.pins.slice(0, 5).map(p => p.media.images.orig.url)
                }
            } catch { 
                try {
                    const resV1 = await axios.get(`https://api.brayanofc.shop/search/pinterest?query=${encodeURIComponent(text)}&key=api-gmnch`, { timeout: 10000 })
                    if (resV1.data?.status && resV1.data.data?.length > 0) {
                        pinsToSent = resV1.data.data.slice(0, 5).map(p => p.hd)
                    }
                } catch { console.log("Fallo total de APIs") }
            }

            if (pinsToSent.length === 0) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: "❌ No encontré resultados." }, { quoted: m })
            }

            // --- 1. ENVIAMOS LA INFO PRIMERO ---
            const infoCaps = `
ʚ 𝐌𝐢𝐬𝐚 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Búsqueda:* ${text}
✿ *Cantidad:* 5 Imágenes encontradas

> *Enviando álbum...* ♡`.trim()

            await conn.sendMessage(chat, { text: infoCaps }, { quoted: m })

            // --- 2. ENVIAMOS LAS IMÁGENES JUNTAS ---
            for (const url of pinsToSent) {
                await conn.sendMessage(chat, { 
                    image: { url: url }
                    // Sin caption para que se vean compactas
                })
                // Delay mínimo para que no se crucen pero vayan rápido
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR PIN ALBUM:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
        }
    }
}

export default pinterestMisaAlbum
