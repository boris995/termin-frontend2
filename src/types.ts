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
  cardImageX?: number;
  cardImageY?: number;
  cardImageScale?: number;
  galleryImages?: string[];
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  overallRating: number;
  audienceRating?: number | null;
  audienceRatingCount?: number;
  goals: number;
  assists: number;
  showOnHome?: boolean;
  teamId: number;
  seasonId: number;
  team?: Team;
  matchStats?: PlayerMatchStat[];
}

export interface PlayerMatchStat {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
  goals: number;
  assists: number;
  team?: Team;
  match?: Match;
}

export interface Match {
  id: number;
  seasonId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  matchNumber: number;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
  votingEnabled?: boolean;
  reportSummary?: string | null;
  timelineEvents?: MatchTimelineEvent[];
  status: 'played' | 'cancelled';
  homeTeam: Team;
  awayTeam: Team;
  winnerTeam?: Team | null;
  playerStats?: Array<{ player: Player; team: Team; goals: number; assists: number }>;
  ratingSummary?: Record<number, { count: number; average: number; total: number }>;
  motmSummary?: Record<number, number>;
  comments?: MatchComment[];
}

export interface MatchComment {
  id: number;
  matchId: number;
  authorName?: string | null;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchTimelineEvent {
  minute: string;
  type: 'goal' | 'yellow-card' | 'red-card' | 'note';
  teamId?: number | null;
  playerId?: number | null;
  assistPlayerId?: number | null;
  description?: string | null;
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
  settings?: AppSettings;
}

export type CardDesign = 'standard' | 'gold';
export type SiteDesign = 'classic' | 'premium';

export interface AppSettings {
  cardDesign: CardDesign;
  siteDesign?: SiteDesign;
  showClassicHomeIntroSection?: boolean;
}

export interface DonationPage {
  eyebrow: string;
  title: string;
  intro: string;
  impactTitle: string;
  impactBody: string;
  paymentTitle: string;
  paymentBody: string;
  bankAccount?: string | null;
  recipientName?: string | null;
  paymentPurpose?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: 'create' | 'update' | 'delete' | 'start' | 'finish' | 'settings';
  entityType: string;
  entityId?: string | null;
  label?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface VotingAnalyticsPlayerAverage {
  playerId: number;
  playerName: string;
  teamId: number;
  teamShortName: string;
  average: number;
  count: number;
}

export interface VotingAnalyticsMatchSummary {
  matchId: number;
  matchNumber: number;
  playedAt: string;
  homeTeam?: Team;
  awayTeam?: Team;
  average: number | null;
  count: number;
  topRated: VotingAnalyticsPlayerAverage | null;
  playerAverages: VotingAnalyticsPlayerAverage[];
}

export interface VotingAnalyticsPlayerTrend {
  playerId: number;
  playerName: string;
  teamId: number;
  teamShortName: string;
  overallAverage: number | null;
  totalVotes: number;
  trend: Array<{ matchId: number; matchNumber: number; average: number; count: number }>;
}

export interface VotingAnalyticsData {
  season: Season;
  totalVotes: number;
  ratedMatches: number;
  ratedPlayers: number;
  matchSummaries: VotingAnalyticsMatchSummary[];
  playerTrends: VotingAnalyticsPlayerTrend[];
}
