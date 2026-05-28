import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const validReleaseKinds = new Set(["none", "build", "patch", "minor", "major"]);
const args = process.argv.slice(2);
const releaseIndex = args.indexOf("--release");
const release = releaseIndex >= 0 ? args[releaseIndex + 1] : "none";

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
const nextVersionCode = bumpCounter(Number(appJson.expo.android.versionCode ?? 1), release);
const nextBuildNumber = bumpCounter(Number(appJson.expo.ios.buildNumber ?? "1"), release);

if (release !== "none") {
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
            changed: release !== "none",
            version: nextVersion,
            versionCode: nextVersionCode,
            buildNumber: String(nextBuildNumber),
        },
        null,
        4,
    ),
);

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
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

    if (!match) {
        throw new Error(`Version semantica invalida: ${version}`);
    }

    let [, major, minor, patch] = match;
    let nextMajor = Number(major);
    let nextMinor = Number(minor);
    let nextPatch = Number(patch);

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
