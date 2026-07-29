import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DATABASE_KEY = "rea.sqlcipher.database.key";
type KeyedDatabase = { execAsync(source: string): Promise<unknown> };

/** Obtiene una clave aleatoria por instalación desde SecureStore para abrir SQLCipher. */
export async function getOrCreateDatabaseKey(): Promise<string> {
    const existing = await SecureStore.getItemAsync(DATABASE_KEY, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    if (existing) return existing;

    const bytes = await Crypto.getRandomBytesAsync(32);
    const key = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    await SecureStore.setItemAsync(DATABASE_KEY, key, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    return key;
}

/** Cambia la clave de SQLCipher y solo confirma el nuevo secreto si el rekey terminó. */
export async function rotateDatabaseKey(database: KeyedDatabase): Promise<void> {
    const previous = await SecureStore.getItemAsync(DATABASE_KEY, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    if (!previous) throw new Error("No existe una clave de base de datos para rotar.");

    const bytes = await Crypto.getRandomBytesAsync(32);
    const next = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    await database.execAsync(`PRAGMA rekey = '${next}';`);
    try {
        await SecureStore.setItemAsync(DATABASE_KEY, next, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
        });
    } catch (error) {
        await database.execAsync(`PRAGMA rekey = '${previous}';`);
        throw error;
    }
}
