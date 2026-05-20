export interface Season {
  id: number;
  number: number;
  name: string;
  winsToWinSeason: number;
  status: 'active' | 'completed';
  winnerTeamId?: number | null;
  winnerTeam?: Team | null;
} 

export interface Team {
  id: number;
  name: string;
  shortName: string;
  logoUrl?: string | null;
  representativeName?: string | null;
  primaryColor?: string;
  seasonId: number;
  wins?: number;
  losses?: number;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  position: 'golman' | 'igrac' | 'golman-igrac';
  shirtNumber: number;
  cardImageUrl?: string | null;
  galleryImages?: string[];
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  overallRating: number;
  goals: number;
  assists: number;
  showOnHome?: boolean;
  teamId: number;
  seasonId: number;
  team?: Team;
}

export interface Match {
  id: number;
  matchNumber: number;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
  votingEnabled?: boolean;
  status: 'played' | 'cancelled';
  homeTeam: Team;
  awayTeam: Team;
  winnerTeam?: Team | null;
  playerStats?: Array<{ player: Player; team: Team; goals: number; assists: number }>;
  ratingSummary?: Record<number, { count: number; average: number; total: number }>;
  motmSummary?: Record<number, number>;
}

export interface CmsBlock {
  id: number;
  title: string;
  body: string;
  type: 'text' | 'news' | 'announcement';
  imageUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface NextMatch {
  id: number;
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  venue?: string | null;
  note?: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  startedAt?: string | null;
  endedAt?: string | null;
  matchId?: number | null;
  homeTeam: Team;
  awayTeam: Team;
  season?: Season;
  match?: Match | null;
}

export interface DashboardData {
  season: Season;
  teams: Team[];
  topScorers: Player[];
  topAssists: Player[];
  totalMatchesPlayed: number;
}

export interface HomeData {
  season: Season | null;
  teams?: Team[];
  lastMatch: Match | null;
  lastMatches?: Match[];
  nextMatch: NextMatch | null;
  homeFeaturedPlayers?: Player[];
  contentBlocks: CmsBlock[];
}
