import { createSlice } from '@reduxjs/toolkit'

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const initialState = {
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: Boolean(storedToken),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
            state.isAuthenticated = true

            localStorage.setItem('token', action.payload.token)
            localStorage.setItem('user', JSON.stringify(action.payload.user))
        },
        logout: (state) => {
            state.token = null
            state.user = null
            state.isAuthenticated = false

            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
    },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
