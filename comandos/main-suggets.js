import { jidDecode } from '@whiskeysockets/baileys'

/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM (LID DECODER) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const suggestMisaAntiLid = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- 🛡️ DECODIFICADOR MAESTRO PARA ELIMINAR EL LID ---
        const decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {}
                return decode.user && decode.server && decode.user + '@' + decode.server || jid
            } else return jid
        }

        // Obtenemos el JID real decodificado (esto quita el LID y deja el número)
        const jidReal = decodeJid(m.sender || m.key.participant || '')
        const numeroPuro = jidReal.split('@')[0]
        
        if (!text || text.length < 5) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa necesita más detalles.* ✧\n> *Uso:* \`${command} [tu idea aquí]\`` 
            }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            const sugID = Math.random().toString(36).substring(2, 6).toUpperCase()
            const user = m.pushName || 'Usuario'
            const pp = await conn.profilePictureUrl(jidReal, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            // --- MENSAJE PARA EL STAFF (OWNERS) ---
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *Usuario:* ${user}
📱 *Número:* ${numeroPuro}
🔗 *Chat Directo:* wa.me/${numeroPuro}

📝 *Sugerencia:*
> ${text.trim()}

✰ *Estado:* 🟢 Pendiente
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
> *Misa ha decodificado el número con éxito.*`.trim()

            // TUS NÚMEROS (Owners)
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const target of staff) {
                await conn.sendMessage(target, {
                    text: reportMsg,
                    contextInfo: {
                        mentionedJid: [jidReal],
                        externalAdReply: {
                            title: `💡 IDEA DE: ${user}`,
                            body: `Número: ${numeroPuro}`,
                            thumbnailUrl: pp,
                            sourceUrl: `https://wa.me/${numeroPuro}`,
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }).catch(e => console.log(`Error enviando a staff: ${e}`))
            }

            // Confirmación al usuario
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. Tu mensaje llegó al Staff desde tu número: ${numeroPuro}` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* No se pudo enviar.` }, { quoted: m })
        }
    }
}

export default suggestMisaAntiLid
