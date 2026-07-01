// Refreshes dev-stats.json with live GitHub numbers.
// STATS_TOKEN (PAT with repo scope) → full data incl. private repos.
// GITHUB_TOKEN (Actions auto-token) → contributions accurate, repos kept from previous run.
import { writeFileSync, readFileSync } from 'node:fs';

const USER = process.env.STATS_USER || 'KarthikSubramanian07';
const HAS_PAT = !!process.env.STATS_TOKEN;
const TOKEN = process.env.STATS_TOKEN || process.env.GITHUB_TOKEN;
if (!TOKEN) { console.error('No token; skipping.'); process.exit(0); }

async function gql(query, variables = {}) {
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

const prevRaw = (() => { try { return readFileSync('dev-stats.json', 'utf8'); } catch { return '{}'; } })();
const prev = JSON.parse(prevRaw);

const firstCommit = new Date('2021-08-01');
const years = Math.round((Date.now() - firstCommit.getTime()) / (365.25 * 864e5));

// Repos: STATS_TOKEN (PAT) can see private + org repos via viewer.
// GITHUB_TOKEN viewer = github-actions[bot] → wrong count; keep previous value.
let repos = prev.repos ?? 0;
if (HAS_PAT) {
  const d = await gql(
    `{viewer{repositories(ownerAffiliations:OWNER,isFork:false){totalCount}}}`
  );
  repos = d.viewer.repositories.totalCount;
  console.log('Repos (PAT):', repos);
} else {
  console.warn('No STATS_TOKEN — keeping previous repos count:', repos);
}

// Contributions this year (contribution calendar is always public; accurate with any token).
const ly = await gql(
  `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}`,
  { login: USER }
);
const contributions = ly.user.contributionsCollection.contributionCalendar.totalContributions;

// All-time contributions: walk yearly windows from first commit.
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
const next = JSON.stringify(out, null, 2) + '\n';
if (prevRaw.trim() === next.trim()) { console.log('No change.'); }
else { writeFileSync('dev-stats.json', next); console.log('Updated:', out); }
