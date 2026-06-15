import { describe, expect, it, jest } from "@jest/globals";

import uuid from "@/db/utils/uuid";

const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV7(value: string): boolean {
    return uuidV7Pattern.test(value);
}

jest.mock("expo-crypto", () => ({
    getRandomValues(bytes: Uint8Array) {
        bytes.forEach((_, index) => {
            bytes[index] = (index * 17 + 31) % 256;
        });

        return bytes;
    },
}));

describe("uuid", () => {
    it("generates valid UUIDv7 values", () => {
        const id = uuid();

        expect(isUuidV7(id)).toBe(true);
        expect(id.charAt(14)).toBe("7");
    });

    it("encodes the timestamp in lexicographic order", () => {
        const firstId = uuid(new Date("2026-01-01T00:00:00.000Z").getTime());
        const secondId = uuid(new Date("2026-01-01T00:00:01.000Z").getTime());

        expect(firstId < secondId).toBe(true);
    });
});
