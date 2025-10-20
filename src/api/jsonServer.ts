import axios from 'axios'
import type { SSApplication } from '../models'
import { API_BASE_URL } from './config/configFile';


const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })

export async function createApplication(payload: Partial<SSApplication>) {
  const res = await api.post('/applications', payload)
  return res.data as SSApplication
}

export async function updateApplication(id: number, payload: Partial<SSApplication>) {
  const res = await api.patch(`/applications/${id}`, payload)
  return res.data as SSApplication
}

export async function getApplication(id: number) {
  const res = await api.get(`/applications/${id}`)
  return res.data as SSApplication
}

export async function getApplications() {
  const res = await api.get('/applications');
  return res.data as SSApplication[];
}