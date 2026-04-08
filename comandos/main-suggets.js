/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM - 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 ━━━━━━━━━━ ꕤ
 */

const suggestMisaPixel = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true, // Esto permite que funcione escribiendo solo "sug"

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        const sender = m.sender || m.key.participant || m.key.remoteJid
        
        // 1. Verificamos si hay texto (usando el 'text' que viene del handler)
        if (!text || text.length < 5) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita más detalles.* ✧\n> *Uso:* \`${command} [tu idea aquí]\`` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            // Generar ID de ticket
            const sugID = Math.random().toString(36).substring(2, 6).toUpperCase()
            const user = m.pushName || 'Usuario'
            
            // Foto de perfil
            const pp = await conn.profilePictureUrl(sender, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *De:* ${user}
📱 *Número:* wa.me/${sender.split('@')[0]}

📝 *PROPUESTA:*
> ${text.trim()}

✰ *Estado:* 🟢 Enviado al Staff
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // LISTA DE DUEÑOS (Asegúrate que estos números sean correctos)
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const jid of staff) {
                await conn.sendMessage(jid, {
                    text: reportMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: `💡 IDEA DE: ${user}`,
                            body: `Ticket: #${sugID}`,
                            thumbnailUrl: pp,
                            sourceUrl: 'https://github.com/yannielmedrano1-sys/-sky',
                            mediaType: 1
                        }
                    }
                }).catch(e => console.log(`Error enviando a owner: ${e}`))
            }

            // Confirmación al chat
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. Tu ticket es el **#${sugID}**.` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* El Staff no pudo recibir tu mensaje.` }, { quoted: m })
        }
    }
}

export default suggestMisaPixel
