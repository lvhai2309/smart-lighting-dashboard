import React, { useState } from 'react';

const emptyForm = {
    ma: '', ten: '', lich: 'Luôn luôn', trangThai: false,
    ngayTao: '', ngayCapNhat: '', nguoiTao: '', nguoiCapNhat: '',
    batDau: '', ketThuc: '', thietBi: [],
};

export default function ScenarioManager() {
    const [scenarios, setScenarios] = useState([
  {
    id: 1,
    stt: 1,
    ma: 'KB001',
    ten: 'Kịch bản chiếu sáng ban đêm',
    lich: 'Luôn luôn',
    trangThai: true,
    ngayTao: '04/05/2026 10:00',
    ngayCapNhat: '04/05/2026 10:00',
    nguoiTao: 'admin',
    nguoiCapNhat: 'admin',
    batDau: '',
    ketThuc: '',
    thietBi: [],
  },
]); // data test
    const [selected, setSelected] = useState([]);
    const [perPage, setPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState('thietBi');
    const [panelMode, setPanelMode] = useState(null);
    // Right panel
    const [showPanel, setShowPanel] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const totalPages = Math.max(1, Math.ceil(scenarios.length / perPage));
    const paged = scenarios.slice((page - 1) * perPage, page * perPage);

    // --- Checkbox ---
    const allChecked = paged.length > 0 && paged.every(s => selected.includes(s.id));
    const toggleAll = () => {
        if (allChecked) setSelected(selected.filter(id => !paged.find(s => s.id === id)));
        else setSelected([...new Set([...selected, ...paged.map(s => s.id)])]);
    };
    const toggleOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // --- Bulk toggle ---
    const bulkToggle = (val) => {
        setScenarios(prev => prev.map(s => selected.includes(s.id) ? { ...s, trangThai: val } : s));
    };

    // --- Open add ---
    const handleOpenAdd = () => {
    const now = new Date().toLocaleString('vi-VN');
    setForm({ 
        ...emptyForm, 
        ngayTao: now, 
        ngayCapNhat: now, 
        nguoiTao: 'admin', 
        nguoiCapNhat: 'admin' 
    });
    setIsEditing(false);
    setEditId(null);
    setPanelMode('add');
};

    // --- Open edit ---
const handleOpenEdit = (s) => {
    setForm({ ...s });
    setIsEditing(true);
    setEditId(s.id);
    setPanelMode('edit');
};

    // --- Save ---
    const handleSave = () => {
        if (!form.ma || !form.ten) { alert('Vui lòng điền mã và tên kịch bản!'); return; }
        if (isEditing) {
            setScenarios(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
        } else {
            const newId = Date.now();
            setScenarios(prev => [...prev, { ...form, id: newId, stt: prev.length + 1 }]);
        }
        setShowPanel(false);
    };

    // --- Delete ---
    const handleDelete = (id) => {
        if (window.confirm('Xóa kịch bản này?')) {
            setScenarios(prev => prev.filter(s => s.id !== id));
            if (editId === id) setShowPanel(false);
        }
    };

    // --- Add device ---
    const addDevice = () => {
        setForm(prev => ({
            ...prev,
            thietBi: [...prev.thietBi, { id: Date.now(), loai: 'Đèn', ten: '', thuocDuong: '', trangThai: 'Chờ' }]
        }));
    };
    const removeDevice = (devId) => setForm(prev => ({ ...prev, thietBi: prev.thietBi.filter(d => d.id !== devId) }));

    // --- Format date for display: YYYY-MM-DD -> M/D/YYYY ---
    const formatDateDisplay = (val) => {
        if (!val) return '';
        const [y, m, d] = val.split('-');
        if (!y || !m || !d) return val;
        return `${parseInt(m)}/${parseInt(d)}/${y}`;
    };

    return (
        <div style={{ display: 'flex', gap: 0, minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif', fontSize: 14 }}>

            {/* ===== LEFT: DANH SÁCH ===== */}
            <div style={{ flex: showPanel ? '0 0 660px' : '1', background: 'white', padding: 24, borderTop: '4px solid #16a34a', borderRadius: 8, margin: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>Thiết lập kịch bản</span>
                    <button onClick={handleOpenAdd} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        + Thêm kịch bản
                    </button>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => bulkToggle(true)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 5, fontWeight: 700, cursor: 'pointer' }}>Bật hoạt động</button>
                        <button onClick={() => bulkToggle(false)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 5, fontWeight: 700, cursor: 'pointer' }}>Tắt hoạt động</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280' }}>
                        Hiển thị
                        <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '3px 6px' }}>
                            {[5, 10, 20].map(n => <option key={n}>{n}</option>)}
                        </select>
                        mục trên mỗi trang
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                    <thead>
                        <tr style={{ background: '#16a34a', color: 'white' }}>
                            <th style={thStyle}><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                            <th style={thStyle}>STT</th>
                            <th style={thStyle}>Mã</th>
                            <th style={thStyle}>Tên kịch bản</th>
                            <th style={thStyle}>Lịch</th>
                            <th style={thStyle}>Trạng thái</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Không có dữ liệu kịch bản</td></tr>
                        ) : paged.map((s) => (
                            <tr key={s.id} style={{ background: selected.includes(s.id) ? '#f0fdf4' : 'white', borderBottom: '1px solid #e5e7eb' }}
                                onMouseEnter={e => e.currentTarget.style.background = selected.includes(s.id) ? '#dcfce7' : '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.background = selected.includes(s.id) ? '#f0fdf4' : 'white'}>
                                <td style={tdStyle}><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleOne(s.id)} /></td>
                                <td style={tdStyle}>{s.stt}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: '#1d4ed8' }}>{s.ma}</td>
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{s.ten}</td>
                                <td style={tdStyle}>{s.lich}</td>
                                <td style={tdStyle}>
                                    {s.trangThai
                                        ? <span style={{ color: '#16a34a', fontWeight: 700 }}>Hoạt động</span>
                                        : <span style={{ color: '#6b7280' }}>Không hoạt động</span>}
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <button onClick={() => handleOpenEdit(s)} title="Sửa" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 16, marginRight: 6 }}>✏️</button>
                                    <button onClick={() => handleDelete(s.id)} title="Xóa" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, color: '#6b7280', fontSize: 13 }}>
                    <span>
                        {scenarios.length === 0
                            ? 'Hiển thị 0 kết quả'
                            : `Hiển thị ${Math.min((page - 1) * perPage + 1, scenarios.length)} - ${Math.min(page * perPage, scenarios.length)} trên ${scenarios.length} kết quả`}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['«', '‹', ...Array.from({ length: totalPages }, (_, i) => i + 1), '›', '»'].map((p, i) => {
                            const isNum = typeof p === 'number';
                            const isActive = isNum && p === page;
                            const disabled = (!isNum && (p === '«' || p === '‹') && page === 1) || (!isNum && (p === '›' || p === '»') && page === totalPages);
                            return (
                                <button key={i} disabled={disabled} onClick={() => {
                                    if (!isNum) {
                                        if (p === '«') setPage(1);
                                        else if (p === '‹') setPage(Math.max(1, page - 1));
                                        else if (p === '›') setPage(Math.min(totalPages, page + 1));
                                        else if (p === '»') setPage(totalPages);
                                    } else setPage(p);
                                }} style={{ minWidth: 32, height: 32, border: '1px solid #d1d5db', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', background: isActive ? '#16a34a' : 'white', color: isActive ? 'white' : '#374151', fontWeight: isActive ? 700 : 400, opacity: disabled ? 0.4 : 1 }}>
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
                        {/* ===== RIGHT: FORM CHI TIẾT ===== */}
            {panelMode === 'edit' && (
                <div style={{ flex: 1, background: 'white', padding: 24, margin: 16, marginLeft: 0, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowY: 'auto' }}>

                    {/* Title */}
                    <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937' }}>
                        {isEditing ? form.ten : 'Kịch bản'}
                    </h3>

                    {/* Toggle trạng thái */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Trạng thái:</span>
                        <div onClick={() => setForm(f => ({ ...f, trangThai: !f.trangThai }))}
                            style={{ width: 44, height: 24, borderRadius: 12, background: form.trangThai ? '#16a34a' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ position: 'absolute', top: 3, left: form.trangThai ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </div>
                        <span style={{ color: form.trangThai ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
                            {form.trangThai ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </div>

                    {/* Ngày tạo / Ngày cập nhật */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Ngày tạo</label>
                            <input value={form.ngayTao} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Ngày cập nhật</label>
                            <input value={form.ngayCapNhat} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
                        </div>
                    </div>

                    {/* Người tạo / Người cập nhật */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Người tạo</label>
                            <input value={form.nguoiTao} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Người cập nhật</label>
                            <input value={form.nguoiCapNhat} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
                        </div>
                    </div>

                    {/* Mã + Tên */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Mã kịch bản <span style={{ color: 'red' }}>*</span></label>
                            <input value={form.ma} onChange={e => setForm(f => ({ ...f, ma: e.target.value }))} placeholder="VD: KB001" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tên kịch bản <span style={{ color: 'red' }}>*</span></label>
                            <input value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))} placeholder="VD: Sáng ban đêm" style={inputStyle} />
                        </div>
                    </div>

                    {/* Thời gian chiếu sáng */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                            Thời gian chiếu sáng 📅
                        </label>
                        <div style={{ display: 'flex', gap: 24, margin: '10px 0' }}>
                            {['Luôn luôn', 'Lịch một lần', 'Lịch lặp lại'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: form.lich === opt ? 700 : 400 }}>
                                    <input type="radio" name="lich" value={opt} checked={form.lich === opt}
                                        onChange={() => setForm(f => ({ ...f, lich: opt }))} />
                                    {opt}
                                </label>
                            ))}
                        </div>

                        {form.lich !== 'Luôn luôn' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
                                {/* Bắt đầu */}
                                <div>
                                    <label style={labelStyle}>Bắt đầu</label>
                                    <div style={{ position: 'relative' }}>
                                        {/* Hiển thị ngày định dạng M/D/YYYY đè lên input */}
                                        {form.batDau && (
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                display: 'flex', alignItems: 'center',
                                                paddingLeft: 10, paddingRight: 36,
                                                fontWeight: 700, fontSize: 14,
                                                color: '#dc2626',
                                                pointerEvents: 'none',
                                                zIndex: 1,
                                                background: '#fef2f2',
                                                borderRadius: 6,
                                            }}>
                                                {formatDateDisplay(form.batDau)}
                                            </div>
                                        )}
                                        <input
                                            type="date"
                                            value={form.batDau}
                                            onChange={e => setForm(f => ({ ...f, batDau: e.target.value }))}
                                            style={{
                                                ...inputStyle,
                                                background: '#fef2f2',
                                                borderColor: '#fca5a5',
                                                color: form.batDau ? 'transparent' : '#9ca3af',
                                                fontWeight: 700,
                                                colorScheme: 'light',
                                                position: 'relative',
                                                zIndex: 2,
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Kết thúc */}
                                <div>
                                    <label style={labelStyle}>Kết thúc</label>
                                    <div style={{ position: 'relative' }}>
                                        {form.ketThuc && (
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                display: 'flex', alignItems: 'center',
                                                paddingLeft: 10, paddingRight: 36,
                                                fontWeight: 700, fontSize: 14,
                                                color: '#1f2937',
                                                pointerEvents: 'none',
                                                zIndex: 1,
                                                background: 'white',
                                                borderRadius: 6,
                                            }}>
                                                {formatDateDisplay(form.ketThuc)}
                                            </div>
                                        )}
                                        <input
                                            type="date"
                                            value={form.ketThuc}
                                            onChange={e => setForm(f => ({ ...f, ketThuc: e.target.value }))}
                                            style={{
                                                ...inputStyle,
                                                color: form.ketThuc ? 'transparent' : '#9ca3af',
                                                fontWeight: 700,
                                                colorScheme: 'light',
                                                position: 'relative',
                                                zIndex: 2,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cài đặt kịch bản - tabs */}
                    <div style={{ marginTop: 20 }}>
                        <label style={labelStyle}>Cài đặt kịch bản</label>
                        <div style={{ display: 'flex', gap: 0, marginBottom: 12, marginTop: 6 }}>
                            {['thietBi', 'thamSoDim'].map((tab, i) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    padding: '7px 18px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 700,
                                    background: activeTab === tab ? '#16a34a' : 'white',
                                    color: activeTab === tab ? 'white' : '#374151',
                                    borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                                    borderRight: i === 0 ? 'none' : '1px solid #d1d5db'
                                }}>
                                    {tab === 'thietBi' ? 'Thiết bị' : 'Tham số dim'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'thietBi' && (
                            <>
                                <button onClick={addDevice} style={{ background: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, marginBottom: 10, fontSize: 16 }}>+</button>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#16a34a', color: 'white' }}>
                                            {['STT', 'Loại', 'Tên', 'Thuộc đường', 'Trạng thái', 'Hành động'].map(h => (
                                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', border: '1px solid #15803d' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.thietBi.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Chưa có thiết bị</td></tr>
                                        ) : form.thietBi.map((d, idx) => (
                                            <tr key={d.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={tdStyle}>{idx + 1}</td>
                                                <td style={tdStyle}>{d.loai}</td>
                                                <td style={tdStyle}>{d.ten}</td>
                                                <td style={tdStyle}>{d.thuocDuong}</td>
                                                <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 700 }}>{d.trangThai}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <button onClick={() => removeDevice(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {activeTab === 'thamSoDim' && (
                            <div style={{ padding: 20, color: '#9ca3af', textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: 6 }}>
                                Chưa có tham số dim
                            </div>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                        <button onClick={() => {
    setPanelMode(null);
    setShowPanel(false);
}} style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
                        <button onClick={handleSave} style={{ padding: '8px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                    </div>
                </div>
            )}

            {/* ===== Thêm kịch bản ===== */}
{panelMode === 'add' && (
    <div style={{
        flex: 1,
        background: 'white',
        padding: 24,
        margin: 16,
        marginLeft: 0,
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        overflowY: 'auto'
    }}>

        {/* Title */}
        <h3 style={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: 24
        }}>
            {isEditing ? form.ten : 'Thêm kịch bản'}
        </h3>

        {/* Trạng thái */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 140, fontWeight: 600 }}>Trạng thái:</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                    onClick={() => setForm(f => ({ ...f, trangThai: !f.trangThai }))}
                    style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: form.trangThai ? '#16a34a' : '#d1d5db',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 3,
                        left: form.trangThai ? 22 : 3,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'white'
                    }} />
                </div>

                <span style={{ color: '#6b7280' }}>
                    {form.trangThai ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </div>
        </div>

        {/* Tên kịch bản */}
        <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
                Tên kịch bản <span style={{ color: 'red' }}>*</span>
            </label>
            <input
                value={form.ten}
                onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
                placeholder="Nhập tên kịch bản (chỉ ký tự tiếng Anh và số)"
                style={inputStyle}
            />
        </div>

        {/* Mã kịch bản */}
        <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
                Mã kịch bản <span style={{ color: 'red' }}>*</span>
            </label>
            <input
                value={form.ma}
                onChange={e => setForm(f => ({ ...f, ma: e.target.value }))}
                placeholder="Nhập mã kịch bản"
                style={inputStyle}
            />
        </div>

        {/* Người tạo */}
        <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Người tạo</label>
            <input
                value={form.nguoiTao}
                readOnly
                style={{ ...inputStyle, background: '#f3f4f6' }}
            />
        </div>

        {/* Ngày tạo */}
        <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Ngày tạo</label>
            <input
                value={form.ngayTao}
                readOnly
                style={{ ...inputStyle, background: '#f3f4f6' }}
            />
        </div>

        {/* Mô tả */}
        <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Mô tả</label>
            <textarea
                placeholder="Mô tả kịch bản"
                style={{
                    ...inputStyle,
                    height: 80,
                    resize: 'none'
                }}
            />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
                onClick={() => {
    setPanelMode(null);
    setShowPanel(false);
}}
                style={{
                    padding: '8px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    background: 'white',
                    cursor: 'pointer'
                }}
            >
                Hủy
            </button>

            <button
                onClick={handleSave}
                style={{
                    padding: '8px 24px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Lưu
            </button>
        </div>
    </div>
)}
        </div>
    );
}

// Shared styles
const thStyle = { padding: '10px 12px', textAlign: 'left', border: '1px solid #15803d', fontWeight: 600 };
const tdStyle = { padding: '10px 12px', border: '1px solid #e5e7eb' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 };
const inputStyle = { width: '100%', border: '1.5px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 14, boxSizing: 'border-box' };