import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- API CONFIG ---
const api = axios.create({ baseURL: '' });
const lightingApi = {
    schedule: {
        getAll: async () => (await api.get('/api/schedule/get-all')).data,
        create: async (data) => (await api.post('/api/schedule/create', data)).data,
        update: async (id, data) => (await api.put(`/api/schedule/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/schedule/delete/${id}`)).data,
    },
    cabinet: {
        getAll: async () => (await api.get('/api/cabinet/get-all')).data,
    }
};

const emptyForm = {
    schedulecode: '', schedulename: '', isenabled: true,
    description: '', createdby: 'admin', createdat: '', 
    details: []
};

const timeOptions = (max) => Array.from({ length: max }, (_, i) => i.toString().padStart(2, '0'));

export default function ScenarioManager() {
    const [scenarios, setScenarios] = useState([]);
    const [cabinets, setCabinets] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(emptyForm);
    
    const [timeInput, setTimeInput] = useState({ sH: '00', sM: '00', eH: '00', eM: '00' });
    const [devInput, setDevInput] = useState({ 
        cabinetid: '', cabinetname: '', brightness: 10 
    });

    const fetchData = async () => {
        try {
            const [resScenarios, resCabinets] = await Promise.all([
                lightingApi.schedule.getAll(),
                lightingApi.cabinet.getAll()
            ]);
            if (resScenarios.isSuccess) setScenarios(resScenarios.metadata);
            if (resCabinets.isSuccess) setCabinets(resCabinets.metadata);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        try {
            if (isEditing) await lightingApi.schedule.update(form.scheduleid, form);
            else await lightingApi.schedule.create(form);
            setShowPanel(false);
            fetchData();
        } catch (err) { alert("Lỗi lưu dữ liệu"); }
    };

    const handleDeleteScenario = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa kịch bản này?")) {
            try {
                await lightingApi.schedule.delete(id);
                fetchData();
            } catch (err) { alert("Lỗi khi xóa"); }
        }
    };

    const addDetail = () => {
        if (!devInput.cabinetid) return alert("Chọn tủ");
        const start = `${timeInput.sH}:${timeInput.sM}`;
        const end = `${timeInput.eH}:${timeInput.eM}`;
        setForm({ ...form, details: [...form.details, { ...devInput, starttime: start, endtime: end }] });
    };

    return (
        <div style={{ display: 'flex', padding: '20px', background: '#f8f9fa', minHeight: '100vh', gap: '20px' }}>
            
            {/* DANH SÁCH BÊN TRÁI */}
            <div style={{ flex: showPanel ? '0 0 50%' : '1', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Thiết lập kịch bản</h3>
                    <button onClick={() => { setForm({ ...emptyForm, createdat: new Date().toISOString() }); setIsEditing(false); setShowPanel(true); }} 
                        style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                        + Thêm kịch bản
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                        <tr style={{ background: '#16a34a', color: 'white' }}>
                            <th style={pStyle}>STT</th>
                            <th style={pStyle}>Mã / Tên</th>
                            <th style={pStyle}>Thiết bị</th>
                            <th style={pStyle}>Thời gian</th>
                            <th style={pStyle}>Độ sáng</th>
                            <th style={pStyle}>Trạng thái</th>
                            <th style={pStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map((s, idx) => (
                            <tr key={s.scheduleid} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={pStyle}>{idx + 1}</td>
                                <td style={pStyle}>
                                    <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{s.schedulecode}</div>
                                    <div style={{ color: '#666' }}>{s.schedulename}</div>
                                </td>
                                <td style={pStyle}>{s.details?.map((d, i) => <div key={i}>{d.cabinetname}</div>) || '—'}</td>
                                <td style={pStyle}>{s.details?.map((d, i) => <div key={i}>{d.starttime} - {d.endtime}</div>) || '—'}</td>
                                <td style={pStyle}>{s.details?.map((d, i) => <div key={i}>{d.brightness}%</div>) || '—'}</td>
                                <td style={{ ...pStyle, color: s.isenabled ? '#16a34a' : '#999', fontWeight: 'bold' }}>{s.isenabled ? 'Hoạt động' : 'Tắt'}</td>
                                <td style={pStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button title="Sửa" onClick={() => { setForm(s); setIsEditing(true); setShowPanel(true); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                                        <button title="Xóa" onClick={() => handleDeleteScenario(s.scheduleid)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FORM BÊN PHẢI */}
            {showPanel && (
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 10px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ textAlign: 'center', color: '#16a34a', marginBottom: '20px' }}>{isEditing ? 'Cập nhật kịch bản' : 'Thêm mới kịch bản'}</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '13px' }}><input type="checkbox" checked={form.isenabled} onChange={e => setForm({...form, isenabled: e.target.checked})} /> Hoạt động</label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div><label style={lStyle}>Người tạo</label><input value={form.createdby} onChange={e => setForm({...form, createdby: e.target.value})} style={iStyle} /></div>
                        <div><label style={lStyle}>Ngày tạo</label><input value={form.createdat} onChange={e => setForm({...form, createdat: e.target.value})} style={iStyle} /></div>
                        <div><label style={lStyle}>Mã kịch bản *</label><input value={form.schedulecode} onChange={e => setForm({...form, schedulecode: e.target.value})} style={iStyle} /></div>
                        <div><label style={lStyle}>Tên kịch bản *</label><input value={form.schedulename} onChange={e => setForm({...form, schedulename: e.target.value})} style={iStyle} /></div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={lStyle}>Mô tả</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...iStyle, height: '50px', width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ border: '1px dashed #16a34a', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                            <select 
                                value={devInput.cabinetid} 
                                onChange={e => {
                                    const selected = cabinets.find(c => c.cabinetid === parseInt(e.target.value));
                                    setDevInput({...devInput, cabinetid: e.target.value, cabinetname: selected?.cabinetname || ''});
                                }} 
                                style={{ ...iStyle, width: '110px' }}>
                                <option value="">Chọn tủ</option>
                                {cabinets.map(c => <option key={c.cabinetid} value={c.cabinetid}>{c.cabinetname}</option>)}
                            </select>

                            {/* Sửa logic chọn thời gian để ngắn lại */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <select 
                                    value={timeInput.sH} 
                                    onChange={e => setTimeInput({...timeInput, sH: e.target.value})} 
                                    onFocus={(e) => e.target.size = 5} 
                                    onBlur={(e) => e.target.size = 1}
                                    onChangeCapture={(e) => e.target.size = 1}
                                    style={tStyle}
                                >
                                    {timeOptions(24).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <span>:</span>
                                <select 
                                    value={timeInput.sM} 
                                    onChange={e => setTimeInput({...timeInput, sM: e.target.value})} 
                                    onFocus={(e) => e.target.size = 5} 
                                    onBlur={(e) => e.target.size = 1}
                                    onChangeCapture={(e) => e.target.size = 1}
                                    style={tStyle}
                                >
                                    {timeOptions(60).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <span>-</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <select 
                                    value={timeInput.eH} 
                                    onChange={e => setTimeInput({...timeInput, eH: e.target.value})} 
                                    onFocus={(e) => e.target.size = 5} 
                                    onBlur={(e) => e.target.size = 1}
                                    onChangeCapture={(e) => e.target.size = 1}
                                    style={tStyle}
                                >
                                    {timeOptions(24).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <span>:</span>
                                <select 
                                    value={timeInput.eM} 
                                    onChange={e => setTimeInput({...timeInput, eM: e.target.value})} 
                                    onFocus={(e) => e.target.size = 5} 
                                    onBlur={(e) => e.target.size = 1}
                                    onChangeCapture={(e) => e.target.size = 1}
                                    style={tStyle}
                                >
                                    {timeOptions(60).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <select value={devInput.brightness} onChange={e => setDevInput({...devInput, brightness: e.target.value})} style={{ ...iStyle, width: '70px' }}>
                                {[10,20,30,40,50,60,70,80,90,100].map(v => <option key={v} value={v}>{v}%</option>)}
                            </select>
                            <button onClick={addDetail} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Thêm</button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ background: '#eee' }}>
                                    <th style={pStyle}>STT</th><th style={pStyle}>Thiết bị</th><th style={pStyle}>Từ - Đến</th><th style={pStyle}>Dim</th><th style={pStyle}>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.details.map((d, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={pStyle}>{idx + 1}</td>
                                        <td style={pStyle}>{d.cabinetname}</td>
                                        <td style={pStyle}>{d.starttime} - {d.endtime}</td>
                                        <td style={pStyle}>{d.brightness}%</td>
                                        <td style={pStyle}><button onClick={() => setForm({...form, details: form.details.filter((_, i) => i !== idx)})} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={() => setShowPanel(false)} style={{ padding: '8px 20px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}>Hủy</button>
                        <button onClick={handleSave} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const pStyle = { padding: '8px', textAlign: 'left' };
const lStyle = { display: 'block', marginBottom: '3px', fontSize: '11px', fontWeight: 'bold', color: '#555' };
const iStyle = { padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' };
const tStyle = { 
    padding: '4px', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    fontSize: '12px', 
    width: '45px', 
    position: 'relative',
    zIndex: 10
};