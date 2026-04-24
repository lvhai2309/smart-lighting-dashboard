import React from 'react';
import { lightingApi } from '../api/lightingApi';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

const createCustomIcon = (emoji, color, glow = false) => L.divIcon({
    html: `<div style="
        font-size: 20px; background: ${color}; width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; border: 2px solid white;
        box-shadow: ${glow ? `0 0 15px ${color}, 0 0 5px ${color}` : '2px 2px 5px rgba(0,0,0,0.3)'};
    ">${emoji}</div>`,
    className: '',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
});

const cabinetIcon = createCustomIcon('🏢', '#ef4444'); 
const lampOnIcon = createCustomIcon('💡', '#22c55e', true); 
const lampOffIcon = createCustomIcon('💡', '#9ca3af'); 

const parseCoord = (val) => {
    if (!val) return null;
    const parsed = parseFloat(String(val).replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
};

function MapUpdater({ center }) {
    const map = useMap();
    React.useEffect(() => { 
        if (center && center[0] !== null) { map.flyTo(center, 16, { duration: 1.5 }); setTimeout(() => map.invalidateSize(), 300); } 
    }, [center, map]);
    return null;
}

export default function ControlPanel({ cabinets, lamps, setLamps, session, setSession, notifyAction }) {
    const { selectedId, selectedType, openCabinetId, unsavedDim } = session;
    const updateSession = (fields) => setSession(p => ({ ...p, ...fields }));

    const activeLamp = selectedType === 'lamp' ? lamps.find(l => Number(l.deviceid) === Number(selectedId)) : null;
    const activeCabinetId = selectedType === 'cabinet' ? selectedId : activeLamp?.cabinetid;
    const activeCabinet = cabinets.find(c => Number(c.cabinetid) === Number(activeCabinetId));
    const lampsInActiveCabinet = lamps.filter(l => Number(l.cabinetid) === Number(activeCabinetId));
    
    // ==========================================
    // LOGIC MỚI: TỦ BẬT KHI CÓ ÍT NHẤT 1 ĐÈN THỰC TẾ ĐANG SÁNG
    // Nếu tất cả tắt hoặc mất kết nối -> Tủ tự động báo Tắt
    // ==========================================
    const isCabinetOn = lampsInActiveCabinet.length > 0 && lampsInActiveCabinet.some(l => l.isOn === true);
    
    const getRealDimLevel = () => {
        if (unsavedDim !== null) return unsavedDim;
        if (selectedType === 'cabinet') {
            if (!isCabinetOn) return 0;
            // Tìm đèn đang sáng đầu tiên để lấy % độ sáng đại diện cho Tủ
            const firstOnLamp = lampsInActiveCabinet.find(l => l.isOn);
            return firstOnLamp?.dimLevel ?? 100;
        } else {
            return activeLamp?.isOn ? (activeLamp?.dimLevel ?? 100) : 0;
        }
    };
    const currentDimLevel = getRealDimLevel();

    const getCenter = () => {
        if (selectedType === 'lamp' && activeLamp && parseCoord(activeLamp.latitude)) return [parseCoord(activeLamp.latitude), parseCoord(activeLamp.longitude)];
        if (activeCabinet && parseCoord(activeCabinet.latitude)) return [parseCoord(activeCabinet.latitude), parseCoord(activeCabinet.longitude)];
        return [21.0285, 105.8542];
    };
    const mapCenter = getCenter();

    const calcPower = () => {
        if (selectedType === 'lamp' && activeLamp) {
            const p = activeLamp.capacity || 0;
            return { u: 220, i: activeLamp.isOn ? (p / 220).toFixed(2) : '0.00', p: activeLamp.isOn ? p : 0, wh: (p * 5).toFixed(1) };
        } else {
            const totalP = lampsInActiveCabinet.reduce((sum, lamp) => sum + (lamp.isOn ? parseInt(lamp.capacity || 0) : 0), 0);
            return { u: 220, i: (totalP / 220).toFixed(2), p: totalP, wh: (totalP * 5).toFixed(1) };
        }
    };
    const energyData = calcPower();

    const handleSelectItem = (type, id, openId) => {
        updateSession({ selectedType: type, selectedId: id, openCabinetId: openId, unsavedDim: null });
    };

    const handleToggleCabinet = async () => {
        const codes = lampsInActiveCabinet.map(l => l.devicecode).filter(Boolean);
        if (codes.length === 0) {
            alert("⚠️ Tủ này chưa có thiết bị nào bên trong để điều khiển!");
            return;
        }

        if (typeof notifyAction === 'function') notifyAction();
        const newState = !isCabinetOn; // Đảo ngược trạng thái hiện tại
        
        // Reset nháp
        updateSession({ unsavedDim: null });
        
        // Cập nhật Giao diện ngay lập tức (Tất cả đèn trong tủ thành Bật/Tắt)
        setLamps(lamps.map(l => Number(l.cabinetid) === Number(activeCabinetId) ? { ...l, dimLevel: newState ? 100 : 0, isOn: newState } : l));
        
        try { 
            await lightingApi.mqtt.controlBatch({ deviceCodes: codes, isOn: newState, brightness: newState ? 100 : 0 }); 
        } catch (e) {
            alert("Lỗi kết nối tới Server MQTT!");
        }
    };

    const handleSelectDimming = (val) => {
        updateSession({ unsavedDim: val }); 
    };

    const handleSaveConfig = async () => {
        if (!isCabinetOn) {
            alert("⚠️ Không thể lưu! Tủ điện đang TẮT hoặc mất kết nối. Vui lòng kiểm tra lại tủ trước khi cấu hình độ sáng.");
            return;
        }

        const codes = selectedType === 'cabinet' 
            ? lampsInActiveCabinet.map(l => l.devicecode).filter(Boolean) 
            : [activeLamp?.devicecode].filter(Boolean);
        
        if (codes.length === 0) {
            alert("⚠️ Không tìm thấy mã thiết bị!"); return;
        }

        if (typeof notifyAction === 'function') notifyAction();

        try {
            await lightingApi.mqtt.controlBatch({ deviceCodes: codes, isOn: currentDimLevel > 0, brightness: currentDimLevel });

            setLamps(lamps.map(l => {
                if (selectedType === 'cabinet' && Number(l.cabinetid) === Number(selectedId)) return { ...l, dimLevel: currentDimLevel, isOn: currentDimLevel > 0 };
                if (selectedType === 'lamp' && Number(l.deviceid) === Number(selectedId)) return { ...l, dimLevel: currentDimLevel, isOn: currentDimLevel > 0 };
                return l;
            }));

            alert("✅ Đã lưu cấu hình độ sáng thành công!");
            updateSession({ unsavedDim: null });
        } catch (e) { 
            alert("❌ Lỗi mạng khi điều khiển đèn!"); 
        }
    };

    if (cabinets.length === 0) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">ĐANG ĐỒNG BỘ...</div>;

    return (
        <div className="flex bg-gray-50 min-h-[85vh] mt-2 border-t-4 border-green-600 shadow-md">
            {/* SIDEBAR */}
            <div className="w-1/4 bg-white border-r overflow-y-auto z-10">
                <div className="bg-green-600 text-white font-bold p-4">DANH SÁCH THIẾT BỊ</div>
                <div className="p-2">
                    {cabinets.map(cabinet => {
                        const isExpanded = Number(openCabinetId) === Number(cabinet.cabinetid);
                        const isSelected = selectedType === 'cabinet' && Number(selectedId) === Number(cabinet.cabinetid);
                        const cabinetLamps = lamps.filter(l => Number(l.cabinetid) === Number(cabinet.cabinetid));
                        
                        // Đèn LED của Tủ cũng hoạt động dựa trên trạng thái thật của các bóng đèn
                        const isThisCabinetOn = cabinetLamps.some(l => l.isOn === true);

                        return (
                            <div key={cabinet.cabinetid} className="text-sm mb-1">
                                <div className={`flex items-center justify-between p-3 rounded cursor-pointer font-bold border-l-4 ${isSelected ? 'bg-green-100 text-green-700 border-green-600' : 'hover:bg-gray-100 border-transparent'}`} onClick={() => handleSelectItem('cabinet', cabinet.cabinetid, cabinet.cabinetid)}>
                                    <span>{isExpanded ? '📂' : '📁'} {cabinet.cabinetname}</span>
                                    <span className={`w-2 h-2 rounded-full ${isThisCabinetOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></span>
                                </div>
                                {isExpanded && (
                                    <div className="ml-6 border-l-2 border-dotted border-gray-300 pl-2 mt-1 space-y-1">
                                        {cabinetLamps.map(l => (
                                            <div key={l.deviceid} onClick={(e) => { e.stopPropagation(); handleSelectItem('lamp', l.deviceid, cabinet.cabinetid); }} className={`flex items-center justify-between p-2 cursor-pointer rounded ${Number(selectedId) === Number(l.deviceid) && selectedType === 'lamp' ? 'bg-green-50 text-green-700 font-bold border-l-4 border-green-500' : 'hover:bg-gray-100'}`}>
                                                <span>💡 {l.devicename}</span>
                                                <span className={`text-xs font-bold ${l.isOn ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {(Number(selectedId) === Number(l.deviceid) && selectedType === 'lamp' && unsavedDim !== null) ? unsavedDim + '%' : (l.isOn ? (l.dimLevel || 100) + '%' : 'TẮT')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="w-3/4 flex flex-col">
                <div className="p-6 border-b bg-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-green-800 uppercase">{selectedType === 'cabinet' ? `Tủ: ${activeCabinet?.cabinetname}` : `Đèn: ${activeLamp?.devicename}`}</h2>
                    <span className={`px-6 py-2 rounded-full text-white font-bold shadow-md ${isCabinetOn ? 'bg-green-600' : 'bg-red-500'}`}>{isCabinetOn ? 'ĐANG HOẠT ĐỘNG' : 'HỆ THỐNG ĐÃ TẮT'}</span>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-white p-5 rounded-lg shadow-sm border mb-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded text-center border"><p className="text-gray-500 text-sm font-bold">Điện áp</p><p className="text-2xl font-bold">{energyData.u}V</p></div>
                            <div className="bg-gray-50 p-4 rounded text-center border"><p className="text-gray-500 text-sm font-bold">Dòng điện</p><p className="text-2xl font-bold text-blue-600">{energyData.i}A</p></div>
                            <div className="bg-gray-50 p-4 rounded text-center border"><p className="text-gray-500 text-sm font-bold">Công suất</p><p className="text-2xl font-bold text-green-600">{energyData.p}W</p></div>
                            <div className="bg-gray-50 p-4 rounded text-center border"><p className="text-gray-500 text-sm font-bold">Điện tiêu thụ</p><p className="text-2xl font-bold text-orange-500">{energyData.wh}Wh</p></div>
                        </div>
                    </div>

                    <div className="h-72 w-full bg-gray-200 rounded-lg shadow-inner mb-6 relative z-0 border border-gray-300 overflow-hidden">
                        <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapUpdater center={mapCenter} />
                            {cabinets.map(c => {
                                const lat = parseCoord(c.latitude); const lng = parseCoord(c.longitude);
                                if (lat !== null && lng !== null) return <Marker key={`cab-${c.cabinetid}`} position={[lat, lng]} icon={cabinetIcon}><Popup>🏢 Tủ: {c.cabinetname}</Popup></Marker>;
                                return null;
                            })}
                            {lamps.map(l => {
                                const lat = parseCoord(l.latitude); const lng = parseCoord(l.longitude);
                                if (lat !== null && lng !== null) return <Marker key={`lamp-${l.deviceid}`} position={[lat, lng]} icon={l.isOn ? lampOnIcon : lampOffIcon}><Popup>💡 Đèn: {l.devicename}<br/>Trạng thái: {l.isOn ? 'Đang Sáng' : 'Tắt'}</Popup></Marker>;
                                return null;
                            })}
                        </MapContainer>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600">
                        {selectedType === 'cabinet' && (
                            <div className="flex items-center justify-between mb-8 p-4 bg-green-50 rounded-lg">
                                <div><h3 className="font-bold text-green-900 text-lg">CÔNG TẮC NGUỒN TỦ</h3><p className="text-green-700 text-sm italic">Gạt để bật/tắt toàn bộ đèn trong tủ ngay lập tức.</p></div>
                                <label className="relative inline-flex items-center cursor-pointer scale-125">
                                    <input type="checkbox" className="sr-only peer" checked={isCabinetOn} onChange={handleToggleCabinet} />
                                    <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        )}

                        <div>
                            <h3 className="font-bold text-gray-700 mb-4 flex justify-between">
                                <span>ĐIỀU CHỈNH ĐỘ SÁNG</span>
                                {!isCabinetOn && <span className="text-orange-500 text-xs italic">! Chế độ chọn trước (Tủ đang tắt)</span>}
                            </h3>
                            <div className="grid grid-cols-11 gap-2 mb-6">
                                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
                                    <button key={v} onClick={() => handleSelectDimming(v)} className={`py-3 border-2 rounded-lg font-bold transition-all ${currentDimLevel === v ? 'bg-green-600 text-white border-green-600 scale-105 shadow-lg' : 'bg-white text-gray-600 hover:border-green-300'}`}>
                                        {v}%
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button 
                                    onClick={handleSaveConfig} 
                                    className={`font-bold px-10 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all ${isCabinetOn ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-100 cursor-not-allowed'}`}
                                >
                                    💾 {selectedType === 'cabinet' ? 'LƯU CẤU HÌNH TỦ' : 'LƯU ĐÈN NÀY'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}