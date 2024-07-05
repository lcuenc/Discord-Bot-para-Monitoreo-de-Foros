const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

// Configurar el cliente de Discord con los intents necesarios
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Necesario para recibir información de los servidores
        GatewayIntentBits.GuildMessages // Necesario para recibir mensajes en los servidores
    ],
    partials: [Partials.Channel] // Esto es necesario si estás manejando mensajes en canales que pueden no estar en caché
});

const TOKEN = 'tu_token_aqui'; // Reemplaza 'tu_token_aqui' con tu token real
const CHANNEL_ID_SOLICITUDES = 'tu_id_de_canal_aqui'; // Reemplaza 'tu_id_de_canal_aqui' con el ID del canal donde quieres enviar los mensajes para solicitudes
const CHANNEL_ID_REPORTES = 'otro_id_de_canal_aqui'; // Reemplaza 'otro_id_de_canal_aqui' con el ID del canal donde quieres enviar los mensajes para reportes

// URLs del foro a monitorear
const forumUrlSolicitudes = 'https://foro.gta.world/index.php?/forum/200-solicitudes/';
const forumUrlReportes = 'https://foro.gta.world/index.php?/forum/48-reportes-contra-usuarios/';

// Cookies de sesión obtenidas desde el navegador
const sessionCookies = 'ingresar_cookies'; // Reemplaza 'ingresar_cookies' con las cookies de tu sitio web a monitorear.

let lastNotifiedTopicSolicitudes = null; // Variable para almacenar el último tema notificado de solicitudes
let lastNotifiedTopicReportes = null; // Variable para almacenar el último tema notificado de reportes
let requestCounterSolicitudes = 0; // Contador de solicitudes
let requestCounterReportes = 0; // Contador de reportes

// Función para verificar nuevos temas en solicitudes
async function checkForNewTopicsSolicitudes() {
    try {
        const response = await axios.get(forumUrlSolicitudes, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cookie': sessionCookies // Añadir cookies de sesión aquí
            }
        });

        const $ = cheerio.load(response.data);

        // Seleccionar el último tema que no esté en la subcategoría "Archivo" y que no tenga el título "Reportes contra usuarios"
        const lastTopicElement = $('h4.ipsDataItem_title a').not('a[href*="archivo"]').not('a:contains("Reportes contra usuarios")').first();
        const title = lastTopicElement.text().trim();
        const link = lastTopicElement.attr('href');

        // Chequear si ya fue notificado
        if (lastNotifiedTopicSolicitudes !== link) {
            // Incrementar el contador de solicitudes
            requestCounterSolicitudes++;

            // Enviar el mensaje al canal de Discord si es un nuevo tema
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(link)
                .setColor('#361259')
                .setDescription(`Nueva solicitud de Transferencia de bienes. por favor verificar la misma lo antes posible. Haciendo click al titulo te llevará automaticamente.\n\n**Número de solicitud:** ${requestCounterSolicitudes}`)
                .setTimestamp();

            const channel = client.channels.cache.get(CHANNEL_ID_SOLICITUDES);
            if (channel) {
                channel.send({ embeds: [embed] });
            }

            // Actualizar el último tema notificado
            lastNotifiedTopicSolicitudes = link;
        }
    } catch (error) {
        console.error('Error fetching forum topics (Solicitudes):', error.message);
    }
}

// Función para verificar nuevos temas en reportes
async function checkForNewTopicsReportes() {
    try {
        const response = await axios.get(forumUrlReportes, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cookie': sessionCookies // Añadir cookies de sesión aquí
            }
        });

        const $ = cheerio.load(response.data);

        // Seleccionar el último tema que no esté en la subcategoría "Archivo" y que no tenga el título "Reportes contra usuarios"
        const lastTopicElement = $('h4.ipsDataItem_title a').not('a[href*="archivo"]').not('a:contains("Reportes contra usuarios")').first();
        const title = lastTopicElement.text().trim();
        const link = lastTopicElement.attr('href');

        // Chequear si ya fue notificado
        if (lastNotifiedTopicReportes !== link) {
            // Incrementar el contador de reportes
            requestCounterReportes++;

            // Enviar el mensaje al canal de Discord si es un nuevo tema
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(link)
                .setColor('#FF0000')
                .setDescription(`Nuevo reporte contra usuario. por favor verificar el mismo lo antes posible. Haciendo click al titulo te llevará automaticamente.\n\n**Número de reporte:** ${requestCounterReportes}`)
                .setTimestamp();

            const channel = client.channels.cache.get(CHANNEL_ID_REPORTES);
            if (channel) {
                channel.send({ embeds: [embed] });
            }

            // Actualizar el último tema notificado
            lastNotifiedTopicReportes = link;
        }
    } catch (error) {
        console.error('Error fetching forum topics (Reportes):', error.message);
    }
}

// Evento de inicio del bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Verificar nuevos temas cada 30 segundos (30000 ms) - ajusta este valor según tus necesidades
    setInterval(checkForNewTopicsSolicitudes, 30000);
    setInterval(checkForNewTopicsReportes, 30000);
});

// Iniciar sesión en Discord
client.login(TOKEN);
