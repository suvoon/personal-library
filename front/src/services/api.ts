import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    register: async (userData: any) => {
        const response = await api.post('/users/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    login: async (credentials: any) => {
        const response = await api.post('/users/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    getCurrentUser: async () => {
        return await api.get('/users/me');
    },
};

export const bookService = {
    getAllBooks: async () => {
        return await api.get('/books');
    },
    getBookById: async (id: string) => {
        return await api.get(`/books/${id}`);
    },
    createBook: async (bookData: any) => {
        return await api.post('/books', bookData);
    },
    updateBook: async (id: string, bookData: any) => {
        return await api.put(`/books/${id}`, bookData);
    },
    deleteBook: async (id: string) => {
        return await api.delete(`/books/${id}`);
    },
    searchBooks: async (query: string) => {
        return await api.get(`/books/search/${query}`);
    },
};

export const collectionService = {
    getAllCollections: async () => {
        return await api.get('/collections');
    },
    getCollectionById: async (id: string) => {
        return await api.get(`/collections/${id}`);
    },
    createCollection: async (collectionData: any) => {
        return await api.post('/collections', collectionData);
    },
    updateCollection: async (id: string, collectionData: any) => {
        return await api.put(`/collections/${id}`, collectionData);
    },
    deleteCollection: async (id: string) => {
        return await api.delete(`/collections/${id}`);
    },
    addBookToCollection: async (collectionId: string, bookId: string) => {
        return await api.post(`/collections/${collectionId}/books/${bookId}`);
    },
    removeBookFromCollection: async (collectionId: string, bookId: string) => {
        return await api.delete(`/collections/${collectionId}/books/${bookId}`);
    },
};

export const noteService = {
    getNotesByBook: (bookId: string) => api.get(`/notes/book/${bookId}`),
    createNote: (data: any) => api.post('/notes', data),
    updateNote: (id: string, data: any) => api.put(`/notes/${id}`, data),
    deleteNote: (id: string) => api.delete(`/notes/${id}`)
};

export const borrowerService = {
    getBorrowersByBook: (bookId: string) => api.get(`/borrowers/book/${bookId}`),
    createBorrower: (data: any) => api.post('/borrowers', data),
    updateBorrower: (id: string, data: any) => api.put(`/borrowers/${id}`, data),
    returnBook: (id: string) => api.put(`/borrowers/${id}/return`),
    deleteBorrower: (id: string) => api.delete(`/borrowers/${id}`)
};

export default api; 