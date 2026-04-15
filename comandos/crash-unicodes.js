/* * 👑 Unicode Generator Pro (Heavy Load)
 * Genera una secuencia de caracteres densos para pruebas de renderizado.
 * Autor: Yanniel & Gemini
 */

const unicodeCommand = {
    name: 'unicode',
    alias: ['uni', 'char'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid
        const reply = (txt) => conn.sendMessage(chat, { text: txt }, { quoted: m })

        // 1. Obtener cantidad
        let cantidad = parseInt(args[0])

        if (isNaN(cantidad) || cantidad < 1) {
            return reply(`🖤 *¿Cuántos caracteres fuertecitos?*\n> Uso: unicode 100`)
        }

        // 2. Límite de estabilidad
        // 5,000 caracteres es un bloque pesado pero que WhatsApp aún puede "digerir"
        if (cantidad > 5000) {
            return reply(`⚠️ *Límite:* El máximo es de 5,000 para no congelar tu propio chat.`)
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🌀', key: m.key } })

            // 3. Generar caracteres "fuertes" (Rango Cuneiforme y combinados)
            let texto = ""
            for (let i = 0; i < cantidad; i++) {
                // Usamos un rango de Cuneiforme (0x12000) que es bastante denso
                // Sumamos i * 2 para variar los glifos rápidamente
                texto += String.fromCodePoint(0x12000 + (i % 800))
                
                // Cada 10 caracteres metemos un separador invisible de control para forzar al render
                if (i % 10 === 0) texto += String.fromCodePoint(0x200D) 
            }

            // 4. Envío del bloque
            await conn.sendMessage(chat, { 
                text: texto 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ Error en la generación de carga.`)
        }
    }
}

export default unicodeCommand
