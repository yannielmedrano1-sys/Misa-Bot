/** (no sirve )
 * ꕤ ━━━━━━━━━━ BOT ON/OFF (FIXED) - 𝓜𝓲𝓼𝓪 ━━━━━━━━━━ ꕤ
 */

const botStatusMisa = {
    name: 'bot',
    alias: ['misa'],
    category: 'group',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chatJid = m.chat
        
        // --- 🛡️ FIX: INICIALIZACIÓN DE EMERGENCIA ---
        // Si global.db o global.db.data no existen, los creamos para evitar el error
        if (!global.db) global.db = { data: {} }
        if (!global.db.data) global.db.data = {}
        if (!global.db.data.chats) global.db.data.chats = {}
        
        // Ahora inicializamos el chat específico si no existe
        if (!global.db.data.chats[chatJid]) {
            global.db.data.chats[chatJid] = { isBanned: false }
        }
        
        const chat = global.db.data.chats[chatJid]
        const estado = chat.isBanned ?? false

        // --- LÓGICA DE APAGADO ---
        if (args[0] === 'off') {
            if (estado) return conn.sendMessage(chatJid, { text: `> ✐  *Misa ya está desactivada aquí.*` }, { quoted: m })
            chat.isBanned = true
            return conn.sendMessage(chatJid, { text: `> ✐  *Misa desactivada con éxito.* ✧` }, { quoted: m })
        }

        // --- LÓGICA DE ENCENDIDO ---
        if (args[0] === 'on') {
            if (!estado) return conn.sendMessage(chatJid, { text: `> ✐  *Misa ya está activa.*` }, { quoted: m })
            chat.isBanned = false
            return conn.sendMessage(chatJid, { text: `> ✐  *Misa activada con éxito.* ✧` }, { quoted: m })
        }

        // --- ESTADO ACTUAL ---
        const statusMsg = `
ʚ 𝐌𝐢𝐬𝐚 𝐒𝐭𝐚𝐭𝐮𝐬 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
✰ *Estado:* ${estado ? '✗ Desactivado' : '✓ Activado'}

> ● Para encender: \`bot on\`
> ● Para apagar: \`bot off\``.trim()

        return conn.sendMessage(chatJid, { text: statusMsg }, { quoted: m })
    }
}

export default botStatusMisa
