/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM (ANTI-LID) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const suggestMisaPuroNumero = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- 🛡️ FILTRO ANTI-LID: EXTRAER SOLO EL NÚMERO REAL ---
        let usuarioJid = m.sender || m.key.participant || ''
        
        // Si el Jid contiene "@lid", Baileys suele darnos el número en m.key.participant o m.sender
        // Forzamos la limpieza: buscamos solo los números antes del @
        let numeroPuro = usuarioJid.split('@')[0].split(':')[0]
        
        // Si por alguna razón el ID sigue siendo el LID (empieza por 125), intentamos otra ruta
        if (numeroPuro.startsWith('125') && m.key.participant) {
            numeroPuro = m.key.participant.split('@')[0].split(':')[0]
        }

        if (!text || text.length < 5) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita más detalles.* ✧\n> *Uso:* \`${command} [tu idea aquí]\`` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            const sugID = Math.random().toString(36).substring(2, 6).toUpperCase()
            const user = m.pushName || 'Usuario'
            const pp = await conn.profilePictureUrl(usuarioJid, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            // --- MENSAJE PARA TI (STAFF) ---
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *Usuario:* ${user}
📱 *Número:* ${numeroPuro}
🔗 *Chat:* wa.me/${numeroPuro}

📝 *Sugerencia:*
> ${text.trim()}

✰ *Estado:* 🟢 Pendiente
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
> *Toca el link para hablarle al usuario.*`.trim()

            // TUS NÚMEROS (Owners)
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const jid of staff) {
                await conn.sendMessage(jid, {
                    text: reportMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: `💡 SUGERENCIA DE: ${user}`,
                            body: `Número: ${numeroPuro}`,
                            thumbnailUrl: pp,
                            sourceUrl: `https://wa.me/${numeroPuro}`,
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }).catch(e => console.log(`Error enviando a owner: ${e}`))
            }

            // Confirmación al usuario
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. Tu sugerencia fue enviada con tu número: ${numeroPuro}` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo enviar.` }, { quoted: m })
        }
    }
}

export default suggestMisaPuroNumero
