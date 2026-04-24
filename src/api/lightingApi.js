import axios from 'axios';

// Dùng chuỗi rỗng để đi qua Proxy của Vite (tránh lỗi CORS)
const BASE_URL = ''; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // THAY MÃ TOKEN CỦA BẠN VÀO ĐÂY ĐỂ MỞ KHÓA API
        'Authorization': 'Bearer YOUR_TOKEN_HERE' 
    }
});

export const lightingApi = {
    area: {
        getAll: async () => (await api.get('/api/Area/get-all')).data,
        create: async (data) => (await api.post('/api/Area/create', data)).data,
        update: async (id, data) => (await api.put(`/api/Area/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/Area/delete/${id}`)).data
    },
    cabinet: {
        getAll: async () => (await api.get('/api/cabinet/get-all')).data,
        create: async (data) => (await api.post('/api/cabinet/create', data)).data,
        update: async (id, data) => (await api.put(`/api/cabinet/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/cabinet/delete/${id}`)).data
    },
    device: {
        getAll: async () => (await api.get('/api/device/get-all')).data,
        create: async (data) => (await api.post('/api/device/create', data)).data,
        update: async (id, data) => (await api.put(`/api/device/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/device/delete/${id}`)).data
    },
    mqtt: {
        // Điều khiển 1 đèn lẻ
        control: async (data) => {
            const res = await api.post('/api/mqtt/control', data);
            return res.data;
        },
        // Điều khiển nguyên tủ (nhiều đèn cùng lúc)
        controlBatch: async (data) => {
            const res = await api.post('/api/mqtt/control-batch', data);
            return res.data;
        }
    }
};