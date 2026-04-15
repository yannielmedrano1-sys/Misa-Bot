/* * 👑 Invisible Unicode Loader - Misa-Bot
 * Genera un archivo con nombre invisible y carga densa.
 * Autor: Yanniel & Gemini
 */

const unicodeInvisible = {
    name: 'unicode',
    alias: ['heavy', 'txt'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        const chat = m.key.remoteJid
        const reply = (txt) => conn.sendMessage(chat, { text: txt }, { quoted: m })

        // 1. Cantidad fija o por argumento (ej: unicode 10000)
        let cantidad = parseInt(args[0]) || 10000

        // Límite de seguridad para el servidor
        if (cantidad > 500000) cantidad = 500000

        try {
            await conn.sendMessage(chat, { react: { text: '💾', key: m.key } })

            // 2. Generar carga de "peso" (Cuneiforme + Diacríticos apilados)
            let carga = ""
            for (let i = 0; i < cantidad; i++) {
                // Carácter base denso (Cuneiforme)
                carga += String.fromCodePoint(0x12000 + (i % 800))
                // Apilamiento de diacríticos (esto es lo que genera el peso real)
                carga += String.fromCodePoint(0x0345) 
                carga += String.fromCodePoint(0x0361)
            }

            const buffer = Buffer.from(carga, 'utf-16le') // UTF-16le ocupa más espacio/peso

            // 3. Nombre de archivo invisible (Zero Width Characters)
            // Usamos una combinación que WhatsApp detecta como nombre pero no muestra nada
            const nombreInvisible = String.fromCodePoint(0x200C, 0x200C, 0x200C, 0x200C) + ".txt"

            // 4. Enviar el archivo
            await conn.sendMessage(chat, {
                document: buffer,
                mimetype: 'text/plain',
                fileName: nombreInvisible,
                caption: `✧ ‧₊˚ *CARGA GENERADA* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Peso\`: *${cantidad} unidades*\n› *Nombre:* (Invisible)\n\n> ⚡ *Proceso completado.*\n> Powered by 𝓜𝓲𝓼α ♡`
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ Error al generar la carga invisible.`)
        }
    }
}

export default unicodeInvisible
