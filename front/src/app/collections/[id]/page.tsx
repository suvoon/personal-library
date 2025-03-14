'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { collectionService, bookService } from '../../../services/api';
import BookCard from '../../../components/books/BookCard';
import styles from './collection-details.module.css';

export default function CollectionDetails() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [collection, setCollection] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isAddBooksModalOpen, setIsAddBooksModalOpen] = useState(false);
    const [allBooks, setAllBooks] = useState<any[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingBooks, setIsLoadingBooks] = useState(false);
    const [isSavingBooks, setIsSavingBooks] = useState(false);
    const [addBooksError, setAddBooksError] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
    });
    const [isSavingCollection, setIsSavingCollection] = useState(false);
    const [editCollectionError, setEditCollectionError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchCollection = async () => {
            if (!user || !collectionId) return;

            try {
                setIsLoading(true);
                const response = await collectionService.getCollectionById(collectionId);
                setCollection(response.data);

                setEditFormData({
                    name: response.data.name,
                    description: response.data.description || '',
                });

                if (response.data.books && response.data.books.length > 0) {
                    const bookPromises = response.data.books.map((book: any) =>
                        bookService.getBookById(book._id)
                    );
                    const bookResponses = await Promise.all(bookPromises);
                    setBooks(bookResponses.map(response => response.data));
                }
            } catch (err) {
                console.error('Не удалось получить коллекцию:', err);
                setError('Не удалось получить коллекцию');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, [user, collectionId]);

    const handleDelete = async () => {
        if (!confirm('Вы точно хотите удалить коллекцию?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await collectionService.deleteCollection(collectionId);
            router.push('/');
        } catch (err) {
            console.error('Не удалось удалить коллекцию:', err);
            setError('Не удалось удалить коллекцию');
            setIsDeleting(false);
        }
    };

    const openEditModal = () => {
        setEditFormData({
            name: collection.name,
            description: collection.description || '',
        });
        setEditCollectionError(null);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditCollectionError(null);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setEditFormData({
                ...editFormData,
                [name]: (e.target as HTMLInputElement).checked
            });
        } else {
            setEditFormData({
                ...editFormData,
                [name]: value
            });
        }
    };

    const saveCollection = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editFormData.name.trim()) {
            setEditCollectionError('Введите название коллекции');
            return;
        }

        try {
            setIsSavingCollection(true);
            setEditCollectionError(null);

            await collectionService.updateCollection(collectionId, {
                ...collection,
                name: editFormData.name,
                description: editFormData.description,
            });

            setCollection({
                ...collection,
                name: editFormData.name,
                description: editFormData.description,
            });

            closeEditModal();
        } catch (err) {
            console.error('Не удалось обновить коллекцию:', err);
            setEditCollectionError('Не удалось обновить коллекцию');
        } finally {
            setIsSavingCollection(false);
        }
    };

    const openAddBooksModal = async () => {
        try {
            setIsLoadingBooks(true);
            setAddBooksError(null);
            const response = await bookService.getAllBooks();
            const userBooks = response.data;
            setAllBooks(userBooks);
            setFilteredBooks(userBooks);

            const collectionBookIds = collection.books.map((bookId: string) => bookId);
            setSelectedBooks(collectionBookIds);

            setIsAddBooksModalOpen(true);
        } catch (err) {
            console.error('Не удалось загрузить книги:', err);
            setAddBooksError('Не удалось загрузить книги');
        } finally {
            setIsLoadingBooks(false);
        }
    };

    const closeAddBooksModal = () => {
        setIsAddBooksModalOpen(false);
        setSearchQuery('');
        setAddBooksError(null);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setFilteredBooks(allBooks);
        } else {
            const filtered = allBooks.filter(book =>
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    };

    const toggleBookSelection = (bookId: string) => {
        setSelectedBooks(prev => {
            if (prev.includes(bookId)) {
                return prev.filter(id => id !== bookId);
            } else {
                return [...prev, bookId];
            }
        });
    };

    const saveBooks = async () => {
        try {
            setIsSavingBooks(true);
            setAddBooksError(null);

            await collectionService.updateCollection(collectionId, {
                ...collection,
                books: selectedBooks
            });

            const response = await collectionService.getCollectionById(collectionId);
            setCollection(response.data);

            if (response.data.books && response.data.books.length > 0) {
                const bookPromises = response.data.books.map((bookId: string) =>
                    bookService.getBookById(bookId)
                );
                const bookResponses = await Promise.all(bookPromises);
                setBooks(bookResponses.map(response => response.data));
            } else {
                setBooks([]);
            }

            closeAddBooksModal();
        } catch (err) {
            console.error('Не удалось обновить книги:', err);
            setAddBooksError('Не удалось обновить книги');
        } finally {
            setIsSavingBooks(false);
        }
    };

    if (authLoading || !user) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    Назад
                </Link>
                <h1 className={styles.title}>Коллекция</h1>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className={styles.loading}>Загрузка коллекции...</div>
            ) : collection ? (
                <>
                    <div className={styles.collectionContainer}>
                        <div className={styles.collectionHeader}>
                            <div className={styles.collectionInfo}>
                                <h2 className={styles.collectionName}>{collection.name}</h2>
                                {collection.description && (
                                    <p className={styles.collectionDescription}>{collection.description}</p>
                                )}
                                <div className={styles.collectionMeta}>
                                    <span className={styles.collectionMetaItem}>
                                        {books.length} {books.length === 1 ? 'Книга' : 'книг'}
                                    </span>
                                    <span className={styles.collectionMetaItem}>
                                        Создано {new Date(collection.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.actionsContainer}>
                                <button
                                    onClick={openEditModal}
                                    className={styles.editButton}
                                >
                                    Редактировать
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className={styles.deleteButton}
                                >
                                    {isDeleting ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.booksSection}>
                        <div className={styles.booksHeader}>
                            <h3 className={styles.booksTitle}>Книги в коллекции</h3>
                            <button
                                onClick={openAddBooksModal}
                                className={styles.addBookButton}
                            >
                                Добавить книги
                            </button>
                        </div>

                        {books.length === 0 ? (
                            <div className={styles.emptyBooks}>
                                <h4 className={styles.emptyBooksTitle}>Пока нет книг</h4>
                                <p className={styles.emptyBooksText}>Добавьте книги в вашу коллекцию</p>
                                <button
                                    onClick={openAddBooksModal}
                                    className={styles.addBookButton}
                                >
                                    Добавить книгу
                                </button>
                            </div>
                        ) : (
                            <div className={styles.booksGrid}>
                                {books.map((book) => (
                                    <BookCard key={book._id} book={book} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.errorMessage}>
                    Коллекция не найдена
                </div>
            )}

            {isEditModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Редактировать</h3>
                            <button
                                onClick={closeEditModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {editCollectionError && (
                            <div className={styles.errorMessage}>
                                {editCollectionError}
                            </div>
                        )}

                        <form onSubmit={saveCollection}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>
                                    Название коллекции
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description" className={styles.label}>
                                    Описание
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditFormChange}
                                    className={styles.textarea}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className={styles.cancelButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingCollection}
                                    className={styles.saveButton}
                                >
                                    {isSavingCollection ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAddBooksModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Добавить книгу</h3>
                            <button
                                onClick={closeAddBooksModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {addBooksError && (
                            <div className={styles.errorMessage}>
                                {addBooksError}
                            </div>
                        )}

                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className={styles.searchInput}
                            />
                        </div>

                        {isLoadingBooks ? (
                            <div className={styles.loading}>Загрузка...</div>
                        ) : filteredBooks.length === 0 ? (
                            <div className={styles.noBooks}>
                                {searchQuery ? 'Книг не найдено' : 'У вас ещё нет книг'}
                            </div>
                        ) : (
                            <div className={styles.booksList}>
                                {filteredBooks.map((book) => (
                                    <div
                                        key={book._id}
                                        className={styles.bookItem}
                                        onClick={() => toggleBookSelection(book._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedBooks.includes(book._id)}
                                            onChange={() => { }}
                                            className={styles.bookCheckbox}
                                        />
                                        <div className={styles.bookInfo}>
                                            <div className={styles.bookTitle}>{book.title}</div>
                                            <div className={styles.bookAuthor}>от {book.author}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button
                                onClick={closeAddBooksModal}
                                className={styles.cancelButton}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={saveBooks}
                                disabled={isSavingBooks}
                                className={styles.saveButton}
                            >
                                {isSavingBooks ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 