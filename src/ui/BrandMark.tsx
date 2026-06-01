import { SvgXml } from "react-native-svg";

interface BrandMarkProps {
    color: string;
    size?: number;
}

const MARK_VIEWBOX_WIDTH = 577;
const MARK_VIEWBOX_HEIGHT = 1004;

/** Renderiza isotipo vectorial de Rea para usos compactos en headers. */
export function BrandMark({ color, size = 20 }: BrandMarkProps) {
    const width = (size * MARK_VIEWBOX_WIDTH) / MARK_VIEWBOX_HEIGHT;

    return <SvgXml height={size} width={width} xml={buildBrandMarkXml(color)} />;
}

function buildBrandMarkXml(color: string) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 577 1004" fill="${color}"><g transform="translate(0,1004) scale(0.25,-0.25)"><path d="M1118 3602 c-13 -5 -29 -16 -37 -23 -7 -7 -63 -102 -125 -211 -62 -109 -180 -315 -261 -458 -81 -143 -167 -293 -190 -334 -23 -41 -57 -101 -76 -134 -134 -235 -198 -455 -197 -673 2 -231 77 -430 231 -612 105 -125 273 -247 416 -303 l33 -14 4 11 c3 6 10 22 16 37 43 99 90 253 116 378 11 53 28 156 28 167 0 5 -13 25 -32 47 -34 40 -43 50 -95 113 -18 22 -32 41 -31 43 1 2 -1 6 -5 9 -6 5 -7 4 -1 -3 5 -7 5 -7 -1 -2 -16 15 -67 77 -66 81 1 3 -1 5 -4 5 -9 0 -105 117 -109 134 -10 38 16 72 55 72 30 -1 27 3 171 -169 44 -53 85 -102 90 -109 22 -28 48 -55 50 -53 2 1 3 221 3 488 1 485 1 486 9 497 23 31 56 37 83 17 29 -22 28 9 26 -512 0 -257 0 -467 2 -466 1 1 70 68 153 150 82 82 155 151 160 153 29 11 63 -1 74 -26 14 -30 6 -57 -26 -86 -11 -9 -71 -68 -134 -130 -63 -61 -145 -142 -183 -180 l-69 -67 -12 -76 c-52 -321 -145 -582 -287 -799 -40 -62 -46 -76 -44 -104 2 -37 28 -60 66 -60 28 0 40 9 89 66 148 170 262 264 540 446 196 128 314 245 402 397 184 321 164 709 -60 1118 -31 55 -55 99 -262 461 -69 122 -137 240 -149 262 -12 22 -52 92 -88 156 -36 64 -82 146 -103 182 -50 90 -53 93 -80 108 -34 18 -59 19 -90 6z"/></g></svg>`;
}
