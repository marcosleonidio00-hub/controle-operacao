import { pool } from "@workspace/db";
pool.connect().then(() => { console.log("DB_OK"); process.exit(0); }).catch(e => { console.error("DB_FAIL", e); process.exit(1); });