import axios from 'axios'

const getJsonMisaTextOnly = {
    name: 'get',
    alias: ['fetch', 'getjson'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid || m.chat
        if (!chat) return

        if (!text) return conn.sendMessage(chat, { 
            text: "✿ ¡Light-kun! Pásame la URL del JSON. ✨" 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // Realizamos la petición con un User-Agent para evitar bloqueos
            const { data } = await axios.get(text.trim(), { 
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })

            // Convertimos el objeto a texto con sangría de 2 espacios
            const jsonText = JSON.stringify(data, null, 2)

            // Enviamos siempre como texto (usando bloques de código ``` para que se vea ordenado)
            await conn.sendMessage(chat, { 
                text: "```" + jsonText + "```" 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR EN FETCH MISA:", err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            
            // Si el error tiene respuesta de la API, la mostramos, si no, el mensaje de error básico
            const detail = err.response ? `${err.response.status} ${err.response.statusText}` : err.message
            
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error al obtener el JSON:* \n> ${detail}` 
            }, { quoted: m })
        }
    }
}

export default getJsonMisaTextOnly
