/**
 * ꕤ ━━━━━━━━━━ SUGGEST MANUAL - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const suggestMisaFinal = {
    name: 'sug',
    alias: ['suggest', 'sugerencia'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command, prefix }) => {
        const chat = m.key.remoteJid || m.chat
        const senderLid = m.sender || m.key.participant || 'Desconocido'
        
        // --- DIVIDIR TEXTO ---
        // Esperamos: [número] [idea]
        const args = text?.trim().split(' ')
        const numeroAportado = args?.[0]
        const ideaAportada = args?.slice(1).join(' ')

        // Si falta el número o la idea, mandamos el ejemplo
        if (!numeroAportado || !ideaAportada || ideaAportada.length < 5) {
            const ejemplo = `> ✐  *Formato de sugerencia:* ✧\n\n` +
                            `*Uso:* \`${command} [número] [idea]\`\n` +
                            `*Ejemplo:* \`${command} 18492797341 poner más comandos de anime\`\n\n` +
                            `> 💡 *Nota:* No olvides poner el código de país sin espacios.`
            
            return conn.sendMessage(chat, { text: ejemplo }, { quoted: m })
        }

        try {
            await conn.sendMessage(chat, { react: { text: '💡', key: m.key } })

            const sugID = Math.random().toString(36).substring(2, 6).toUpperCase()
            const user = m.pushName || 'Usuario'
            const pp = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')
            
            // Limpiamos el número aportado de símbolos para el link
            const linkNumero = numeroAportado.replace(/[^0-9]/g, '')

            // --- MENSAJE PARA EL STAFF ---
            const reportMsg = `
✧ ‧₊˚ 𝓢𝓾𝓰𝓮𝓻𝓮𝓷𝓬𝓲𝓪 # ${sugID} ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

👤 *Usuario:* ${user}
📱 *Número Provisto:* ${numeroAportado}
🔗 *Chat Directo:* wa.me/${linkNumero}

📝 *Sugerencia:*
> ${ideaAportada}

─── · · · 🗝️ · · · ───
🆔 *LID Técnico:* \`${senderLid}\`
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // TUS NÚMEROS (Owners registrados en Sky Ultra)
            const staff = [
                '18492797341@s.whatsapp.net', 
                '18297677527@s.whatsapp.net'
            ]

            for (const target of staff) {
                await conn.sendMessage(target, {
                    text: reportMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: `💡 SUGERENCIA DE: ${user}`,
                            body: `Número: ${numeroAportado}`,
                            thumbnailUrl: pp,
                            sourceUrl: `https://wa.me/${linkNumero}`,
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }).catch(e => console.log(`Error enviando a staff: ${e}`))
            }

            // Confirmación al usuario
            await conn.sendMessage(chat, { 
                text: `> ✐  *¡Sugerencia enviada!* ✧\n> Gracias, ${user}. Tu propuesta ha sido enviada con el número: **${numeroAportado}**.` 
            }, { quoted: m })
            
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error("ERROR SUGGEST FINAL:", err)
            await conn.sendMessage(chat, { text: `> ✐  *Error:* El Staff no pudo recibir tu mensaje.` }, { quoted: m })
        }
    }
}

export default suggestMisaFinal
