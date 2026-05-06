import axios from 'axios';

const BASE_URL = ''; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
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
        delete: async (id) => (await api.delete(`/api/cabinet/delete/${id}`)).data,
        power: async (id, data) => (await api.post(`/api/cabinet/power/${id}`, data)).data
    },
    device: {
        getAll: async () => (await api.get('/api/device/get-all')).data,
        create: async (data) => (await api.post('/api/device/create', data)).data,
        update: async (id, data) => (await api.put(`/api/device/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/device/delete/${id}`)).data
    },
    mqtt: {
        control: async (data) => (await api.post('/api/mqtt/control', data)).data,
        controlBatch: async (data) => (await api.post('/api/mqtt/control-batch', data)).data
    },
    // Thêm phần schedule theo Swagger image_91b2f9.jpg
    schedule: {
        getAll: async () => (await api.get('/api/schedule/get-all')).data,
        create: async (data) => (await api.post('/api/schedule/create', data)).data,
        update: async (id, data) => (await api.put(`/api/schedule/update/${id}`, data)).data,
        delete: async (id) => (await api.delete(`/api/schedule/delete/${id}`)).data,
        toggle: async (id) => (await api.put(`/api/schedule/toggle/${id}`)).data
    }
};