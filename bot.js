const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const https = require('https');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let mikrotikConfig = {
    connected: false,
    baseURL: '',
    username: '',
    password: ''
};

// Pongola SSL
const httpsAgent = new https.Agent({
    rejectUnauthorized: false // Nde pongola ini ssl
});

// depe anu ini lo axios
async function mikrotikRequest(endpoint, method = 'get', data = null) {
    try {
        const response = await axios({
            method: method,
            url: `${mikrotikConfig.baseURL}${endpoint}`,
            auth: {
                username: mikrotikConfig.username,
                password: mikrotikConfig.password
            },
            data: data,
            httpsAgent: httpsAgent
        });
        return response.data;
    } catch (error) {
        console.error('Error making MikroTik request:', error.response ? error.response.data : error.message);
        return null;
    }
}

// ini kita ada beken ba ini format akan dpe waktu
function formatUptime(uptime) {
    return uptime.replace(/(\d+)([hms])/g, '$1 $2');
}

// ini kita ada beken ba ini format akan dpe GiB
function toMiB(bytes) {
    return (bytes / 1024 / 1024).toFixed(1);
}

function toGiB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

// ba kase lia barcode ini aba
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// kalo macam ta konek mo muncul tulisan ini 
client.on('ready', () => {
    console.log('MikWaBot Ready !');
});

