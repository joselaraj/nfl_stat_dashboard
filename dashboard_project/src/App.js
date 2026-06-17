import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QBs from './pages/QBs';
import QBDetail from './pages/QBDetail';
import RBs from './pages/RBs';
import RBDetail from './pages/RBDetail';
import WRs from './pages/WRs';
import WRDetail from './pages/WRDetail';
import TEs from './pages/TEs';
import TEDetail from './pages/TEDetail';
import Ks from './pages/Kickers';
import KickerDetail from './pages/KDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/qbs" element={<QBs />} />
      <Route path="/qbs/:player_id/detail" element={<QBDetail />} />
      <Route path="/rbs" element={<RBs />} />
      <Route path="/rbs/:player_id/detail" element={<RBDetail />} />
      <Route path="/wrs" element={<WRs />} />
      <Route path="/wrs/:player_id/detail" element={<WRDetail />} />
      <Route path="/tes" element={<TEs />} />
      <Route path="/tes/:player_id/detail" element={<TEDetail />} />
      <Route path="/k" element={<Ks />} />
      <Route path="/k/:player_id/detail" element={<KickerDetail />} />
    </Routes>
  );
}

export default App;