import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const validReleaseKinds = new Set(["none", "patch", "minor", "major"]);
const args = process.argv.slice(2);
const release = readOption(args, "--release") ?? "none";
const dryRun = args.includes("--dry-run");

if (!validReleaseKinds.has(release)) {
    console.error(`Tipo de release no soportado: ${release}`);
    process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const packagePath = path.join(root, "package.json");
const packageLockPath = path.join(root, "package-lock.json");
const appPath = path.join(root, "app.json");

const packageJson = readJson(packagePath);
const packageLockJson = readJson(packageLockPath);
const appJson = readJson(appPath);

const currentVersion = packageJson.version;
const nextVersion = bumpVersion(currentVersion, release);
const currentVersionCode = Number(appJson.expo.android.versionCode ?? 1);
const currentBuildNumber = Number(appJson.expo.ios.buildNumber ?? "1");
const nextVersionCode = bumpCounter(currentVersionCode, release);
const nextBuildNumber = bumpCounter(currentBuildNumber, release);
const shouldWrite = release !== "none" && !dryRun;

if (shouldWrite) {
    packageJson.version = nextVersion;
    packageLockJson.version = nextVersion;

    if (packageLockJson.packages?.[""]) {
        packageLockJson.packages[""].version = nextVersion;
    }

    appJson.expo.version = nextVersion;
    appJson.expo.android.versionCode = nextVersionCode;
    appJson.expo.ios.buildNumber = String(nextBuildNumber);

    writeJson(packagePath, packageJson);
    writeJson(packageLockPath, packageLockJson);
    writeJson(appPath, appJson);
}

process.stdout.write(
    JSON.stringify(
        {
            release,
            dryRun,
            changed: shouldWrite,
            previousVersion: currentVersion,
            version: nextVersion,
            versionCode: nextVersionCode,
            buildNumber: String(nextBuildNumber),
        },
        null,
        4,
    ),
);

function readOption(tokens, name) {
    const inline = tokens.find((token) => token.startsWith(`${name}=`));
    if (inline) {
        return inline.slice(name.length + 1);
    }

    const index = tokens.indexOf(name);
    if (index >= 0 && index + 1 < tokens.length) {
        return tokens[index + 1];
    }

    return null;
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`, "utf8");
}

function bumpCounter(value, releaseKind) {
    return releaseKind === "none" ? value : value + 1;
}

function bumpVersion(version, releaseKind) {
    if (releaseKind === "none") {
        return version;
    }

    const parsed = parseVersion(version);
    let nextMajor = parsed.major;
    let nextMinor = parsed.minor;
    let nextPatch = parsed.patch;

    if (releaseKind === "major") {
        nextMajor += 1;
        nextMinor = 0;
        nextPatch = 0;
    } else if (releaseKind === "minor") {
        nextMinor += 1;
        nextPatch = 0;
    } else if (releaseKind === "patch") {
        nextPatch += 1;
    }

    return `${nextMajor}.${nextMinor}.${nextPatch}`;
}

function parseVersion(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(version);

    if (!match) {
        throw new Error(`Version semantica invalida: ${version}`);
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4] ?? null,
        buildMetadata: match[5] ?? null,
    };
}