// pesan
client.on('message', async msg => {
    const chatId = msg.from;
    const text = msg.body.toLowerCase();

    // depe menu ini olobu
    if (text === 'menu' || text === '/help') {
        const helpMessage = `Selamat Datang di Mostech Bot\n\n` +
            `Berikut adalah menu yang tersedia:\n` +
            `/connect: Untuk menghubungkan bot ke MikroTik.\n` +
            `/resource: Untuk mendapatkan informasi resource dari MikroTik setelah terkoneksi.\n` +
            `/status: Untuk memeriksa status koneksi MikroTik.\n` +
            `/interface_list: Untuk mendapatkan daftar interface MikroTik.\n` +
            `/interface_disable <nama interface>: Untuk mendisable interface.\n` +
            `/interface_enable <nama interface>: Untuk menenable interface.\n` +
            `/total_hotspot: Untuk melihat total user hotspot.\n` +
            `/hotspot_find <nama>: Untuk mencari user hotspot berdasarkan nama.\n` +
            `/total_pppoe: Untuk melihat total PPPoE aktif.\n` +
            `/netwatch_down: Untuk melihat netwatch dengan status down.`;
        client.sendMessage(chatId, helpMessage);
    }

    // mo ba kase konek akan ini
    if (text.startsWith('/connect ')) {
        const [, url, username, password] = text.split(' ');


        mikrotikConfig.baseURL = url;
        mikrotikConfig.username = username;
        mikrotikConfig.password = password;
        mikrotikConfig.connected = true;

        client.sendMessage(chatId, 'Koneksi MikroTik berhasil disimpan. Gunakan perintah lain untuk interaksi dengan MikroTik.');
    }


    if (text === '/status') {
        const statusMessage = mikrotikConfig.connected
            ? 'MikroTik terhubung.'
            : 'MikroTik tidak terhubung. Gunakan /connect untuk terhubung.';
        client.sendMessage(chatId, statusMessage);
    }


    if (text === '/resource') {
        if (!mikrotikConfig.connected) {
            client.sendMessage(chatId, 'MikroTik belum terhubung. Gunakan /connect untuk terhubung.');
            return;
        }

        try {
            const response = await axios.get(`${mikrotikConfig.baseURL}/system/resource`, {
                auth: {
                    username: mikrotikConfig.username,
                    password: mikrotikConfig.password
                },
                httpsAgent: httpsAgent 
            });

            const resourceData = response.data; 
            const resourceMessage = `System Resource:\n` +
                `Board Name: ${resourceData['board-name']}\n` +
                `Uptime: ${formatUptime(resourceData.uptime)}\n` +
                `CPU Load: ${resourceData['cpu-load']}%\n` +
                `Free Memory: ${toMiB(resourceData['free-memory'])} MiB\n` +
                `Free HDD Space: ${toGiB(resourceData['free-hdd-space'])} GiB\n` +
                `RouterOS: ${resourceData['version']}`;

            client.sendMessage(chatId, resourceMessage);
        } catch (error) {
            console.error('Error fetching system resource:', error.response ? error.response.data : error.message);
            client.sendMessage(chatId, 'Gagal mengambil data dari MikroTik. Periksa koneksi dan kredensial.');
        }
    }

    // Interface List
    if (text === '/interface_list') {
        const interfaces = await mikrotikRequest('/interface');
        if (interfaces) {
            let message = 'Interface List\n';
            interfaces.forEach((iface, index) => {
                const status = iface.running === "true" ? '✅' : '❌';
                message += `${index + 1}. Nama: ${iface.name} - Type: ${iface.type} - Status: ${status}\n`;
            });
            client.sendMessage(chatId, message);
        } else {
            client.sendMessage(chatId, 'Gagal mengambil data interface.');
        }
    }


    if (text.startsWith('/interface_disable ')) {
        const interfaceName = text.split(' ')[1];
        const result = await mikrotikRequest(`/interface/${interfaceName}`, 'patch', { disabled: "true" });

        if (result) {
            client.sendMessage(chatId, `Interface ${interfaceName} berhasil di disable.`);
        } else {
            client.sendMessage(chatId, `Interface ${interfaceName} gagal di disable.`);
        }
    }


    if (text.startsWith('/interface_enable ')) {
        const interfaceName = text.split(' ')[1];
        const result = await mikrotikRequest(`/interface/${interfaceName}`, 'patch', { disabled: "false" });

        if (result) {
            client.sendMessage(chatId, `Interface ${interfaceName} berhasil di enable.`);
        } else {
            client.sendMessage(chatId, `Interface ${interfaceName} gagal di enable.`);
        }
    }


    if (text === '/total_hotspot') {
        const users = await mikrotikRequest('/ip/hotspot/user');
        const activeUsers = await mikrotikRequest('/ip/hotspot/active');
        const hosts = await mikrotikRequest('/ip/hotspot/host');

        if (users && activeUsers && hosts) {
            const message = `Total User\n` +
                `User Hotspot: ${users.length}\n` +
                `User Hotspot Aktif: ${activeUsers.length}\n` +
                `Host: ${hosts.length}`;
            client.sendMessage(chatId, message);
        } else {
            client.sendMessage(chatId, 'Gagal mengambil data hotspot.');
        }
    }


if (text.startsWith('/hotspot_find ')) {
    const name = text.split(' ')[1].toLowerCase();
    

    const users = await mikrotikRequest('/ip/hotspot/user');
    const activeUsers = await mikrotikRequest('/ip/hotspot/active');
    
    if (users && activeUsers) {

        const matchingUsers = users.filter(user => user.name.toLowerCase().includes(name));
        const matchingActiveUsers = activeUsers.filter(activeUser => activeUser.user.toLowerCase().includes(name));
        
        if (matchingUsers.length > 0) {
            let message = '';


            matchingUsers.forEach((user, index) => {
                message += `Hotspot User Detail ${index + 1}:\n` +
                    `Nama: ${user.name}\n` +
                    `Password: ${user.password}\n` +
                    `Profile: ${user.profile}\n\n`;
            });


            if (matchingActiveUsers.length > 0) {
                matchingActiveUsers.forEach((activeUser, index) => {
                    message += `Hotspot Aktif Detail ${index + 1}:\n` +
                        `Nama: ${activeUser.user}\n` +
                        `IP: ${activeUser.address}\n` +
                        `MAC: ${activeUser['mac-address']}\n` +
                        `Uptime: ${activeUser.uptime}\n\n`;
                });
            } else {
                message += `Tidak ada user aktif yang sesuai dengan nama "${name}".\n`;
            }

            client.sendMessage(chatId, message);
        } else {
            client.sendMessage(chatId, `User dengan nama "${name}" tidak ditemukan.`);
        }
    } else {
        client.sendMessage(chatId, 'Gagal mengambil data hotspot.');
    }
}



    if (text === '/total_pppoe') {
        const pppoe = await mikrotikRequest('/interface/pppoe-server/active');

        if (pppoe) {
            const message = `Total PPPoE Aktif: ${pppoe.length}`;
            client.sendMessage(chatId, message);
        } else {
            client.sendMessage(chatId, 'Gagal mengambil data PPPoE.');
        }
    }


    if (text === '/netwatch_down') {
        const netwatch = await mikrotikRequest('/tool/netwatch');
        if (netwatch) {
            let downList = 'Netwatch Down Monitoring\n';
            netwatch.filter(nw => nw.status === 'down').forEach((nw, index) => {
                downList += `${index + 1}. Nama: ${nw.comment} - IP: ${nw.host} - Waktu: ${nw.since}\n`;
            });
            client.sendMessage(chatId, downList);
        } else {
            client.sendMessage(chatId, 'Gagal mengambil data Netwatch.');
        }
    }
});


client.initialize();
