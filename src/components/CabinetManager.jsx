import React, { useState } from 'react';
import { lightingApi } from '../api/lightingApi';

export default function CabinetManager({ cabinets, lamps, reloadData }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ cabinetcode: '', cabinetname: '', description: '', latitude: '', longitude: '' });

    const handleOpenAdd = () => {
        setFormData({ cabinetcode: '', cabinetname: '', description: '', latitude: '', longitude: '' });
        setIsEditing(false); setShowModal(true);
    };

    const handleOpenEdit = (cab) => {
        setFormData({ cabinetcode: cab.cabinetcode || '', cabinetname: cab.cabinetname || '', description: cab.description || '', latitude: cab.latitude || '', longitude: cab.longitude || '' });
        setEditId(cab.cabinetid); setIsEditing(true); setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (isEditing) await lightingApi.cabinet.update(editId, formData);
            else await lightingApi.cabinet.create(formData);
            setShowModal(false); reloadData();
        } catch (error) { alert("Lỗi khi lưu tủ!"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa tủ điện này?')) { await lightingApi.cabinet.delete(id); reloadData(); }
    };

    // Hàm tính toán trạng thái tủ: Tủ được coi là Bật nếu có ít nhất 1 đèn đang sáng
    const isCabinetActive = (cabinetId) => {
        const cabinetLamps = lamps.filter(l => Number(l.cabinetid) === Number(cabinetId));
        return cabinetLamps.some(l => l.isOn === true);
    };

    return (
        <div className="p-6 bg-white min-h-screen shadow-sm mt-4 border-t-4 border-green-600 rounded">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-700">Quản lý tủ điện</h2>
                <button onClick={handleOpenAdd} className="bg-green-600 text-white px-4 py-2 rounded font-bold">+ Tạo mới tủ</button>
            </div>
            <table className="w-full text-left border-collapse border">
                <thead className="bg-green-600 text-white">
                    <tr><th className="p-3 border">Mã tủ</th><th className="p-3 border">Tên tủ</th><th className="p-3 border">Tọa độ</th><th className="p-3 border">Trạng thái (Thực)</th><th className="p-3 border text-center">Hành động</th></tr>
                </thead>
                <tbody>
                    {cabinets.map((cab) => (
                        <tr key={cab.cabinetid} className="hover:bg-gray-50 border-b">
                            <td className="p-3 border font-bold text-blue-600">{cab.cabinetcode}</td>
                            <td className="p-3 border font-semibold">{cab.cabinetname}</td>
                            <td className="p-3 border text-sm text-gray-500">{cab.latitude && cab.longitude ? `${cab.latitude}, ${cab.longitude}` : 'Chưa có'}</td>
                            
                            {/* CỘT TRẠNG THÁI HIỆN TẠI */}
                            <td className="p-3 border font-bold">
                                {isCabinetActive(cab.cabinetid) ? <span className="text-green-600">⚡ Đang Hoạt Động</span> : <span className="text-red-500">🔌 Đã Ngắt</span>}
                            </td>
                            
                            <td className="p-3 border text-center text-blue-600 font-bold"><button onClick={() => handleOpenEdit(cab)} className="mr-2">Sửa</button> | <button onClick={() => handleDelete(cab.cabinetid)} className="ml-2 text-red-500">Xóa</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal giữ nguyên */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-1/3 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">{isEditing ? 'Sửa' : 'Thêm'} Tủ Điện</h3>
                        <div className="space-y-3">
                            <input value={formData.cabinetcode} className="w-full border p-2 rounded" placeholder="Mã tủ" onChange={e => setFormData({...formData, cabinetcode: e.target.value})} />
                            <input value={formData.cabinetname} className="w-full border p-2 rounded" placeholder="Tên tủ" onChange={e => setFormData({...formData, cabinetname: e.target.value})} />
                            <div className="flex gap-2 bg-gray-50 p-2 rounded border">
                                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Vĩ độ (Lat)</label><input value={formData.latitude} className="w-full border p-2 rounded" placeholder="VD: 21.0285" onChange={e => setFormData({...formData, latitude: e.target.value})} /></div>
                                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Kinh độ (Lng)</label><input value={formData.longitude} className="w-full border p-2 rounded" placeholder="VD: 105.8542" onChange={e => setFormData({...formData, longitude: e.target.value})} /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded font-bold">Hủy</button><button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded font-bold">Lưu Tủ</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}