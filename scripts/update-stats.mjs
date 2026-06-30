// Refreshes dev-stats.json with live GitHub numbers.
// Uses STATS_TOKEN (a PAT, incl. private contributions) if set, else GITHUB_TOKEN (public only).
import { writeFileSync, readFileSync } from 'node:fs';

const USER = process.env.STATS_USER || 'KarthikSubramanian07';
const TOKEN = process.env.STATS_TOKEN || process.env.GITHUB_TOKEN;
if (!TOKEN) { console.error('No token; skipping.'); process.exit(0); }

async function gql(query, variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`GraphQL ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

const meta = await gql(`query($login:String!){user(login:$login){repositories(ownerAffiliations:OWNER){totalCount}}}`, { login: USER });
const firstCommit = new Date('2021-08-01');
const years = Math.round((Date.now() - firstCommit.getTime()) / (365.25 * 864e5));
const repos = meta.user.repositories.totalCount;

// contributions in the last year
const lastYear = await gql(`query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}`, { login: USER });
const contributions = lastYear.user.contributionsCollection.contributionCalendar.totalContributions;

// all-time commit contributions, walking yearly windows from first commit
let commits = 0;
let start = new Date(firstCommit);
const now = new Date();
while (start < now) {
  const end = new Date(Math.min(start.getTime() + 365 * 864e5, now.getTime()));
  const d = await gql(
    `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions}}}}`,
    { login: USER, from: start.toISOString(), to: end.toISOString() }
  );
  commits += d.user.contributionsCollection.contributionCalendar.totalContributions;
  start = end;
}

const out = { commits, contributions, repos, years, updated: new Date().toISOString().slice(0, 10) };
const prev = (() => { try { return readFileSync('dev-stats.json', 'utf8'); } catch { return ''; } })();
const next = JSON.stringify(out, null, 2) + '\n';
if (prev.trim() === next.trim()) { console.log('No change.'); }
else { writeFileSync('dev-stats.json', next); console.log('Updated:', out); }
