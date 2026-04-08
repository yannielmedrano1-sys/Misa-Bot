import fetch from 'node-fetch'

const ssWebMisa = {
    name: 'ssweb',
    alias: ['ss', 'screenshot'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid
        
        if (!text) return conn.sendMessage(chat, { 
            text: `> ✐  *Por favor, ingrese el Link de una página.*\n\n*Ejemplo:*\n\`${command} google.com\`` 
        }, { quoted: m })

        try {
            await conn.sendMessage(chat, { react: { text: '📸', key: m.key } })

            // Ajustamos el link si no trae el protocolo
            let url = text.startsWith('http') ? text : `https://${text}`
            
            // Obtenemos la captura de thum.io
            let res = await fetch(`https://image.thum.io/get/fullpage/${url}`)
            let buffer = await res.buffer()

            if (!res.ok) throw new Error('No se pudo obtener la captura')

            const caption = `
ʚ 𝓜𝓲𝓼𝓪 𝓢𝓢 𝓦𝓮𝓫 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Link:* ${url}
   > ✿ *Estado:* Captura generada con éxito.

> 🎀 *Nota:* Si la página es muy pesada, puede tardar un poco más en cargar.

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // Enviamos la imagen con tu formato
            await conn.sendMessage(chat, { 
                image: buffer, 
                caption: caption 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN SSWEB:", e)
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude capturar la pantalla de esa web.\n> [Error: *${e.message}*]` 
            }, { quoted: m })
        }
    }
}

export default ssWebMisa
