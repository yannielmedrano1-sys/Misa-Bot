/**
 * ꕤ ━━━━━━━━━━ BOT ON/OFF - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const botStatusMisa = {
    name: 'bot',
    alias: ['misa'],
    category: 'group',
    isAdmin: true, // Solo admins del grupo
    isGroup: true, // Solo funciona en grupos
    noPrefix: true,

    run: async (conn, m, { args, text }) => {
        const chatJid = m.chat
        
        // --- ACCESO A LA BASE DE DATOS ---
        if (!global.db.data.chats[chatJid]) {
            global.db.data.chats[chatJid] = { isBanned: false }
        }
        
        const chat = global.db.data.chats[chatJid]
        const estado = chat.isBanned ?? false

        // --- LÓGICA DE APAGADO ---
        if (args[0] === 'off') {
            if (estado) return conn.sendMessage(chatJid, { 
                text: `> ✐  *Misa ya está descansando en este grupo.* ✧` 
            }, { quoted: m })
            
            chat.isBanned = true
            await conn.sendMessage(chatJid, { react: { text: '💤', key: m.key } })
            return conn.sendMessage(chatJid, { 
                text: `> ✐  *Has desactivado a 𝓜𝓲𝓼𝓪.* ✧\n> Ya no responderé a comandos aquí (solo los admins podrán activarme).` 
            }, { quoted: m })
        }

        // --- LÓGICA DE ENCENDIDO ---
        if (args[0] === 'on') {
            if (!estado) return conn.sendMessage(chatJid, { 
                text: `> ✐  *Misa ya está activa y lista para ayudar.* ✧` 
            }, { quoted: m })
            
            chat.isBanned = false
            await conn.sendMessage(chatJid, { react: { text: '✨', key: m.key } })
            return conn.sendMessage(chatJid, { 
                text: `> ✐  *Has activado a 𝓜𝓲𝓼𝓪.* ✧\n> ¡Estoy de vuelta, Light-kun!` 
            }, { quoted: m })
        }

        // --- ESTADO ACTUAL (Si solo escriben "bot") ---
        const statusMsg = `
ʚ 𝐌𝐢𝐬𝐚 𝐒𝐭𝐚𝐭𝐮𝐬 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado actual:* ${estado ? '✗ 𝐃𝐞𝐬𝐚𝐜𝐭𝐢𝐯𝐚𝐝𝐨' : '✓ 𝐀𝐜𝐭𝐢𝐯𝐚𝐝𝐨'}

📄 *Controles:*
> ✿ Para encender: \`bot on\`
> ✿ Para apagar: \`bot off\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

        return conn.sendMessage(chatJid, { text: statusMsg }, { quoted: m })
    }
}

export default botStatusMisa
