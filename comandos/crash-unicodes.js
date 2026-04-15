/* * 👑 Unicode Generator Pro
 * Genera una cadena de caracteres específica.
 * Autor: Yanniel & Gemini
 */

const unicodeCommand = {
    name: 'unicode',
    alias: ['uni'],
    category: 'utilidades',
    noPrefix: true, // Para que funcione como "unicode 100"

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid
        const reply = (txt) => conn.sendMessage(chat, { text: txt }, { quoted: m })

        // 1. Tomar la cantidad del primer argumento
        let cantidad = parseInt(args[0])

        if (isNaN(cantidad) || cantidad < 1) {
            return reply(`🖤 *¿Cuántos quieres?*\n> Uso: unicode 50`)
        }

        // 2. Límite de seguridad (Para que WhatsApp no te banee por spam de caracteres)
        if (cantidad > 2000) {
            return reply(`⚠️ *Límite:* El máximo es de 2,000 para evitar errores de red.`)
        }

        try {
            // 3. Generar los caracteres (Rango Imperial Aramaic)
            let texto = ""
            for (let i = 0; i < cantidad; i++) {
                // Genera la secuencia basada en los códigos que pasaste
                texto += String.fromCodePoint(0x10810 + (i % 110)) 
            }

            // 4. Envío directo del bloque de texto
            await conn.sendMessage(chat, { 
                text: texto 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ Error al generar los glifos.`)
        }
    }
}

export default unicodeCommand
