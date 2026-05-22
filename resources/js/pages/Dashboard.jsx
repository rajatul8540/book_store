import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { logoutUser } from '../services/authService'

export default function Dashboard() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)

    const handleLogout = async () => {
        try {
            await logoutUser()
        } finally {
            dispatch(logout())
            navigate('/')
        }
    }

    return (
        <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Dashboard</h1>
            <p>Welcome{user?.name ? `, ${user.name}` : ''}.</p>

            <p>
                <Link to="/books">Manage Books</Link>
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </main>
    )
}
