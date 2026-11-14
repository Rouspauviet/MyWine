// Routes de l'application — HashRouter : fonctionne sur n'importe quel hébergement statique
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/Home'
import Sleep from './screens/Sleep'
import Tasting from './screens/Tasting'
import Reveal from './screens/Reveal'
import Comparison from './screens/Comparison'
import RecordEdit from './screens/RecordEdit'
import Journal from './screens/Journal'
import Entry from './screens/Entry'
import Settings from './screens/Settings'
import HostNew from './screens/HostNew'
import HostSession from './screens/HostSession'
import Join from './screens/Join'
import Group from './screens/Group'
import JoinScan from './screens/JoinScan'
import Palate from './screens/Palate'
import Grape from './screens/Grape'
import Quiz from './screens/Quiz'
import AssistantJoin from './screens/AssistantJoin'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Mode Aveugle */}
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/tasting/:id" element={<Tasting />} />
        <Route path="/reveal/:id" element={<Reveal />} />
        <Route path="/comparison/:id" element={<Comparison />} />
        {/* Dégustation à plusieurs : l'hôte crée l'invitation, les invités arrivent par /join/:token
            (lien ou QR code ouverts dans le navigateur, ou scannés depuis l'app sur /join) */}
        <Route path="/group" element={<Group />} />
        <Route path="/join" element={<JoinScan />} />
        <Route path="/host/new" element={<HostNew />} />
        <Route path="/host/:id" element={<HostSession />} />
        <Route path="/join/:token" element={<Join />} />
        {/* Mode Mémoire */}
        <Route path="/memory/new" element={<RecordEdit />} />
        {/* Journal */}
        <Route path="/journal" element={<Journal />} />
        <Route path="/palate" element={<Palate />} />
        <Route path="/grape/:name" element={<Grape />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/entry/:id" element={<Entry />} />
        <Route path="/entry/:id/edit" element={<RecordEdit />} />
        <Route path="/settings" element={<Settings />} />
        {/* Assistant prêté par un ami : lien de partage chiffré */}
        <Route path="/assistant/:token" element={<AssistantJoin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
