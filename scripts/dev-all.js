const { spawn } = require("child_process");


const colors = {
    reset: "\x1b[0m",
    gateway: "\x1b[36m",
    user: "\x1b[32m",
    brand: "\x1b[33m",
    category: "\x1b[35m",
    product: "\x1b[34m",
};

const services = [
    { name: "GATEWAY", cmd: "npm", args: ["run", "dev:gateway"], color: colors.gateway },
    { name: "USER", cmd: "npm", args: ["run", "dev:user"], color: colors.user },
    { name: "BRAND", cmd: "npm", args: ["run", "dev:brand"], color: colors.brand },
    { name: "CATEGORY", cmd: "npm", args: ["run", "dev:category"], color: colors.category },
    { name: "PRODUCT", cmd: "npm", args: ["run", "dev:product"], color: colors.product },
    { name: "CART", cmd: "npm", args: ["run", "dev:cart"], color: colors.cart }
];

console.log(" Đang khởi động tất cả Microservices & API Gateway...\n");

const runningProcesses = [];

services.forEach((service) => {
    const child = spawn(service.cmd, service.args, {
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    const prefix = `${service.color}[${service.name}]${colors.reset} `;

    child.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line) => {
            if (line.trim()) {
                console.log(`${prefix}${line}`);
            }
        });
    });

    child.stderr.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line) => {
            if (line.trim()) {
                console.error(`${prefix}${line}`);
            }
        });
    });

    child.on("close", (code) => {
        console.log(`${prefix}Process exited with code ${code}`);
    });

    runningProcesses.push(child);
});

const cleanExit = () => {
    console.log("Đang dừng toàn bộ các services...");
    runningProcesses.forEach((p) => {
        try {
            p.kill("SIGINT");
        } catch (e) {
        }
    });
    process.exit();
};

process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);

