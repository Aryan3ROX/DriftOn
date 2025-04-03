import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    status: false,
    userData: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state,action) => {
            state.status = true,
            state.userData = action.payload

            localStorage.setItem('auth',JSON.stringify({
                status: true,
                userData: action.payload.user,
                token: action.payload.token
            }))
        },
        logout: (state,action) => {
            state.status = false,
            state.userData = null

            localStorage.removeItem('auth')
        }
    }
})

export const {login, logout} = authSlice.actions

export default authSlice.reducer