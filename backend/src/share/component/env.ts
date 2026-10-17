import dotenv from "dotenv";
import path from "path";
import fs from "fs";

export function loadEnv(): void {
    const nodeEnv = process.env.NODE_ENV || "development";

    // Priority order:
    // 1. .env.{NODE_ENV}.local (local overrides for specific env)
    // 2. .env.{NODE_ENV}       (.env.development hoặc .env.production)
    // 3. .env.local            (local common overrides)
    // 4. .env                  (fallback defaults)
    const envFiles = [
        `.env.${nodeEnv}.local`,
        `.env.${nodeEnv}`,
        `.env.local`,
        `.env`,
    ];

    let loadedAny = false;
    for (const file of envFiles) {
        const fullPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            dotenv.config({ path: fullPath });
            loadedAny = true;
        }
    }

    if (!loadedAny) {
        dotenv.config();
    }
}

// Auto-load on import
loadEnv();
