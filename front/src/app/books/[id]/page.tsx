'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { bookService, collectionService, noteService, borrowerService } from '../../../services/api';
import styles from './book-details.module.css';

export default function BookDetails() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;

    const [book, setBook] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [collections, setCollections] = useState<any[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);
    const [isSavingCollections, setIsSavingCollections] = useState(false);
    const [collectionError, setCollectionError] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<any>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const [notes, setNotes] = useState<any[]>([]);
    const [borrowers, setBorrowers] = useState<any[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [isLoadingBorrowers, setIsLoadingBorrowers] = useState(false);
    const [noteError, setNoteError] = useState<string | null>(null);
    const [borrowerError, setBorrowerError] = useState<string | null>(null);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteFormData, setNoteFormData] = useState<any>({
        content: '',
        page: '',
        highlight: ''
    });
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    const [isBorrowerModalOpen, setIsBorrowerModalOpen] = useState(false);
    const [borrowerFormData, setBorrowerFormData] = useState<any>({
        borrowerName: '',
        contactInfo: '',
        dueDate: '',
        notes: ''
    });
    const [editingBorrowerId, setEditingBorrowerId] = useState<string | null>(null);
    const [isSavingBorrower, setIsSavingBorrower] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchBook = async () => {
            if (!user || !bookId) return;

            try {
                setIsLoading(true);
                const response = await bookService.getBookById(bookId);
                setBook(response.data);
            } catch (err) {
                console.error('Failed to fetch book:', err);
                setError('Failed to load book details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [user, bookId]);

    useEffect(() => {
        const fetchNotesAndBorrowers = async () => {
            if (!user || !bookId) return;

            try {
                setIsLoadingNotes(true);
                setIsLoadingBorrowers(true);
                setNoteError(null);
                setBorrowerError(null);

                const [notesResponse, borrowersResponse] = await Promise.all([
                    noteService.getNotesByBook(bookId),
                    borrowerService.getBorrowersByBook(bookId)
                ]);

                setNotes(notesResponse.data);
                setBorrowers(borrowersResponse.data);
            } catch (err) {
                console.error('Failed to fetch notes and borrowers:', err);
                setNoteError('Failed to load notes');
                setBorrowerError('Failed to load borrowers');
            } finally {
                setIsLoadingNotes(false);
                setIsLoadingBorrowers(false);
            }
        };

        fetchNotesAndBorrowers();
    }, [user, bookId]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await bookService.deleteBook(bookId);
            router.push('/');
        } catch (err) {
            console.error('Failed to delete book:', err);
            setError('Failed to delete book. Please try again later.');
            setIsDeleting(false);
        }
    };

    const openAddToCollectionModal = async () => {
        try {
            setIsLoadingCollections(true);
            setCollectionError(null);
            const response = await collectionService.getAllCollections();
            setCollections(response.data);

            const selectedIds = response.data
                .filter((collection: any) => collection.books.includes(bookId))
                .map((collection: any) => collection._id);

            setSelectedCollections(selectedIds);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Failed to load collections:', err);
            setCollectionError('Failed to load collections. Please try again later.');
        } finally {
            setIsLoadingCollections(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCollections([]);
        setCollectionError(null);
    };

    const toggleCollectionSelection = (collectionId: string) => {
        setSelectedCollections(prev => {
            if (prev.includes(collectionId)) {
                return prev.filter(id => id !== collectionId);
            } else {
                return [...prev, collectionId];
            }
        });
    };

    const saveCollections = async () => {
        try {
            setIsSavingCollections(true);
            setCollectionError(null);

            const currentCollections = collections
                .filter((collection: any) => collection.books.includes(bookId))
                .map((collection: any) => collection._id);

            const collectionsToAdd = selectedCollections.filter(id => !currentCollections.includes(id));

            const collectionsToRemove = currentCollections.filter(id => !selectedCollections.includes(id));

            for (const collectionId of collectionsToAdd) {
                await collectionService.addBookToCollection(collectionId, bookId);
            }

            for (const collectionId of collectionsToRemove) {
                await collectionService.removeBookFromCollection(collectionId, bookId);
            }

            closeModal();
        } catch (err) {
            console.error('Failed to update collections:', err);
            setCollectionError('Failed to update collections. Please try again later.');
        } finally {
            setIsSavingCollections(false);
        }
    };

    const openEditModal = () => {
        setEditFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            publishedYear: book.publishedYear || '',
            publisher: book.publisher || '',
            genre: book.genre || '',
            pageCount: book.pageCount || '',
            description: book.description || '',
            coverImage: book.coverImage || ''
        });
        setIsEditModalOpen(true);
        setEditError(null);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormData(null);
        setEditError(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev: Record<string, string | number>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSavingEdit(true);
            setEditError(null);

            const response = await bookService.updateBook(bookId, editFormData);
            setBook(response.data);
            closeEditModal();
        } catch (err) {
            console.error('Failed to update book:', err);
            setEditError('Failed to update book. Please try again later.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const openNoteModal = (note: any = null) => {
        if (note) {
            setNoteFormData({
                content: note.content,
                page: note.page || '',
                highlight: note.highlight || ''
            });
            setEditingNoteId(note._id);
        } else {
            setNoteFormData({
                content: '',
                page: '',
                highlight: ''
            });
            setEditingNoteId(null);
        }
        setIsNoteModalOpen(true);
        setNoteError(null);
    };

    const closeNoteModal = () => {
        setIsNoteModalOpen(false);
        setNoteFormData({
            content: '',
            page: '',
            highlight: ''
        });
        setEditingNoteId(null);
        setNoteError(null);
    };

    const handleNoteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNoteFormData((prev: Record<string, string>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSavingNote(true);
            setNoteError(null);

            const noteData = {
                ...noteFormData,
                bookId
            };

            let response: { data: any };
            if (editingNoteId) {
                response = await noteService.updateNote(editingNoteId, noteData);
                setNotes(prev => prev.map(note =>
                    note._id === editingNoteId ? response.data : note
                ));
            } else {
                response = await noteService.createNote(noteData);
                setNotes(prev => [response.data, ...prev]);
            }

            closeNoteModal();
        } catch (err) {
            console.error('Failed to save note:', err);
            setNoteError('Failed to save note. Please try again later.');
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await noteService.deleteNote(noteId);
            setNotes(prev => prev.filter(note => note._id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
            setNoteError('Failed to delete note. Please try again later.');
        }
    };

    const openBorrowerModal = (borrower: any = null) => {
        if (borrower) {
            setBorrowerFormData({
                borrowerName: borrower.borrowerName,
                contactInfo: borrower.contactInfo,
                dueDate: borrower.dueDate.split('T')[0],
                notes: borrower.notes || ''
            });
            setEditingBorrowerId(borrower._id);
        } else {
            setBorrowerFormData({
                borrowerName: '',
                contactInfo: '',
                dueDate: '',
                notes: ''
            });
            setEditingBorrowerId(null);
        }
        setIsBorrowerModalOpen(true);
        setBorrowerError(null);
    };

    const closeBorrowerModal = () => {
        setIsBorrowerModalOpen(false);
        setBorrowerFormData({
            borrowerName: '',
            contactInfo: '',
            dueDate: '',
            notes: ''
        });
        setEditingBorrowerId(null);
        setBorrowerError(null);
    };

    const handleBorrowerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBorrowerFormData((prev: Record<string, string>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBorrowerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSavingBorrower(true);
            setBorrowerError(null);

            const borrowerData = {
                ...borrowerFormData,
                bookId
            };

            let response: { data: any };
            if (editingBorrowerId) {
                response = await borrowerService.updateBorrower(editingBorrowerId, borrowerData);
                setBorrowers(prev => prev.map(borrower =>
                    borrower._id === editingBorrowerId ? response.data : borrower
                ));
            } else {
                response = await borrowerService.createBorrower(borrowerData);
                setBorrowers(prev => [response.data, ...prev]);
            }

            closeBorrowerModal();
        } catch (err) {
            console.error('Failed to save borrower:', err);
            setBorrowerError('Failed to save borrower record. Please try again later.');
        } finally {
            setIsSavingBorrower(false);
        }
    };

    const handleReturnBook = async (borrowerId: string) => {
        try {
            const response = await borrowerService.returnBook(borrowerId);
            setBorrowers(prev => prev.map(borrower =>
                borrower._id === borrowerId ? response.data : borrower
            ));
        } catch (err) {
            console.error('Failed to mark book as returned:', err);
            setBorrowerError('Failed to mark book as returned. Please try again later.');
        }
    };

    const handleDeleteBorrower = async (borrowerId: string) => {
        if (!confirm('Are you sure you want to delete this borrower record?')) {
            return;
        }

        try {
            await borrowerService.deleteBorrower(borrowerId);
            setBorrowers(prev => prev.filter(borrower => borrower._id !== borrowerId));
        } catch (err) {
            console.error('Failed to delete borrower:', err);
            setBorrowerError('Failed to delete borrower record. Please try again later.');
        }
    };

    if (authLoading || !user) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    &larr; Назад
                </Link>
                <h1 className={styles.title}>Детали книги</h1>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className={styles.loading}>Загрузка деталей книги...</div>
            ) : book ? (
                <div className={styles.bookContainer}>
                    <div className={styles.imageContainer}>
                        {book.coverImage ? (
                            <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className={styles.fallbackImage}>
                                <div>
                                    <p className={styles.fallbackTitle}>{book.title}</p>
                                    <p className={styles.fallbackAuthor}>от {book.author}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.detailsContainer}>
                        <h2 className={styles.bookTitle}>{book.title}</h2>
                        <p className={styles.bookAuthor}>by {book.author}</p>

                        <div className={styles.detailsGrid}>
                            {book.isbn && (
                                <div className={styles.detailItem}>
                                    <div className={styles.detailLabel}>ISBN</div>
                                    <div className={styles.detailValue}>{book.isbn}</div>
                                </div>
                            )}

                            {book.publishedYear && (
                                <div className={styles.detailItem}>
                                    <div className={styles.detailLabel}>Год публикации</div>
                                    <div className={styles.detailValue}>{book.publishedYear}</div>
                                </div>
                            )}

                            {book.publisher && (
                                <div className={styles.detailItem}>
                                    <div className={styles.detailLabel}>Издательство</div>
                                    <div className={styles.detailValue}>{book.publisher}</div>
                                </div>
                            )}

                            {book.genre && (
                                <div className={styles.detailItem}>
                                    <div className={styles.detailLabel}>Жанр</div>
                                    <div className={styles.detailValue}>{book.genre}</div>
                                </div>
                            )}

                            {book.pageCount && (
                                <div className={styles.detailItem}>
                                    <div className={styles.detailLabel}>Количество страниц</div>
                                    <div className={styles.detailValue}>{book.pageCount}</div>
                                </div>
                            )}

                            <div className={styles.detailItem}>
                                <div className={styles.detailLabel}>Добавлено</div>
                                <div className={styles.detailValue}>
                                    {new Date(book.addedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {book.description && (
                            <div className={styles.description}>
                                <div className={styles.descriptionLabel}>Описание</div>
                                <div className={styles.descriptionText}>{book.description}</div>
                            </div>
                        )}

                        <div className={styles.actionsContainer}>
                            <button
                                onClick={openEditModal}
                                className={styles.editButton}
                            >
                                Редактировать книгу
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={styles.deleteButton}
                            >
                                {isDeleting ? 'Удаление...' : 'Удалить книгу'}
                            </button>
                            <button
                                onClick={openAddToCollectionModal}
                                className={styles.addToCollectionButton}
                            >
                                Добавить в коллекцию
                            </button>
                        </div>

                        <div className={styles.notesSection}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.sectionTitle}>Заметки</h3>
                                <button
                                    onClick={() => openNoteModal()}
                                    className={styles.addButton}
                                >
                                    Добавить заметку
                                </button>
                            </div>

                            {noteError && (
                                <div className={styles.errorMessage}>
                                    {noteError}
                                </div>
                            )}

                            {isLoadingNotes ? (
                                <div className={styles.loading}>Загрузка заметок...</div>
                            ) : notes.length === 0 ? (
                                <div className={styles.emptyNotes}>
                                    Заметок пока нет. Добавьте свою первую заметку!
                                </div>
                            ) : (
                                <div className={styles.notesList}>
                                    {notes.map((note) => (
                                        <div key={note._id} className={styles.noteItem}>
                                            <div className={styles.noteHeader}>
                                                <div className={styles.noteInfo}>
                                                    {note.page && (
                                                        <div className={styles.notePage}>
                                                            Страница {note.page}
                                                        </div>
                                                    )}
                                                    <div className={styles.noteDate}>
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className={styles.noteActions}>
                                                    <button
                                                        onClick={() => openNoteModal(note)}
                                                        className={styles.editNoteButton}
                                                    >
                                                        Изменить
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        className={styles.deleteNoteButton}
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.noteContent}>
                                                {note.content}
                                            </div>
                                            {note.highlight && (
                                                <div className={styles.noteHighlight}>
                                                    "{note.highlight}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.borrowersSection}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.sectionTitle}>История выдачи</h3>
                                <button
                                    onClick={() => openBorrowerModal()}
                                    className={styles.addButton}
                                >
                                    Добавить запись
                                </button>
                            </div>

                            {borrowerError && (
                                <div className={styles.errorMessage}>
                                    {borrowerError}
                                </div>
                            )}

                            {isLoadingBorrowers ? (
                                <div className={styles.loading}>Загрузка истории выдачи...</div>
                            ) : borrowers.length === 0 ? (
                                <div className={styles.emptyBorrowers}>
                                    История выдачи пока отсутствует.
                                </div>
                            ) : (
                                <div className={styles.borrowersList}>
                                    {borrowers.map((borrower) => (
                                        <div key={borrower._id} className={styles.borrowerItem}>
                                            <div className={styles.borrowerHeader}>
                                                <div className={styles.borrowerInfo}>
                                                    <div className={styles.borrowerName}>
                                                        {borrower.borrowerName}
                                                    </div>
                                                    <div className={styles.borrowerContact}>
                                                        {borrower.contactInfo}
                                                    </div>
                                                </div>
                                                <div className={`${styles.borrowerStatus} ${styles[`status${borrower.status.charAt(0).toUpperCase() + borrower.status.slice(1)}`]}`}>
                                                    {borrower.status === 'active' ? 'Активна' :
                                                        borrower.status === 'overdue' ? 'Просрочена' :
                                                            borrower.status === 'returned' ? 'Возвращена' : borrower.status}
                                                </div>
                                            </div>
                                            <div className={styles.borrowerDates}>
                                                <div className={styles.borrowerDate}>
                                                    <span className={styles.borrowerDateLabel}>Выдана:</span>
                                                    <span className={styles.borrowerDateValue}>
                                                        {new Date(borrower.borrowDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className={styles.borrowerDate}>
                                                    <span className={styles.borrowerDateLabel}>Срок:</span>
                                                    <span className={styles.borrowerDateValue}>
                                                        {new Date(borrower.dueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {borrower.returnDate && (
                                                    <div className={styles.borrowerDate}>
                                                        <span className={styles.borrowerDateLabel}>Возвращена:</span>
                                                        <span className={styles.borrowerDateValue}>
                                                            {new Date(borrower.returnDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {borrower.notes && (
                                                <div className={styles.borrowerNotes}>
                                                    {borrower.notes}
                                                </div>
                                            )}
                                            <div className={styles.borrowerActions}>
                                                {borrower.status === 'active' && (
                                                    <button
                                                        onClick={() => handleReturnBook(borrower._id)}
                                                        className={styles.returnButton}
                                                    >
                                                        Отметить возврат
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openBorrowerModal(borrower)}
                                                    className={styles.editBorrowerButton}
                                                >
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBorrower(borrower._id)}
                                                    className={styles.deleteBorrowerButton}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.errorMessage}>
                    Книга не найдена
                </div>
            )}

            {isEditModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Редактировать книгу</h3>
                            <button
                                onClick={closeEditModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {editError && (
                            <div className={styles.errorMessage}>
                                {editError}
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title" className={styles.label}>Название *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="author" className={styles.label}>Автор *</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={editFormData.author}
                                    onChange={handleEditInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="isbn" className={styles.label}>ISBN</label>
                                <input
                                    type="text"
                                    id="isbn"
                                    name="isbn"
                                    value={editFormData.isbn}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="publishedYear" className={styles.label}>Год издания</label>
                                <input
                                    type="number"
                                    id="publishedYear"
                                    name="publishedYear"
                                    value={editFormData.publishedYear}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="publisher" className={styles.label}>Издательство</label>
                                <input
                                    type="text"
                                    id="publisher"
                                    name="publisher"
                                    value={editFormData.publisher}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="genre" className={styles.label}>Жанр</label>
                                <input
                                    type="text"
                                    id="genre"
                                    name="genre"
                                    value={editFormData.genre}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="pageCount" className={styles.label}>Количество страниц</label>
                                <input
                                    type="number"
                                    id="pageCount"
                                    name="pageCount"
                                    value={editFormData.pageCount}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="coverImage" className={styles.label}>URL обложки</label>
                                <input
                                    type="url"
                                    id="coverImage"
                                    name="coverImage"
                                    value={editFormData.coverImage}
                                    onChange={handleEditInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description" className={styles.label}>Описание</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditInputChange}
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
                                    disabled={isSavingEdit}
                                    className={styles.saveButton}
                                >
                                    {isSavingEdit ? 'Сохранение...' : 'Сохранить изменения'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Добавить в коллекцию</h3>
                            <button
                                onClick={closeModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {collectionError && (
                            <div className={styles.errorMessage}>
                                {collectionError}
                            </div>
                        )}

                        {isLoadingCollections ? (
                            <div className={styles.loading}>Загрузка коллекций...</div>
                        ) : collections.length === 0 ? (
                            <div>
                                <p className={styles.noCollections}>У вас пока нет коллекций.</p>
                                <Link
                                    href="/collections/add"
                                    className={styles.createCollectionLink}
                                    onClick={closeModal}
                                >
                                    Создать новую коллекцию
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.collectionsList}>
                                    {collections.map((collection) => (
                                        <div
                                            key={collection._id}
                                            className={styles.collectionItem}
                                            onClick={() => toggleCollectionSelection(collection._id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCollections.includes(collection._id)}
                                                onChange={() => { }}
                                                className={styles.collectionCheckbox}
                                            />
                                            <span className={styles.collectionName}>
                                                {collection.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        onClick={closeModal}
                                        className={styles.cancelButton}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={saveCollections}
                                        disabled={isSavingCollections}
                                        className={styles.saveButton}
                                    >
                                        {isSavingCollections ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isNoteModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingNoteId ? 'Редактировать заметку' : 'Добавить заметку'}
                            </h3>
                            <button
                                onClick={closeNoteModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {noteError && (
                            <div className={styles.errorMessage}>
                                {noteError}
                            </div>
                        )}

                        <form onSubmit={handleNoteSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="content" className={styles.label}>Содержание заметки *</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={noteFormData.content}
                                    onChange={handleNoteInputChange}
                                    required
                                    className={styles.textarea}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="page" className={styles.label}>Номер страницы</label>
                                <input
                                    type="number"
                                    id="page"
                                    name="page"
                                    value={noteFormData.page}
                                    onChange={handleNoteInputChange}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="highlight" className={styles.label}>Цитата</label>
                                <textarea
                                    id="highlight"
                                    name="highlight"
                                    value={noteFormData.highlight}
                                    onChange={handleNoteInputChange}
                                    className={styles.textarea}
                                    placeholder="Добавьте цитату или выдержку из книги..."
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={closeNoteModal}
                                    className={styles.cancelButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingNote}
                                    className={styles.saveButton}
                                >
                                    {isSavingNote ? 'Сохранение...' : 'Сохранить заметку'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBorrowerModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingBorrowerId ? 'Редактировать запись' : 'Добавить запись о выдаче'}
                            </h3>
                            <button
                                onClick={closeBorrowerModal}
                                className={styles.closeButton}
                            >
                                &times;
                            </button>
                        </div>

                        {borrowerError && (
                            <div className={styles.errorMessage}>
                                {borrowerError}
                            </div>
                        )}

                        <form onSubmit={handleBorrowerSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="borrowerName" className={styles.label}>Имя читателя *</label>
                                <input
                                    type="text"
                                    id="borrowerName"
                                    name="borrowerName"
                                    value={borrowerFormData.borrowerName}
                                    onChange={handleBorrowerInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contactInfo" className={styles.label}>Контактная информация *</label>
                                <input
                                    type="text"
                                    id="contactInfo"
                                    name="contactInfo"
                                    value={borrowerFormData.contactInfo}
                                    onChange={handleBorrowerInputChange}
                                    required
                                    className={styles.input}
                                    placeholder="Номер телефона или email"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="dueDate" className={styles.label}>Срок возврата *</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    value={borrowerFormData.dueDate}
                                    onChange={handleBorrowerInputChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="notes" className={styles.label}>Примечания</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={borrowerFormData.notes}
                                    onChange={handleBorrowerInputChange}
                                    className={styles.textarea}
                                    placeholder="Дополнительные примечания..."
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={closeBorrowerModal}
                                    className={styles.cancelButton}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingBorrower}
                                    className={styles.saveButton}
                                >
                                    {isSavingBorrower ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 