/* KURAYAMI TEAM - CONTEXT STRATEGY
   Estrategia de Identidad JID/LID
*/

export default {
    name: 'quiensoy',
    alias: ['number', 'id'],
    category: 'info',
    noPrefix: true, 

    run: async (conn, m) => {
        const userNumber = m.sender; // Número completo capturado por Baileys
        
        await conn.sendMessage(
            m.chat,
            { text: `Tu número es:\n${userNumber}\n\nSolo la parte antes de @ es: ${userNumber.split('@')[0]}` },
            { quoted: m }
        );
    }
};
