import api from './api'

export const getBooks = async ({ search = '', page = 1, perPage = 10 } = {}) => {
    const response = await api.get('/books', {
        params: {
            search,
            page,
            per_page: perPage,
        },
    })

    return response.data
}

export const addBook = async (data) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('author', data.author)
    formData.append('price', data.price)

    if (data.published_date) {
        formData.append('published_date', data.published_date)
    }

    if (data.cover_image) {
        formData.append('cover_image', data.cover_image)
    }

    const response = await api.post('/books', formData)

    return response.data
}

export const updateBook = async (id, data) => {
    const formData = new FormData()

    formData.append('_method', 'PUT')
    formData.append('title', data.title)
    formData.append('author', data.author)
    formData.append('price', data.price)

    if (data.published_date) {
        formData.append('published_date', data.published_date)
    }

    if (data.cover_image) {
        formData.append('cover_image', data.cover_image)
    }

    const response = await api.put(`/books/${id}`, formData)

    return response.data
}

export const deleteBook = async (id) => {
    const response = await api.delete(`/books/${id}`)

    return response.data
}
