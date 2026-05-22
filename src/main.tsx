import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './index.css';
import { AppLayout } from './components/AppLayout';
import { CardDesignProvider } from './components/CardDesignProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/PublicLayout';
import { AuditLogs } from './pages/AuditLogs';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Matches } from './pages/Matches';
import { Players } from './pages/Players';
import { PlayerEditor } from './pages/PlayerEditor';
import { PublicAnnouncement } from './pages/PublicAnnouncement';
import { PublicDonation } from './pages/PublicDonation';
import { PublicPlayerDetail } from './pages/PublicPlayerDetail';
import { PublicPlayers } from './pages/PublicPlayers';
import { PublicMatchDetail } from './pages/PublicMatchDetail';
import { PublicResults } from './pages/PublicResults';
import { PublicSeasonDetail } from './pages/PublicSeasonDetail';
import { PublicSeasons } from './pages/PublicSeasons';
import { PublicSearch } from './pages/PublicSearch';
import { Seasons } from './pages/Seasons';
import { Teams } from './pages/Teams';
import { Cms } from './pages/Cms';
import { VotingAnalytics } from './pages/VotingAnalytics';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CardDesignProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="sezone" element={<PublicSeasons />} />
            <Route path="sezone/:id" element={<PublicSeasonDetail />} />
            <Route path="ekipe" element={<PublicSeasons />} />
            <Route path="rezultati" element={<PublicResults />} />
            <Route path="rezultati/:id" element={<PublicMatchDetail />} />
            <Route path="igraci" element={<PublicPlayers />} />
            <Route path="igraci/:id" element={<PublicPlayerDetail />} />
            <Route path="najava" element={<PublicAnnouncement />} />
            <Route path="donacije" element={<PublicDonation />} />
            <Route path="pretraga" element={<PublicSearch />} />
          </Route>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="voting-analytics" element={<VotingAnalytics />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="cms" element={<Navigate to="/cms/settings" replace />} />
              <Route path="cms/settings" element={<Cms section="settings" />} />
              <Route path="cms/content" element={<Cms section="content" />} />
              <Route path="cms/donation" element={<Cms section="donation" />} />
              <Route path="cms/next-match" element={<Cms section="next-match" />} />
              <Route path="cms/blocks" element={<Cms section="blocks" />} />
              <Route path="cms/next-matches" element={<Cms section="next-matches" />} />
              <Route path="seasons" element={<Seasons />} />
              <Route path="seasons/:id/teams" element={<Teams />} />
              <Route path="seasons/:id/players" element={<Players />} />
              <Route path="admin/players/:id" element={<PlayerEditor />} />
              <Route path="seasons/:id/matches" element={<Matches />} />
            </Route>
          </Route>
        </Routes>
      </CardDesignProvider>
    </Router>
  </React.StrictMode>
);
