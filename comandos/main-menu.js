/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda', 'menu'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, pushName }) => {
        try {
            // Validación para evitar el "undefined" en el saludo
            const nombreUsuario = pushName || m.pushName || 'Usuario';
            
            // Obtener datos del sistema
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
            const baileysVersion = pkg.dependencies['@whiskeysockets/baileys']?.replace('^', '') || '6.6.0';
            const totalCommands = global.commands ? global.commands.size : '0';

            // Configuración de Hora y Fecha (Santo Domingo)
            const now = new Date();
            const hora = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santo_Domingo" });
            const fecha = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santo_Domingo" });

            const textoMenu = `Hola *${nombreUsuario}*, Soy 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

🖤 Prefix ⊹ \`${prefix}\`
✰ Owner ⊹ \`Yanniel\`
🖤 Libreria ⊹ \`Baileys v${baileysVersion}\`
✰ Hora ⊹ \`${hora}\`
🖤 Fecha ⊹ \`${fecha}\`
✰ Cmds ⊹ \`${totalCommands}\`

*˚.⋆ֹ　 ꒰ 𝙸 𝙽 𝙵 𝙾 – 𝙱 𝙾 𝚃 ꒱ㆍ₊⊹*
> ✐ Consulta el estado y la velocidad del sistema.

*✿︎ ${prefix}p • ${prefix}ping*
> ❀ Calcula la latencia real del bot.
*✿︎ ${prefix}help • ${prefix}menu*
> ❀ Despliega esta lista de comandos.
*✿︎ ${prefix}botinfo • ${prefix}info*
> ❀ Información detallada del sistema.


*˚.⋆ֹ　 ꒰ 𝚂 𝙾 𝙲 𝙺 𝙴 𝚃 𝚂 ꒱ㆍ₊⊹*
> ✐ Gestión de sub-bots y conexiones.

*✿︎ ${prefix}code*
> ❀ Hazte Sub-Bot de 𝓜𝓲𝓼𝓪.
*✿︎ ${prefix}bots • ${prefix}sockets*
> ❀ Mira la lista de sockets activos.


*˚.⋆ֹ　 ꒰ 𝙾 𝚆 𝙽 𝙴 𝚁 ꒱ㆍ₊⊹*
> ✐ Herramientas exclusivas del owner/creador.

*✿︎ ${prefix}up • ${prefix}update*
> ❀ Sincroniza el bot con el repositorio GitHub.

‧₊˚ *Powered by* \`𝓜𝓲𝓼𝓪\` ♡ ‧₊˚ `;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼𝓪  𝘽𝙊𝙏 🖤',
                        body: 'Misa Bot | Developed by Yanniel',
                        thumbnailUrl: 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg', 
                        sourceUrl: 'https://github.com/yannielmedrano1-sys/Misa-Bot',
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;
