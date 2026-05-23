import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as yup from 'yup'

import { addBook, deleteBook, getBooks, updateBook } from '../services/bookService'
import '../../css/Books.css'

const bookSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required('Title is required')
        .max(255, 'Title must not be greater than 255 characters'),
    author: yup
        .string()
        .trim()
        .required('Author is required')
        .max(255, 'Author must not be greater than 255 characters'),
    price: yup
        .number()
        .typeError('Price must be a number')
        .required('Price is required')
        .min(0, 'Price must be 0 or greater'),
    published_date: yup
        .string()
        .nullable(),
    cover_image: yup
        .mixed()
        .nullable()
        .test('fileType', 'Cover image must be jpg, jpeg, png, or webp', (file) => {
            if (!file) {
                return true
            }

            return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
        })
        .test('fileSize', 'Cover image must be 2MB or smaller', (file) => {
            if (!file) {
                return true
            }

            return file.size <= 2 * 1024 * 1024
        }),
})

const initialFormData = {
    title: '',
    author: '',
    cover_image: null,
    price: '',
    published_date: '',
}

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

export default function Books() {
    const [formData, setFormData] = useState(initialFormData)
    const [formErrors, setFormErrors] = useState({})
    const [books, setBooks] = useState([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    })
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [editingBook, setEditingBook] = useState(null)
    const [coverPreview, setCoverPreview] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchBooks = async (nextPage = page, nextSearch = search) => {
        setLoading(true)
        setError('')

        try {
            const response = await getBooks({
                search: nextSearch.trim(),
                page: nextPage,
                perPage: 10,
            })

            const paginator = response.value

            setBooks(paginator.data || [])
            setMeta({
                current_page: paginator.current_page || 1,
                last_page: paginator.last_page || 1,
                total: paginator.total || 0,
            })
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to fetch books')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBooks(1, '')
    }, [])

    const handleChange = (e) => {
        const { name, value, files } = e.target

        setSuccess('')
        setError('')
        setFormErrors({
            ...formErrors,
            [name]: '',
        })
        setFormData({
            ...formData,
            [name]: files ? files[0] || null : value,
        })

        if (name === 'cover_image') {
            setCoverPreview(files?.[0] ? URL.createObjectURL(files[0]) : '')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setFormErrors({})

        const validationErrors = await getValidationErrors(bookSchema, formData)

        if (Object.keys(validationErrors).length) {
            setFormErrors(validationErrors)
            return
        }

        setSaving(true)

        try {
            const payload = {
                ...formData,
                title: formData.title.trim(),
                author: formData.author.trim(),
            }
            const response = editingBook
                ? await updateBook(editingBook.id, payload)
                : await addBook(payload)

            setSuccess(response.message || (editingBook ? 'Book updated successfully' : 'Book added successfully'))
            setFormData(initialFormData)
            setEditingBook(null)
            setCoverPreview('')
            e.target.reset()
            fetchBooks(editingBook ? page : 1, search)

            if (!editingBook) {
                setPage(1)
            }
        } catch (err) {
            const errors = err.response?.data?.value

            if (errors) {
                setFormErrors(Object.fromEntries(
                    Object.entries(errors).map(([field, messages]) => [field, messages[0]])
                ))
            } else {
                setError(err.response?.data?.message || (editingBook ? 'Unable to update book' : 'Unable to add book'))
            }
        } finally {
            setSaving(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchBooks(1, search)
    }

    const handlePageChange = (nextPage) => {
        setPage(nextPage)
        fetchBooks(nextPage, search)
    }

    const handleEdit = (book) => {
        setError('')
        setSuccess('')
        setFormErrors({})
        setEditingBook(book)
        setFormData({
            title: book.title || '',
            author: book.author || '',
            cover_image: null,
            price: book.price || '',
            published_date: book.published_date || '',
        })
        setCoverPreview(book.cover_image_url || '')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingBook(null)
        setFormData(initialFormData)
        setCoverPreview('')
        setFormErrors({})
        setError('')
        setSuccess('')
    }

    const handleDelete = async (book) => {
        if (!confirm(`Delete "${book.title}"?`)) {
            return
        }

        setDeletingId(book.id)
        setError('')
        setSuccess('')

        try {
            const response = await deleteBook(book.id)
            const nextPage = books.length === 1 && page > 1 ? page - 1 : page

            setSuccess(response.message || 'Book deleted successfully')
            setPage(nextPage)
            fetchBooks(nextPage, search)

            if (editingBook?.id === book.id) {
                handleCancelEdit()
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete book')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <main className="books-page">
            <header className="books-header">
                <div>
                    <h1>Books</h1>
                    <p>Add books and view the saved list.</p>
                </div>
                <Link to="/dashboard">Dashboard</Link>
            </header>

            <section className="books-layout">
                <form className="book-form" onSubmit={handleSubmit}>
                    <div className="book-form-title">
                        <h2>{editingBook ? 'Edit Book' : 'Add Book'}</h2>
                        {editingBook && (
                            <button type="button" className="book-text-button" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>

                    {success && <p className="book-success">{success}</p>}
                    {error && <p className="book-error">{error}</p>}

                    <label>
                        Title
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            aria-invalid={Boolean(formErrors.title)}
                        />
                    </label>
                    {formErrors.title && <p className="book-field-error">{formErrors.title}</p>}

                    <label>
                        Author
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            aria-invalid={Boolean(formErrors.author)}
                        />
                    </label>
                    {formErrors.author && <p className="book-field-error">{formErrors.author}</p>}

                    <label>
                        Cover Image
                        <input
                            type="file"
                            name="cover_image"
                            accept="image/*"
                            onChange={handleChange}
                            aria-invalid={Boolean(formErrors.cover_image)}
                        />
                    </label>
                    {coverPreview && (
                        <img
                            className="book-cover-preview"
                            src={coverPreview}
                            alt={formData.title || 'Cover preview'}
                        />
                    )}
                    {formErrors.cover_image && <p className="book-field-error">{formErrors.cover_image}</p>}

                    <label>
                        Price
                        <input
                            type="number"
                            name="price"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            aria-invalid={Boolean(formErrors.price)}
                        />
                    </label>
                    {formErrors.price && <p className="book-field-error">{formErrors.price}</p>}

                    <label>
                        Published Date
                        <input
                            type="date"
                            name="published_date"
                            value={formData.published_date}
                            onChange={handleChange}
                            aria-invalid={Boolean(formErrors.published_date)}
                        />
                    </label>
                    {formErrors.published_date && <p className="book-field-error">{formErrors.published_date}</p>}

                    <button disabled={saving}>
                        {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                    </button>
                </form>

                <section className="books-list">
                    <div className="books-list-header">
                        <h2>Book List</h2>
                        <form onSubmit={handleSearch}>
                            <input
                                type="search"
                                placeholder="Search title or author"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button>Search</button>
                        </form>
                    </div>

                    {loading ? (
                        <p className="books-muted">Loading books...</p>
                    ) : books.length ? (
                        <>
                            <div className="books-table-wrap">
                                <table className="books-table">
                                    <thead>
                                        <tr>
                                            <th>S.no</th>
                                            <th>Cover</th>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Price</th>
                                            <th>Published</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((book,index) => (
                                            <tr key={book.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {book.cover_image_url ? (
                                                        <img
                                                            className="book-cover-thumb"
                                                            src={book.cover_image_url}
                                                            alt={book.title}
                                                        />
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>{Number(book.price).toFixed(2)}</td>
                                                <td>{book.published_date || '-'}</td>
                                                <td>
                                                    <div className="book-actions">
                                                        <button type="button" onClick={() => handleEdit(book)}>
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="book-danger-button"
                                                            disabled={deletingId === book.id}
                                                            onClick={() => handleDelete(book)}
                                                        >
                                                            {deletingId === book.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="books-pagination">
                                <button
                                    disabled={meta.current_page <= 1}
                                    onClick={() => handlePageChange(meta.current_page - 1)}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {meta.current_page} of {meta.last_page} ({meta.total} books)
                                </span>
                                <button
                                    disabled={meta.current_page >= meta.last_page}
                                    onClick={() => handlePageChange(meta.current_page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="books-muted">No books found.</p>
                    )}
                </section>
            </section>
        </main>
    )
}
