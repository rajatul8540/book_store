import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function NotFound() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const homePath = isAuthenticated ? '/dashboard' : '/'

    return (
        <div className="auth-container">
            <div className="not-found-box">
                <h1>404</h1>
                <h2>Page not found</h2>
                <p>The page you are looking for does not exist.</p>
                <Link to={homePath}>Go back</Link>
            </div>
        </div>
    )
}
