/* 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏 - INDEX ENGINE 
   Desarrollado por Yanniel
   Estética: Gothic Black & White
*/

import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createInterface } from 'readline';
import chalk from 'chalk';
import CFonts from 'cfonts';

import { config } from './config.js';
import { logger } from './config/print.js';
import { pixelHandler } from './pixel.js';
import { loadAllSubBots } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.commands = new Map();

global.loadCommands = async () => {
    process.stdout.write(chalk.white('  [⚙️] Cargando módulos de comandos... '));
    const commandsPath = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    global.commands.clear();
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        try {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?update=${Date.now()}`);
            if (module.default && module.default.name) {
                global.commands.set(module.default.name, module.default);
            }
        } catch (e) {
            console.log(chalk.red(`\n  [❌] Error en ${file}:`), e.message);
        }
    }
    process.stdout.write(chalk.gray(`LISTO (${global.commands.size})\n`));
};

async function startBot() {
    const sessionDir = './sesion_bot';
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    process.stdout.write('\x1Bc'); 
    
    // Banner MISA en Blanco y Negro
    CFonts.say('MISA', { 
        font: 'block', align: 'center', colors: ['white', 'gray'], background: 'transparent', letterSpacing: 1 
    });

    console.log(chalk.gray('  ' + '─'.repeat(50)));
    console.log(chalk.white('  [📱] SISTEMA:') + chalk.gray(` 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏 🖤`));
    console.log(chalk.white('  [👤] DEVELOPER:') + chalk.gray(` Yanniel`));
    console.log(chalk.white('  [🛠️] BAILEYS:') + chalk.gray(` v${version.join('.')}`));
    console.log(chalk.gray('  ' + '─'.repeat(50)) + '\n');

    const conn = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
    });

    await global.loadCommands();

    if (!conn.authState.creds.registered) {
        console.log(chalk.white('  [!] Inicializando vinculación para 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏...'));
        
        setTimeout(async () => {
            console.log(chalk.white('\n  ╔══════════════════════════════════════╗'));
            console.log(chalk.white('  ║          VINCULACIÓN - 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏        ║'));
            console.log(chalk.white('  ╚══════════════════════════════════════╝'));

            let phoneNumber = "";
            let isValid = false;

            while (!isValid) {
                let input = await question(chalk.white('\n  [?] Introduce tu número:\n  > '));
                phoneNumber = input.replace(/[^0-9]/g, '');

                if (!phoneNumber || phoneNumber.length < 10) {
                    console.log(chalk.gray('  [!] ERROR: Número inválido.'));
                } else {
                    isValid = true; 
                }
            }

            console.log(chalk.gray('\n  [⏳] Generando código para: ') + chalk.white(phoneNumber));

            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;

                console.log('\n' + chalk.black.bgWhite('  ╔════════════════════════════════════╗  '));
                console.log(chalk.black.bgWhite(`  ║         CODIGO MISA: ${code}         ║  `));
                console.log(chalk.black.bgWhite('  ╚════════════════════════════════════╝  ') + '\n');
            } catch (error) {
                console.error(chalk.white('  [!] Error al generar código:'), error.message);
                process.exit(1);
            }
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const isLoggedOut = lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut;
            if (isLoggedOut) {
                console.log(chalk.white.bold('\n  [!] SESIÓN CERRADA. Limpiando datos...'));
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                process.exit(0);
            } else {
                console.log(chalk.gray('  [!] Reconectando 𝓜𝓲𝓼𝓪 𝘽𝙊𝙏...'));
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.white.bold('\n  [✨] ¡𝓜𝓘𝓢𝓐 𝘽𝙊𝙏 CONECTADA CON ÉXITO! 🖤🔥'));
            console.log(chalk.gray('  ' + '─'.repeat(50)));
            await loadAllSubBots(conn);
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        logger(m, conn);
        await pixelHandler(conn, m, config);
    });
}

startBot();
