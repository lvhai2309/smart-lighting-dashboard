import React, { useState, useEffect, useRef } from 'react';
import { lightingApi } from './api/lightingApi';
import ControlPanel from './components/ControlPanel';
import CabinetManager from './components/CabinetManager';
import LampManager from './components/LampManager';
import ScenarioManager from './components/ScenarioManager';
function App() {
  const [activeTab, setActiveTab] = useState('control');
  const [cabinets, setCabinets] = useState([]);
  const [lamps, setLamps] = useState([]);

  // KHÓA ĐỒNG BỘ: Chống "giật lùi" dữ liệu
  const lastActionTime = useRef(0);
  const notifyAction = () => { lastActionTime.current = Date.now(); };

  const [controlSession, setControlSession] = useState({
    selectedId: null, selectedType: 'cabinet', openCabinetId: null, cabinetPower: {}
  });

  const reloadData = async () => {
    try {
      // NẾU VỪA ĐIỀU KHIỂN TRONG VÒNG 8 GIÂY -> Tạm dừng tải dữ liệu cũ đè lên
      if (Date.now() - lastActionTime.current < 8000) return;

      const [cabRes, devRes] = await Promise.all([
        lightingApi.cabinet.getAll(), lightingApi.device.getAll()
      ]);
      const cabs = cabRes.metadata || cabRes;
      const devs = devRes.metadata || devRes;
      
      setCabinets(cabs);
      setLamps(devs);

      if (Object.keys(controlSession.cabinetPower).length === 0 && cabs.length > 0) {
        const initialPower = {};
        cabs.forEach(c => initialPower[c.cabinetid] = true);
        setControlSession(prev => ({
          ...prev, cabinetPower: initialPower,
          selectedId: prev.selectedId || cabs[0].cabinetid,
          openCabinetId: prev.openCabinetId || cabs[0].cabinetid
        }));
      }
    } catch (e) { console.error("Lỗi đồng bộ:", e); }
  };

  useEffect(() => {
    reloadData(); 
    const timer = setInterval(reloadData, 5000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white shadow-md">
        <div className="flex gap-6 max-w-7xl mx-auto font-bold uppercase text-xs">
          <button className={`${activeTab === 'control' ? 'border-b-2 border-white' : 'opacity-70'}`} onClick={() => setActiveTab('control')}>Điều khiển & Giám sát</button>
          <button className={`${activeTab === 'cabinets' ? 'border-b-2 border-white' : 'opacity-70'}`} onClick={() => setActiveTab('cabinets')}>Quản lý Tủ điện</button>
          <button className={`${activeTab === 'lamps' ? 'border-b-2 border-white' : 'opacity-70'}`} onClick={() => setActiveTab('lamps')}>Quản lý Đèn</button>
          <button className={`${activeTab === 'scenario' ? 'border-b-2 border-white' : 'opacity-70'}`} onClick={() => setActiveTab('scenario')}>Kịch bản</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-4">
        {activeTab === 'control' && (
          <ControlPanel cabinets={cabinets} lamps={lamps} setLamps={setLamps} session={controlSession} setSession={setControlSession} notifyAction={notifyAction} />
        )}
        {/* Truyền dữ liệu trực tiếp xuống các trang quản lý để hiển thị trạng thái */}
        {activeTab === 'cabinets' && <CabinetManager cabinets={cabinets} lamps={lamps} reloadData={reloadData} />}
        {activeTab === 'lamps' && <LampManager cabinets={cabinets} lamps={lamps} reloadData={reloadData} />}
        {activeTab === 'scenario' && <ScenarioManager />}
      </div>
    </div>
  );
}

export default App;
