/**
 * ꕤ ━━━━━━━━━━ SUGGEST SYSTEM (LID EDITION) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const suggestMisaLid = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid || m.chat
        
        // --- EXTRACCIÓN DE IDENTIDADES (NÚMERO Y LID) ---
        const sender = m.sender || m.key.participant || ''
        const lid = m.key.participant || m.sender // En Baileys moderno, el participant suele traer el LID si existe
        const numero = sender.split('@')[0]
        
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
            
            // --- MENSAJE PARA EL STAFF ---
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *De:* ${user}
📞 *Número:* wa.me/${numero}
🆔 *LID:* \`${lid}\`

📝 *PROPUESTA:*
> ${text.trim()}

✰ *Estado:* 🟢 Pendiente de Revisión
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // LISTA DE DUEÑOS
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
                            body: `ID: ${lid.split('@')[0]}`,
                            thumbnailUrl: pp,
                            sourceUrl: 'https://github.com/yannielmedrano1-sys/-sky',
                            mediaType: 1
                        }
                    }
                }).catch(e => console.log(`Error enviando a staff: ${e}`))
            }

            // Confirmación al usuario
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. Tu ticket es el **#${sugID}**.\n\n> *Tu LID ha sido registrado:* \`${lid}\`` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST LID:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* El Staff no pudo recibir tu mensaje.` }, { quoted: m })
        }
    }
}

export default suggestMisaLid
