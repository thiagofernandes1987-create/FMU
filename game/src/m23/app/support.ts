/** Rust crates/app/src/screens/support.rs: official public issue destinations.
 * Original opens links on explicit click; no network or external action here. */
export const SUPPORT_ISSUES_URL='https://github.com/Brasfoot-Next/brasfoot-next/issues';
export const DATABASE_ISSUES_URL='https://github.com/Brasfoot-Next/database/issues';
export function supportLinks():readonly string[]{return [SUPPORT_ISSUES_URL,DATABASE_ISSUES_URL];}
