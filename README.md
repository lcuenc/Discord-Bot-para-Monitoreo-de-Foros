Aquí tienes el README para tu proyecto en GitHub:

---

# Discord Bot para Monitoreo de Foros

Este bot de Discord está diseñado para monitorear los foros de GTA World y notificar nuevos temas en canales específicos de Discord. El bot utiliza `discord.js` para interactuar con Discord y `axios` junto con `cheerio` para realizar scraping de las páginas web del foro.

## Requisitos

- Node.js v16.6.0 o superior
- npm (Node Package Manager)

## Instalación

1. Clona este repositorio:

    ```bash
    git clone https://github.com/tu_usuario/tu_repositorio.git
    cd tu_repositorio
    ```

2. Instala las dependencias necesarias:

    ```bash
    npm install discord.js axios cheerio
    ```

3. Configura tu token de Discord y el ID de los canales en el archivo `index.js`:

    ```javascript
    const TOKEN = 'tu_token_aqui'; // Reemplaza 'tu_token_aqui' con tu token real
    const CHANNEL_ID_SOLICITUDES = 'ID_DEL_CANAL'; // Reemplaza 'ID_DEL_CANAL' con el ID del canal donde quieres enviar los mensajes para solicitudes
    const CHANNEL_ID_REPORTES = 'ID_DEL_CANAL'; // Reemplaza 'ID_DEL_CANAL' con el ID del canal donde quieres enviar los mensajes para reportes
    ```

4. Configura las cookies de sesión obtenidas desde el navegador en el archivo `index.js`:

    ```javascript
    const sessionCookies = 'ingresar_cookies';
    ```

## Uso

Inicia el bot ejecutando el siguiente comando:

```bash
node index.js
```

## Funcionalidades

- Monitoreo de nuevos temas en la sección de solicitudes del foro de GTA World.
- Monitoreo de nuevos temas en la sección de reportes contra usuarios del foro de GTA World.
- Envío de notificaciones con detalles del nuevo tema al canal de Discord especificado.

## Código Ejemplo

```javascript
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
});

const TOKEN = 'tu_token_aqui';
const CHANNEL_ID_SOLICITUDES = 'ID_DEL_CANAL';
const CHANNEL_ID_REPORTES = 'ID_DEL_CANAL';
const forumUrlSolicitudes = 'https://foro.gta.world/index.php?/forum/200-solicitudes/';
const forumUrlReportes = 'https://foro.gta.world/index.php?/forum/48-reportes-contra-usuarios/';
const sessionCookies = 'ingresar_cookies';

let lastNotifiedTopicSolicitudes = null;
let lastNotifiedTopicReportes = null;
let requestCounterSolicitudes = 0;
let requestCounterReportes = 0;

async function checkForNewTopicsSolicitudes() {
    try {
        const response = await axios.get(forumUrlSolicitudes, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cookie': sessionCookies
            }
        });

        const $ = cheerio.load(response.data);
        const lastTopicElement = $('h4.ipsDataItem_title a').not('a[href*="archivo"]').not('a:contains("Reportes contra usuarios")').first();
        const title = lastTopicElement.text().trim();
        const link = lastTopicElement.attr('href');

        if (lastNotifiedTopicSolicitudes !== link) {
            requestCounterSolicitudes++;
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

            lastNotifiedTopicSolicitudes = link;
        }
    } catch (error) {
        console.error('Error fetching forum topics (Solicitudes):', error.message);
    }
}

async function checkForNewTopicsReportes() {
    try {
        const response = await axios.get(forumUrlReportes, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cookie': sessionCookies
            }
        });

        const $ = cheerio.load(response.data);
        const lastTopicElement = $('h4.ipsDataItem_title a').not('a[href*="archivo"]').not('a:contains("Reportes contra usuarios")').first();
        const title = lastTopicElement.text().trim();
        const link = lastTopicElement.attr('href');

        if (lastNotifiedTopicReportes !== link) {
            requestCounterReportes++;
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

            lastNotifiedTopicReportes = link;
        }
    } catch (error) {
        console.error('Error fetching forum topics (Reportes):', error.message);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(checkForNewTopicsSolicitudes, 30000);
    setInterval(checkForNewTopicsReportes, 30000);
});

client.login(TOKEN);
```

## Contribuciones

¡Las contribuciones son bienvenidas! Si tienes alguna mejora o corrección, no dudes en abrir un issue o enviar un pull request.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

Asegúrate de reemplazar los valores de ejemplo con tus datos reales antes de ejecutar el bot.
