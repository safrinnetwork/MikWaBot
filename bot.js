const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { exec } = require("child_process");
require("dotenv").config();

// Inisialisasi client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Menampilkan QR code di terminal
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR code ini digunakan untuk menautkan akun WhatsApp Anda.");
});

// Saat client siap
client.on("ready", () => {
  console.log("Client siap!");
});

// Mendengarkan pesan masuk
client.on("message", (message) => {
  console.log("Pesan diterima:", message.body);
  if (message.body === "/resource") {
    console.log("Perintah /resource diterima");
    getResourceMikroTik((resource) => {
      console.log("Resource diterima:", resource);
      const formattedResource = formatResource(resource);
      message
        .reply(formattedResource)
        .then((response) => {
          console.log("Balasan terkirim:", response);
        })
        .catch((error) => {
          console.error("Error mengirim balasan:", error);
        });
    });
  } else if (message.body === "/netwatch_down") {
    console.log("Perintah /netwatch_down diterima");
    getNetwatchDown((netwatch) => {
      console.log("Netwatch Down diterima:", netwatch);
      const formattedNetwatch = formatNetwatch(netwatch);
      message
        .reply(formattedNetwatch)
        .then((response) => {
          console.log("Balasan terkirim:", response);
        })
        .catch((error) => {
          console.error("Error mengirim balasan:", error);
        });
    });
  } else if (message.body === "/netwatch_up") {
    console.log("Perintah /netwatch_up diterima");
    getNetwatchUp((netwatch) => {
      console.log("Netwatch Up diterima:", netwatch);
      const formattedNetwatch = formatNetwatch(netwatch);
      message
        .reply(formattedNetwatch)
        .then((response) => {
          console.log("Balasan terkirim:", response);
        })
        .catch((error) => {
          console.error("Error mengirim balasan:", error);
        });
    });
  }
});

client.initialize();

// Fungsi untuk mendapatkan resource MikroTik
function getResourceMikroTik(callback) {
  const user = process.env.MIKROTIK_USER;
  const password = process.env.MIKROTIK_PASSWORD;
  const ip = process.env.MIKROTIK_IP;

  exec(
    `curl -u ${user}:${password} http://${ip}/rest/system/resource`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log("Data dari MikroTik:", stdout.trim());
      callback(stdout.trim());
    }
  );
}

// Fungsi untuk mendapatkan host Netwatch yang down
function getNetwatchDown(callback) {
  const user = process.env.MIKROTIK_USER;
  const password = process.env.MIKROTIK_PASSWORD;
  const ip = process.env.MIKROTIK_IP;

  exec(
    `curl -u ${user}:${password} http://${ip}/rest/tool/netwatch`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log("Data Netwatch dari MikroTik:", stdout.trim());
      const netwatch = JSON.parse(stdout.trim());
      const downHosts = netwatch.filter((host) => host["status"] === "down");
      callback(JSON.stringify(downHosts, null, 2));
    }
  );
}

// Fungsi untuk mendapatkan host Netwatch yang up
function getNetwatchUp(callback) {
  const user = process.env.MIKROTIK_USER;
  const password = process.env.MIKROTIK_PASSWORD;
  const ip = process.env.MIKROTIK_IP;

  exec(
    `curl -u ${user}:${password} http://${ip}/rest/tool/netwatch`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log("Data Netwatch dari MikroTik:", stdout.trim());
      const netwatch = JSON.parse(stdout.trim());
      const upHosts = netwatch.filter((host) => host["status"] === "up");
      callback(JSON.stringify(upHosts, null, 2));
    }
  );
}

// Fungsi untuk memformat resource
function formatResource(resource) {
  const data = JSON.parse(resource);
  return `
Resource MikroTik:
- Architecture: ${data["architecture-name"]}
- Bad Blocks: ${data["bad-blocks"]}
- Board Name: ${data["board-name"]}
- Build Time: ${data["build-time"]}
- CPU: ${data["cpu"]}
- CPU Count: ${data["cpu-count"]}
- CPU Frequency: ${data["cpu-frequency"]}
- CPU Load: ${data["cpu-load"]}
- Factory Software: ${data["factory-software"]}
- Free HDD Space: ${(data["free-hdd-space"] / 1048576).toFixed(2)} MB
- Free Memory: ${(data["free-memory"] / 1048576).toFixed(2)} MB
- Platform: ${data["platform"]}
- Total HDD Space: ${(data["total-hdd-space"] / 1048576).toFixed(2)} MB
- Total Memory: ${(data["total-memory"] / 1048576).toFixed(2)} MB
- Uptime: ${data["uptime"]}
- Version: ${data["version"]}
- Write Sect. Since Reboot: ${data["write-sect-since-reboot"]}
- Write Sect. Total: ${data["write-sect-total"]}
`;
}

// Fungsi untuk memformat netwatch
function formatNetwatch(netwatch) {
  const data = JSON.parse(netwatch);
  if (data.length === 0) {
    return "Tidak ada host yang ditemukan.";
  }
  return data
    .map(
      (host) => `
Host: ${host["host"]}
Status: ${host["status"]}
Since: ${host["since"]}
`
    )
    .join("\n");
}
