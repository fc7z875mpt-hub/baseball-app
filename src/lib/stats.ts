/** Agregace PlayerMatchStat → sezónní statistiky */

export type MatchStatRow = {
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  errors: number;
  putouts: number;
  assists: number;
  inningsInField: number;
};

export type AggregatedStats = {
  games: number;
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  errors: number;
  putouts: number;
  assists: number;
  inningsInField: number;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
};

export function aggregateStats(rows: MatchStatRow[]): AggregatedStats {
  const empty: AggregatedStats = {
    games: 0,
    atBats: 0,
    hits: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    runs: 0,
    rbi: 0,
    walks: 0,
    strikeouts: 0,
    errors: 0,
    putouts: 0,
    assists: 0,
    inningsInField: 0,
    avg: null,
    obp: null,
    slg: null,
    ops: null,
  };

  if (!rows.length) return empty;

  const s = rows.reduce(
    (acc, r) => ({
      games: acc.games + 1,
      atBats: acc.atBats + r.atBats,
      hits: acc.hits + r.hits,
      singles: acc.singles + r.singles,
      doubles: acc.doubles + r.doubles,
      triples: acc.triples + r.triples,
      homeRuns: acc.homeRuns + r.homeRuns,
      runs: acc.runs + r.runs,
      rbi: acc.rbi + r.rbi,
      walks: acc.walks + r.walks,
      strikeouts: acc.strikeouts + r.strikeouts,
      errors: acc.errors + r.errors,
      putouts: acc.putouts + r.putouts,
      assists: acc.assists + r.assists,
      inningsInField: acc.inningsInField + r.inningsInField,
    }),
    {
      games: 0,
      atBats: 0,
      hits: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      runs: 0,
      rbi: 0,
      walks: 0,
      strikeouts: 0,
      errors: 0,
      putouts: 0,
      assists: 0,
      inningsInField: 0,
    }
  );

  const avg = s.atBats > 0 ? s.hits / s.atBats : null;
  const plateAppearances = s.atBats + s.walks;
  const obp = plateAppearances > 0 ? (s.hits + s.walks) / plateAppearances : null;
  const totalBases = s.singles + 2 * s.doubles + 3 * s.triples + 4 * s.homeRuns;
  const slg = s.atBats > 0 ? totalBases / s.atBats : null;
  const ops = obp != null && slg != null ? obp + slg : null;

  return { ...s, avg, obp, slg, ops };
}

export function formatAvg(v: number | null): string {
  if (v == null) return "–";
  if (v >= 1) return v.toFixed(3);
  return v.toFixed(3).replace(/^0/, "");
}
