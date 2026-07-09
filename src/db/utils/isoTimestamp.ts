export default function isoTimestamp(date = new Date()): string {
    return date.toISOString();
}
