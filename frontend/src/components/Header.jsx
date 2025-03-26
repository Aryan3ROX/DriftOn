import {react} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

function Header() {
    const nav = useNavigate()
    const authStatus = useSelector((state) => state.auth.status)
    const navItems = [
        {
            name: 'Home',
            path: '/',
            active: true
        },
        
    ]
}