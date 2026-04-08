/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM (DIRECT CONTACT) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const suggestMisaDirect = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- LIMPIEZA DE NÚMERO (Para hablar directo) ---
        // Extraemos el sender y quitamos el @s.whatsapp.net o el @lid
        const sender = m.sender || m.key.participant || ''
        const numeroLimpio = sender.split('@')[0].split(':')[0] // Quitamos puertos o sub-IDs
        const jidReal = numeroLimpio + '@s.whatsapp.net' // Forzamos formato estándar para chatear
        
        if (!text || text.length < 5) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita más detalles.* ✧\n> *Uso:* \`${command} [tu idea aquí]\`` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            const sugID = Math.random().toString(36).substring(2, 6).toUpperCase()
            const user = m.pushName || 'Usuario'
            const pp = await conn.profilePictureUrl(sender, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            // --- MENSAJE PARA EL STAFF (Tú y Félix) ---
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *De:* ${user}
📱 *Número:* @${numeroLimpio}
🔗 *Chat directo:* https://wa.me/${numeroLimpio}

📝 *Sugerencia:*
> ${text.trim()}

✰ *Estado:* 🟢 Pendiente
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
> *Toca el número o el link para responderle.*`.trim()

            // LISTA DE DUEÑOS
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const jid of staff) {
                await conn.sendMessage(jid, {
                    text: reportMsg,
                    contextInfo: {
                        mentionedJid: [jidReal], // Menciona al usuario para que su número sea clicable
                        externalAdReply: {
                            title: `💡 IDEA DE: ${user}`,
                            body: `Click aquí para chatear con él`,
                            thumbnailUrl: pp,
                            sourceUrl: `https://wa.me/${numeroLimpio}`,
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }).catch(e => console.log(`Error enviando a staff: ${e}`))
            }

            // Confirmación al usuario
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. El Staff se pondrá en contacto contigo si es necesario.` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST DIRECT:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* El Staff no pudo recibir tu mensaje.` }, { quoted: m })
        }
    }
}

export default suggestMisaDirect
