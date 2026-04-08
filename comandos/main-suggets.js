/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM - 𝓜𝓲𝓼𝓪 𝓑𝓸𝓽 ━━━━━━━━━━ ꕤ
 * Creado para Yanniel - Sky Ultra Panel
 */

const suggestMisaPremium = {
    command: ['sug', 'suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        const sender = m.sender || m.key.participant
        
        // --- VALIDACIÓN DE TEXTO ---
        if (!text || text.length < 15) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Light-kun, tu sugerencia es muy breve.* ✧\n> *Uso:* .sug [explicación detallada de tu idea]` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            // --- GENERADOR DE ID ÚNICO ---
            const sugID = Math.random().toString(36).substring(2, 7).toUpperCase()
            
            // --- DATOS DEL EMISOR ---
            const user = m.pushName || 'Anónimo'
            const pp = await conn.profilePictureUrl(sender, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 𝓡𝓮𝓬𝓲𝓫𝓲𝓭𝓪 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

🆔 *Ticket:* #${sugID}
👤 *Usuario:* ${user}
📱 *Número:* wa.me/${sender.split('@')[0]}

📝 *PROPUESTA:*
"${text.trim()}"

✰ *Estado:* 🟢 Pendiente de revisión
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
> *Misa-Bot: Feedback System*`.trim()

            // --- LISTA DE STAFF (Owners) ---
            // Pon aquí los JID de los que deben recibir las sugerencias
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const jid of staff) {
                await conn.sendMessage(jid, {
                    text: reportMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: `💡 NUEVA IDEA: ${sugID}`,
                            body: `Enviada por: ${user}`,
                            thumbnailUrl: pp,
                            sourceUrl: 'https://github.com/yannielmedrano1-sys/-sky',
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                })
            }

            // --- RESPUESTA AL USUARIO ---
            const confirmMsg = `
> ✐  *¡Sugerencia enviada!* ✧
> Tu ticket es el **#${sugID}**. El Staff lo revisará pronto.

*Gracias por ayudar a que Misa sea más perfecta.*`.trim()

            await conn.sendMessage(chat, { text: confirmMsg }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo entregar la sugerencia.` }, { quoted: m })
        }
    }
}

export default suggestMisaPremium
