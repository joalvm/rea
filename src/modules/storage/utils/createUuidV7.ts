type RandomSource = {
    getRandomValues: (array: Uint8Array) => Uint8Array;
};

const byteToHex = Array.from({ length: 256 }, (_, value) => value.toString(16).padStart(2, "0"));

/** Genera IDs UUIDv7 locales, ordenables por tiempo, para entidades SQLite nuevas. */
export default function createUuidV7(now = Date.now()) {
    const bytes = createRandomBytes();
    let timestamp = Math.max(0, Math.min(now, 0xffffffffffff));

    for (let index = 5; index >= 0; index -= 1) {
        bytes[index] = timestamp & 0xff;
        timestamp = Math.floor(timestamp / 0x100);
    }

    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    return [hex(bytes, 0, 4), hex(bytes, 4, 6), hex(bytes, 6, 8), hex(bytes, 8, 10), hex(bytes, 10, 16)].join("-");
}

function createRandomBytes() {
    const bytes = new Uint8Array(16);
    const cryptoSource = (globalThis as { crypto?: RandomSource }).crypto;

    if (cryptoSource?.getRandomValues) {
        cryptoSource.getRandomValues(bytes);
        return bytes;
    }

    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
    }

    return bytes;
}

function hex(bytes: Uint8Array, start: number, end: number) {
    let value = "";

    for (let index = start; index < end; index += 1) {
        value += byteToHex[bytes[index] ?? 0];
    }

    return value;
}
