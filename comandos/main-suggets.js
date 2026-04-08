/**
 * ꕤ ━━━━━━━━━━ REPORT & SUGGEST - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const reportMisa = {
    command: ['report', 'reporte', 'sug', 'suggest'],
    category: 'info',
    noPrefix: true,

    run: async (conn, m, { text, command, prefix }) => {
        const chat = m.key.remoteJid || m.chat
        const texto = text?.trim()
        const sender = m.sender || m.key.participant || m.key.remoteJid
        
        // --- SISTEMA DE COOLDOWN (Usando base de datos o variable temporal) ---
        // Si no tienes DB configurada, esto evitará que colapsen el bot
        if (!global.db) global.db = { data: { users: {} } }
        if (!global.db.data.users[sender]) global.db.data.users[sender] = {}
        
        const now = Date.now()
        const cooldown = global.db.data.users[sender].sugCooldown || 0
        const restante = cooldown - now

        if (restante > 0) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Light-kun, espera un poco.* ✧\n> Regresa en: *${msToTime(restante)}*` 
            }, { quoted: m })
        }

        if (!texto || texto.length < 10) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Mensaje demasiado corto.* ✧\n> Explica mejor tu reporte o sugerencia (mínimo 10 caracteres).` 
            }, { quoted: m })
        }

        const fechaLocal = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })

        const esReporte = ['report', 'reporte'].includes(command)
        const tipoLabel = esReporte ? '🆁ҽ𝕡σɾƚҽ' : '🆂մց𝕖ɾҽ𝚗cíᥲ'
        const user = m.pushName || 'Usuario'
        const numero = sender.split('@')[0]
        
        // Foto de perfil del usuario que reporta
        const pp = await conn.profilePictureUrl(sender, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')

        let reportMsg = `
🫗۫᷒ᰰ⃘ׅ᷒  ۟　\`${tipoLabel}\`　ׅ　ᩡ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

𖹭  ׄ  ְ ❖ *Nombre*
> ${user}

𖹭  ׄ  ְ ❖ *Número*
> wa.me/${numero}

𖹭  ׄ  ְ ❖ *Fecha*
> ${fechaLocal}

𖹭  ׄ  ְ ❖ *Mensaje*
> ${texto}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

        // --- ENVÍO A LOS OWNERS ---
        // Definimos los dueños que recibirán el mensaje
        const owners = ['18492797341', '18297677527'] // Agrega aquí los números sin @s.whatsapp.net

        for (const num of owners) {
            try {
                await conn.sendMessage(num + '@s.whatsapp.net', {
                    text: reportMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: esReporte ? "🚨 NUEVO REPORTE" : "💡 NUEVA SUGERENCIA",
                            body: `De: ${user}`,
                            thumbnailUrl: pp,
                            sourceUrl: 'https://github.com/yannielmedrano1-sys/-sky',
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                })
            } catch (e) {
                console.log(`Error enviando reporte a ${num}:`, e)
            }
        }

        // Guardar cooldown (24 horas)
        global.db.data.users[sender].sugCooldown = now + 24 * 60 * 60000

        await conn.sendMessage(chat, { react: { text: '📩', key: m.key } })
        return conn.sendMessage(chat, { 
            text: `> ✐  *${esReporte ? 'Reporte' : 'Sugerencia'} enviado.* ✧\n\n> Gracias por ayudar a mejorar a 𝓜𝓲𝓼𝓪.` 
        }, { quoted: m })
    }
}

// Función auxiliar para el tiempo
const msToTime = (duration) => {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    const s = seconds.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const h = hours.toString().padStart(2, '0')
    return `${h}h ${m}m ${s}s`
}

export default reportMisa
