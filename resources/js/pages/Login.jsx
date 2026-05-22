import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { loginUser, registerUser } from '../services/authService'
import { loginSuccess } from '../store/authSlice'
import * as yup from 'yup'
import "../../css/Login.css"

const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .required('Email is required')
        .email('Enter a valid email address'),
    password: yup
        .string()
        .required('Password is required'),
})

const registerSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must not be greater than 50 characters'),
    email: yup
        .string()
        .trim()
        .required('Email is required')
        .email('Enter a valid email address'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain uppercase, lowercase, and number')
        .matches(/[a-z]/, 'Password must contain uppercase, lowercase, and number')
        .matches(/[0-9]/, 'Password must contain uppercase, lowercase, and number'),
})

const getValidationErrors = async (schema, data) => {
    try {
        await schema.validate(data, { abortEarly: false })
        return {}
    } catch (err) {
        return (err.inner || []).reduce((errors, currentError) => {
            if (currentError.path && !errors[currentError.path]) {
                errors[currentError.path] = currentError.message
            }

            return errors
        }, {})
    }
}

export default function Auth() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [isLogin, setIsLogin] = useState(true)

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    })

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [loginErrors, setLoginErrors] = useState({})
    const [registerErrors, setRegisterErrors] = useState({})

    const getApiErrorMessage = (err, fallbackMessage) => {
        const data = err.response?.data

        if (data?.value) {
            return data.value
        }

        return data?.message || fallbackMessage
    }

    // ---------------- LOGIN ----------------
    const handleLoginChange = (e) => {
        setError('')
        setLoginErrors({
            ...loginErrors,
            [e.target.name]: '',
        })
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        })
    }

    const showRegisterForm = () => {
        setError('')
        setLoginErrors({})
        setLoginData({
            email: '',
            password: '',
        })
        setIsLogin(false)
    }

    const showLoginForm = () => {
        setError('')
        setRegisterErrors({})
        setRegisterData({
            name: '',
            email: '',
            password: '',
        })
        setIsLogin(true)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoginErrors({})

        const validationErrors = await getValidationErrors(loginSchema, loginData)
        if (Object.keys(validationErrors).length) {
            setLoginErrors(validationErrors)
            return
        }

        setLoading(true)

        try {
            const response = await loginUser({
                email: loginData.email.trim(),
                password: loginData.password,
            })
            console.log("response", response);

            if (response?.status == "TRUE") {
            dispatch(loginSuccess({
                token: response.value.token,
                user: response.value.user,
            }))

                navigate('/dashboard')

            }
            alert(response.message)



        } catch (err) {
            const apiError = getApiErrorMessage(err, 'Login failed')

            if (apiError && typeof apiError === 'object') {
                setLoginErrors(Object.fromEntries(
                    Object.entries(apiError).map(([field, messages]) => [field, messages[0]])
                ))
            } else {
                setError(apiError)
            }
        } finally {
            setLoading(false)
        }
    }

    // ---------------- REGISTER ----------------
    const handleRegisterChange = (e) => {
        setError('')
        setRegisterErrors({
            ...registerErrors,
            [e.target.name]: '',
        })
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value,
        })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setRegisterErrors({})

        const validationErrors = await getValidationErrors(registerSchema, registerData)
        if (Object.keys(validationErrors).length) {
            setRegisterErrors(validationErrors)
            return
        }

        setLoading(true)

        try {
            const response = await registerUser({
                name: registerData.name.trim(),
                email: registerData.email.trim(),
                password: registerData.password,
            })


            alert(response.message)


            setRegisterData({
                name: '',
                email: '',
                password: '',
            })
            setIsLogin(true)

        } catch (err) {
            const apiError = getApiErrorMessage(err, 'Register failed')

            if (apiError && typeof apiError === 'object') {
                setRegisterErrors(Object.fromEntries(
                    Object.entries(apiError).map(([field, messages]) => [field, messages[0]])
                ))
            } else {
                setError(apiError)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">

            <div className={`auth-box ${isLogin ? "login-mode" : "register-mode"}`}>

                {/* LEFT SIDE */}
                <div className="auth-left">
                    <h2>{isLogin ? "Login" : "Register"}</h2>

                    {error && <p className="error">{error}</p>}

                    {/* LOGIN FORM */}
                    {isLogin ? (
                        <form onSubmit={handleLogin}>

                            <input
                                type="text"
                                name="email"
                                placeholder="Enter Email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                aria-invalid={Boolean(loginErrors.email)}
                            />
                            {loginErrors.email && <p className="field-error">{loginErrors.email}</p>}

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter Password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                aria-invalid={Boolean(loginErrors.password)}
                            />
                            {loginErrors.password && <p className="field-error">{loginErrors.password}</p>}

                            <button disabled={loading}>
                                {loading ? "Loading..." : "Login"}
                            </button>

                        </form>
                    ) : (
                        /* REGISTER FORM */
                        <form onSubmit={handleRegister}>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter Name"
                                value={registerData.name}
                                onChange={handleRegisterChange}
                                aria-invalid={Boolean(registerErrors.name)}
                            />
                            {registerErrors.name && <p className="field-error">{registerErrors.name}</p>}

                            <input
                                type="text"
                                name="email"
                                placeholder="Enter Email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                aria-invalid={Boolean(registerErrors.email)}
                            />
                            {registerErrors.email && <p className="field-error">{registerErrors.email}</p>}

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter Password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                aria-invalid={Boolean(registerErrors.password)}
                            />
                            {registerErrors.password && <p className="field-error">{registerErrors.password}</p>}

                            <button disabled={loading}>
                                {loading ? "Loading..." : "Register"}
                            </button>

                        </form>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <div className="auth-right">

                    {isLogin ? (
                        <>
                            <h3>New here?</h3>
                            <p>Register and join us</p>
                            <button onClick={showRegisterForm}>
                                Register Me
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>Already have account?</h3>
                            <p>Login to continue</p>
                            <button onClick={showLoginForm}>
                                Login
                            </button>
                        </>
                    )}

                </div>

            </div>

        </div>
    )
}
