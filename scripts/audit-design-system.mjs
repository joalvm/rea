import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const docsRoot = join(root, "docs", "design-system");
const sourceRoot = join(root, "src");
const approvedRawColorFiles = new Set([
    "components/brand-splash/BrandSplash.tsx",
    "features/onboarding/shared/components/rea-illustration/ReaIllustration.tsx",
    "features/onboarding/shared/components/rea-illustration/ReaIllustrationStyle.ts",
]);
const requiredScreenDocs = ["onboarding.html", "checkin.html", "diario.html", "period.html"];

const htmlFiles = walk(docsRoot).filter((file) => file.endsWith(".html"));
const violations = [];

for (const file of htmlFiles) {
    const content = readFileSync(file, "utf8");
    const name = relative(root, file);

    if (/\sstyle\s*=/.test(content)) violations.push(`${name}: style inline prohibido`);
    if (/<style\b/i.test(content)) violations.push(`${name}: bloque <style> prohibido`);
    if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(content)) violations.push(`${name}: script inline prohibido`);
    if (!/<link\s+rel="stylesheet"\s+href="(?!https?:)[^"]+"\s*\/?\s*>/i.test(content)) {
        violations.push(`${name}: no consume stylesheet local externo`);
    }

    for (const match of content.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const reference = match[1];
        if (!reference || reference.startsWith("#") || /^(https?:|mailto:|tel:)/.test(reference)) continue;
        const target = reference.split(/[?#]/)[0];
        if (target && !existsSync(join(dirname(file), target))) {
            violations.push(`${name}: referencia local rota (${reference})`);
        }
    }
}

for (const name of requiredScreenDocs) {
    const file = join(docsRoot, "screens", name);
    if (!existsSync(file)) violations.push(`docs/design-system/screens/${name}: screen canónica ausente`);
}

for (const file of walk(sourceRoot).filter((path) => /\.(tsx|ts)$/.test(path))) {
    const relativePath = relative(sourceRoot, file).replaceAll("\\", "/");
    if (relativePath.startsWith("theme/") || approvedRawColorFiles.has(relativePath)) continue;

    const content = readFileSync(file, "utf8");
    if (/#(?:[0-9a-fA-F]{3,8})\b|rgba?\(/.test(content))
        violations.push(`src/${relativePath}: color directo fuera de theme`);
}

if (violations.length > 0) {
    console.error("Design system audit falló:");
    violations.forEach((violation) => console.error(`- ${violation}`));
    process.exitCode = 1;
} else {
    console.log(`✓ ${htmlFiles.length} HTML sin estilos/scripts inline.`);
    console.log("✓ Guías visuales canónicas requeridas existen.");
    console.log("✓ Sin colores directos fuera de theme ni excepciones aprobadas.");
}

function walk(directory) {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}
