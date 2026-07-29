import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8"));
const blocked = config.expo?.android?.blockedPermissions ?? [];

if (!blocked.includes("android.permission.INTERNET")) {
    throw new Error("La build de Android debe bloquear android.permission.INTERNET.");
}

console.log("zero-network: android.permission.INTERNET bloqueado");
