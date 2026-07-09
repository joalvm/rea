/**
 * Permite importar archivos `*.svg` como componentes React Native cuando Metro usa
 * `react-native-svg-transformer` (ver `metro.config.js`). Sin esta declaración,
 * TypeScript no conoce el módulo y `import Art from "@assets/.../x.svg"` no compila.
 */
declare module "*.svg" {
    import type { FC } from "react";
    import type { SvgProps } from "react-native-svg";

    const content: FC<SvgProps>;
    export default content;
}
