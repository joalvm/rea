import { describe, expect, it } from "@jest/globals";

import { buildContent } from "@/modules/notifications/buildContent";

const copy = { title: "Rea · check-in", body: "¿Cómo estás hoy?" };

describe("buildContent", () => {
    it("en modo discreto oculta el contenido real y se queda mudo", () => {
        const content = buildContent({
            type: "daily_checkin",
            discreet: true,
            copy,
            deepLink: "/checkin",
        });

        expect(content.title).toBe("Rea");
        expect(content.body).toBe(copy.body);
        expect(content.sound).toBe(false);
        expect(content.interruptionLevel).toBe("passive");
        expect(content.data).toEqual({ url: "rea://checkin", type: "daily_checkin" });
    });

    it("en modo explicito usa el copy completo y suena", () => {
        const content = buildContent({
            type: "daily_checkin",
            discreet: false,
            copy,
            deepLink: "/checkin",
        });

        expect(content.title).toBe(copy.title);
        expect(content.body).toBe(copy.body);
        expect(content.sound).toBe("default");
        expect(content.data).toEqual({ url: "rea://checkin", type: "daily_checkin" });
    });

    it("construye el deep link sin duplicar la barra inicial", () => {
        const content = buildContent({
            type: "daily_checkin",
            discreet: true,
            copy,
            deepLink: "/(tabs)",
        });

        expect(content.data).toEqual({ url: "rea://(tabs)", type: "daily_checkin" });
    });
});
