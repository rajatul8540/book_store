import api from './api'

export const loginUser = async (data) => {
    const payload = {
        email: data.email,
        password: data.password,
    }

    const response = await api.post('/auth/login', payload)

    return response.data
}

export const registerUser = async (data) => {
    const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
    }

    const response = await api.post('/auth/register', payload)

    return response.data
}

export const logoutUser = async () => {
    const response = await api.post('/logout')

    return response.data
}
