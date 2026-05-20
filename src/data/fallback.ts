import { CmsBlock, HomeData, Match, NextMatch, Player, Season, Team } from '../types';

export const fallbackSeason: Season = {
  id: 1,
  number: 1,
  name: 'Duel Liga: Sezona 1',
  winsToWinSeason: 8,
  status: 'active'
};

export const fallbackTeams: Team[] = [
  { id: 1, name: 'Team Red', shortName: 'RED', primaryColor: '#EF4444', seasonId: 1, wins: 3, losses: 2 },
  { id: 2, name: 'Team Blue', shortName: 'BLU', primaryColor: '#3B82F6', seasonId: 1, wins: 2, losses: 3 }
];

export const fallbackMatches: Match[] = [
  {
    id: 5,
    matchNumber: 5,
    homeScore: 6,
    awayScore: 4,
    playedAt: new Date().toISOString(),
    votingEnabled: true,
    status: 'played',
    homeTeam: fallbackTeams[0],
    awayTeam: fallbackTeams[1],
    winnerTeam: fallbackTeams[0],
    playerStats: []
  },
  {
    id: 4,
    matchNumber: 4,
    homeScore: 3,
    awayScore: 1,
    playedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnabled: true,
    status: 'played',
    homeTeam: fallbackTeams[1],
    awayTeam: fallbackTeams[0],
    winnerTeam: fallbackTeams[1],
    playerStats: []
  },
  {
    id: 3,
    matchNumber: 3,
    homeScore: 2,
    awayScore: 1,
    playedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnabled: true,
    status: 'played',
    homeTeam: fallbackTeams[0],
    awayTeam: fallbackTeams[1],
    winnerTeam: fallbackTeams[0],
    playerStats: []
  }
];

export const fallbackPlayers: Player[] = [
  {
    id: 1,
    firstName: 'Boris',
    lastName: 'Djukusic',
    nickname: 'Boki',
    position: 'golman-igrac',
    shirtNumber: 1,
    cardImageUrl: '/player-assets/player-card.svg?player=boris',
    galleryImages: ['/player-assets/player-photo.svg?player=boris&photo=1', '/player-assets/player-photo.svg?player=boris&photo=2', '/player-assets/player-photo.svg?player=boris&photo=3'],
    pac: 78,
    sho: 74,
    pas: 81,
    dri: 79,
    def: 72,
    phy: 84,
    overallRating: 78,
    goals: 8,
    assists: 2,
    teamId: 1,
    seasonId: 1,
    team: fallbackTeams[0]
  },
  {
    id: 2,
    firstName: 'Obrad',
    lastName: 'Pejic',
    position: 'igrac',
    shirtNumber: 7,
    cardImageUrl: '/player-assets/player-card.svg?player=obrad',
    galleryImages: ['/player-assets/player-photo.svg?player=obrad&photo=1', '/player-assets/player-photo.svg?player=obrad&photo=2'],
    pac: 82,
    sho: 77,
    pas: 70,
    dri: 76,
    def: 58,
    phy: 73,
    overallRating: 73,
    goals: 3,
    assists: 7,
    teamId: 1,
    seasonId: 1,
    team: fallbackTeams[0]
  },
  {
    id: 3,
    firstName: 'Vladimir',
    lastName: 'Peric',
    nickname: 'Vlado',
    position: 'igrac',
    shirtNumber: 10,
    cardImageUrl: '/player-assets/player-card.svg?player=vladimir',
    galleryImages: ['/player-assets/player-photo.svg?player=vladimir&photo=1', '/player-assets/player-photo.svg?player=vladimir&photo=2', '/player-assets/player-photo.svg?player=vladimir&photo=3'],
    pac: 75,
    sho: 80,
    pas: 84,
    dri: 83,
    def: 61,
    phy: 70,
    overallRating: 76,
    goals: 5,
    assists: 1,
    teamId: 1,
    seasonId: 1,
    team: fallbackTeams[0]
  },
  {
    id: 4,
    firstName: 'Nedeljko',
    lastName: 'Babic',
    position: 'golman',
    shirtNumber: 12,
    cardImageUrl: '/player-assets/player-card.svg?player=nedeljko',
    galleryImages: ['/player-assets/player-photo.svg?player=nedeljko&photo=1', '/player-assets/player-photo.svg?player=nedeljko&photo=2'],
    pac: 61,
    sho: 48,
    pas: 66,
    dri: 63,
    def: 85,
    phy: 81,
    overallRating: 67,
    goals: 4,
    assists: 6,
    teamId: 2,
    seasonId: 1,
    team: fallbackTeams[1]
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Lejic',
    nickname: 'Daki',
    position: 'igrac',
    shirtNumber: 9,
    cardImageUrl: '/player-assets/player-card.svg?player=david',
    galleryImages: ['/player-assets/player-photo.svg?player=david&photo=1', '/player-assets/player-photo.svg?player=david&photo=2', '/player-assets/player-photo.svg?player=david&photo=3'],
    pac: 86,
    sho: 82,
    pas: 73,
    dri: 85,
    def: 55,
    phy: 76,
    overallRating: 76,
    goals: 6,
    assists: 3,
    teamId: 2,
    seasonId: 1,
    team: fallbackTeams[1]
  }
];

export const fallbackNextMatch: NextMatch = {
  id: 1,
  seasonId: 1,
  homeTeamId: 2,
  awayTeamId: 1,
  scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  venue: 'City Arena',
  note: 'Team Blue trazi odgovor poslije poraza, dok Team Red pokusava produziti pobjednicki niz.',
  status: 'scheduled',
  homeTeam: fallbackTeams[1],
  awayTeam: fallbackTeams[0],
  season: fallbackSeason
};

export const fallbackContentBlocks: CmsBlock[] = [
  {
    id: 1,
    title: 'Team Red preuzeo kontrolu nakon utakmice sa deset golova',
    type: 'news',
    sortOrder: 1,
    isPublished: true,
    body:
      'Utakmica koja je trebala biti oprezan duel pretvorila se u otvorenu trku od prvog minuta. Team Red je slavio rezultatom 6:4 i tako napravio vazan korak u borbi za titulu.\n\n' +
      'Kljucni trenutak dosao je u zavrsnici, kada je Red vezao dva brza gola i prelomio ritam susreta. Blue je imao periode dominacije, ali nije uspio sacuvati koncentraciju u odbrani.'
  },
  {
    id: 2,
    title: 'Najava kola: pritisak je sada na plavima',
    type: 'announcement',
    sortOrder: 2,
    isPublished: true,
    body:
      'Sljedeca utakmica mogla bi biti jedna od najvaznijih u dosadasnjem toku sezone. Team Blue ulazi sa jasnim zadatkom: smanjiti razliku i vratiti neizvjesnost u duel ligu.'
  }
];

export const fallbackHome: HomeData = {
  season: fallbackSeason,
  lastMatch: fallbackMatches[0],
  nextMatch: fallbackNextMatch,
  contentBlocks: fallbackContentBlocks
};
