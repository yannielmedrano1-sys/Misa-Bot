import axios from 'axios'

const lyricsMisa = {
    name: 'lyrics',
    alias: ['letra', 'lirik'],
    category: 'search',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        if (!text) return conn.sendMessage(chat, { 
            text: `> ✐  *Light-kun, dime el nombre de la canción.* ✧\n> *Ejemplo:* ${m.prefix + command} Neverita Bad Bunny` 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // --- PETICIÓN A LA API ---
            const apiKey = 'sylphy-zkacFeJ'
            const url = `https://sylphy.xyz/search/lyrics?title=${encodeURIComponent(text)}&api_key=${apiKey}`
            
            const { data } = await axios.get(url)

            if (!data.status || !data.result) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { text: `> ✐  *No encontré la letra de esa canción.*` }, { quoted: m })
            }

            const res = data.result

            // --- DISEÑO MISA LYRICS ---
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐋𝐲𝐫𝐢𝐜𝐬 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✿ *Título:* ${res.title}
✿ *Artista:* ${res.artist}
✿ *Álbum:* ${res.album || 'Desconocido'}
✿ *Duración:* ${res.duration || '--:--'}

*˚.⋆ֹ　 ꒰ 𝙻 𝙴 𝚃 𝚁 𝙰 ꒱ㆍ₊⊹*
${res.lyrics}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: caption 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '🎶', key: m.key } })

        } catch (err) {
            console.error("ERROR LYRICS MISA:", err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* La API de letras no respondió correctamente.` 
            }, { quoted: m })
        }
    }
}

export default lyricsMisa
