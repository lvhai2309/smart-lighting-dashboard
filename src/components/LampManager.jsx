import React, { useState } from 'react';
import { lightingApi } from '../api/lightingApi';

export default function LampManager({ cabinets, lamps, reloadData }) {
    const [selectedCabinetFilter, setSelectedCabinetFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ cabinetid: '', devicecode: '', devicename: '', devicetype: '', capacity: '', latitude: '', longitude: '' });

    const handleOpenAdd = () => {
        if (cabinets.length === 0) { alert('Cần tạo Tủ trước!'); return; }
        setFormData({ cabinetid: cabinets[0].cabinetid, devicecode: '', devicename: '', devicetype: '', capacity: '', latitude: '', longitude: '' });
        setIsEditing(false); setShowModal(true);
    };

    const handleOpenEdit = (lamp) => {
        setFormData({ cabinetid: lamp.cabinetid, devicecode: lamp.devicecode || '', devicename: lamp.devicename || '', devicetype: lamp.devicetype || '', capacity: lamp.capacity || '', latitude: lamp.latitude || '', longitude: lamp.longitude || '' });
        setEditId(lamp.deviceid); setIsEditing(true); setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.devicecode || !formData.devicename) { alert("Vui lòng điền mã và tên đèn!"); return; }
        try {
            const payload = { ...formData, cabinetid: parseInt(formData.cabinetid) };
            if (isEditing) await lightingApi.device.update(editId, payload);
            else await lightingApi.device.create(payload);
            setShowModal(false); reloadData(); 
        } catch (e) { alert("Lỗi khi lưu đèn."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa đèn này?')) { await lightingApi.device.delete(id); reloadData(); }
    };

    const filteredLamps = selectedCabinetFilter === 'all' ? lamps : lamps.filter(lamp => Number(lamp.cabinetid) === Number(selectedCabinetFilter));

    return (
        <div className="p-6 bg-white min-h-screen shadow-sm mt-4 border-t-4 border-green-600 rounded">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-700">Quản lý đèn</h2>
                <button onClick={handleOpenAdd} className="bg-green-600 text-white px-5 py-2 rounded font-bold">+ Tạo mới đèn</button>
            </div>
            <div className="flex gap-4 mb-4 bg-gray-50 p-4 rounded border items-center">
                <label className="text-sm font-bold text-gray-600">Lọc theo Tủ:</label>
                <select className="w-1/3 border-2 border-blue-400 p-2 rounded text-blue-800 font-bold" value={selectedCabinetFilter} onChange={(e) => setSelectedCabinetFilter(e.target.value)}>
                    <option value="all">-- TẤT CẢ ĐÈN TRONG HỆ THỐNG --</option>
                    {cabinets.map(cab => <option key={cab.cabinetid} value={cab.cabinetid}>{cab.cabinetname}</option>)}
                </select>
            </div>
            <table className="w-full text-left border-collapse border">
                <thead className="bg-green-600 text-white">
                    <tr><th className="p-3 border">Mã đèn</th><th className="p-3 border">Tên đèn</th><th className="p-3 border">Tủ điện</th><th className="p-3 border">Trạng thái (Thực)</th><th className="p-3 border">Tọa độ</th><th className="p-3 border text-center">Hành động</th></tr>
                </thead>
                <tbody>
                    {filteredLamps.map((lamp) => (
                        <tr key={lamp.deviceid} className="hover:bg-gray-50 border-b">
                            <td className="p-3 border font-bold text-blue-700">{lamp.devicecode}</td>
                            <td className="p-3 border font-semibold">{lamp.devicename}</td>
                            <td className="p-3 border">{cabinets.find(c => Number(c.cabinetid) === Number(lamp.cabinetid))?.cabinetname || 'Chưa gán'}</td>
                            
                            {/* ĐÃ SỬA: Thay dimLevel bằng brightness để hiển thị đúng con số % */}
                            <td className="p-3 border font-bold">
                                {lamp.isOn ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        🟢 Đang Sáng ({(lamp.brightness ?? 100)}%)
                                    </span>
                                ) : (
                                    <span className="text-gray-400 flex items-center gap-1">
                                        ⚪ Đã Tắt
                                    </span>
                                )}
                            </td>
                            
                            <td className="p-3 border text-sm text-gray-500">{lamp.latitude && lamp.longitude ? `${lamp.latitude}, ${lamp.longitude}` : 'Chưa có'}</td>
                            <td className="p-3 border text-center text-blue-600 font-bold">
                                <button onClick={() => handleOpenEdit(lamp)} className="mr-2">Sửa</button> | <button onClick={() => handleDelete(lamp.deviceid)} className="text-red-500 ml-2">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal giữ nguyên */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-1/3 shadow-2xl border-t-8 border-green-600">
                        <h3 className="text-2xl font-bold mb-4">{isEditing ? 'Sửa Đèn' : 'Thêm Đèn'}</h3>
                        <div className="space-y-3">
                            <select value={formData.cabinetid} className="w-full border-2 border-green-100 p-2 rounded bg-green-50 font-bold text-green-800" onChange={e => setFormData({...formData, cabinetid: e.target.value})}>
                                {cabinets.map(cab => <option key={cab.cabinetid} value={cab.cabinetid}>{cab.cabinetname}</option>)}
                            </select>
                            <input value={formData.devicecode} className="w-full border p-2 rounded" placeholder="Mã đèn..." onChange={e => setFormData({...formData, devicecode: e.target.value})} />
                            <input value={formData.devicename} className="w-full border p-2 rounded" placeholder="Tên đèn..." onChange={e => setFormData({...formData, devicename: e.target.value})} />
                            <div className="flex gap-2 bg-gray-50 p-2 rounded border">
                                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Vĩ độ (Lat)</label><input value={formData.latitude} className="w-full border p-2 rounded text-sm" placeholder="VD: 21.0285" onChange={e => setFormData({...formData, latitude: e.target.value})} /></div>
                                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Kinh độ (Lng)</label><input value={formData.longitude} className="w-full border p-2 rounded text-sm" placeholder="VD: 105.8542" onChange={e => setFormData({...formData, longitude: e.target.value})} /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded font-bold">Hủy</button><button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded font-bold">Lưu Đèn</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}