'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { bookService, collectionService } from '../services/api';
import BookCard from '../components/books/BookCard';
import CollectionCard from '../components/collections/CollectionCard';
import styles from './page.module.css';

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  const [collections, setCollections] = useState<any[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: '',
    publisher: '',
    genre: '',
    description: '',
    pageCount: '',
    coverImage: ''
  });
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [addBookError, setAddBookError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [collectionFormData, setCollectionFormData] = useState({
    name: '',
    description: '',
    color: '#4A6FA5'
  });
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoadingBooks(true);
        const booksResponse = await bookService.getAllBooks();
        setBooks(booksResponse.data);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setBooksError('Не удалось загрузить книги. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoadingBooks(false);
      }

      try {
        setIsLoadingCollections(true);
        const collectionsResponse = await collectionService.getAllCollections();
        setCollections(collectionsResponse.data);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
        setCollectionsError('Не удалось загрузить коллекции. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoadingCollections(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const openAddBookModal = () => {
    setBookFormData({
      title: '',
      author: '',
      isbn: '',
      publishedYear: '',
      publisher: '',
      genre: '',
      description: '',
      pageCount: '',
      coverImage: ''
    });
    setAddBookError(null);
    setIsAddBookModalOpen(true);
  };

  const closeAddBookModal = () => {
    setIsAddBookModalOpen(false);
    setAddBookError(null);
  };

  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookFormData({
      ...bookFormData,
      [name]: value
    });
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookFormData.title.trim() || !bookFormData.author.trim()) {
      setAddBookError('Название и автор обязательны');
      return;
    }

    try {
      setIsSavingBook(true);
      setAddBookError(null);

      const bookData = {
        ...bookFormData,
        publishedYear: bookFormData.publishedYear ? parseInt(bookFormData.publishedYear) : undefined,
        pageCount: bookFormData.pageCount ? parseInt(bookFormData.pageCount) : undefined
      };

      const response = await bookService.createBook(bookData);

      setBooks([response.data, ...books]);

      closeAddBookModal();
    } catch (err) {
      console.error('Failed to add book:', err);
      setAddBookError('Не удалось добавить книгу. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSavingBook(false);
    }
  };

  const openAddCollectionModal = () => {
    setCollectionFormData({
      name: '',
      description: '',
      color: '#4A6FA5'
    });
    setAddCollectionError(null);
    setIsAddCollectionModalOpen(true);
  };

  const closeAddCollectionModal = () => {
    setIsAddCollectionModalOpen(false);
    setAddCollectionError(null);
  };

  const handleCollectionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setCollectionFormData({
        ...collectionFormData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setCollectionFormData({
        ...collectionFormData,
        [name]: value
      });
    }
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionFormData.name.trim()) {
      setAddCollectionError('Название коллекции обязательно');
      return;
    }

    try {
      setIsSavingCollection(true);
      setAddCollectionError(null);

      const response = await collectionService.createCollection(collectionFormData);

      setCollections([response.data, ...collections]);

      closeAddCollectionModal();
    } catch (err) {
      console.error('Failed to create collection:', err);
      setAddCollectionError('Не удалось создать коллекцию. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSavingCollection(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Добро пожаловать в Личную Библиотеку</h1>
          <p className={styles.welcomeText}>
            Управляйте своей коллекцией книг, создавайте тематические подборки и отслеживайте чтение.
          </p>
          <div className={styles.welcomeButtons}>
            <Link href="/login" className={styles.primaryButton}>
              Войти
            </Link>
            <Link href="/register" className={styles.secondaryButton}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.sectionsContainer}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Мои коллекции</h2>
            <div>
              <button
                onClick={openAddCollectionModal}
                className={styles.addButton}
              >
                Добавить коллекцию
              </button>
            </div>
          </div>

          {collectionsError && (
            <div className={styles.errorMessage}>
              {collectionsError}
            </div>
          )}

          {isLoadingCollections ? (
            <div className={styles.loading}>Загрузка коллекций...</div>
          ) : collections.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Коллекций пока нет</h3>
              <p className={styles.emptyStateText}>Создавайте коллекции для организации ваших книг</p>
              <button
                onClick={openAddCollectionModal}
                className={styles.emptyStateButton}
              >
                Создать первую коллекцию
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {collections.map((collection) => (
                <CollectionCard key={collection._id} collection={collection} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Мои книги</h2>
            <div>
              <button
                onClick={openAddBookModal}
                className={styles.addButton}
              >
                Добавить книгу
              </button>
            </div>
          </div>

          {booksError && (
            <div className={styles.errorMessage}>
              {booksError}
            </div>
          )}

          {isLoadingBooks ? (
            <div className={styles.loading}>Загрузка книг...</div>
          ) : books.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Книг пока нет</h3>
              <p className={styles.emptyStateText}>Добавьте книги в вашу библиотеку</p>
              <button
                onClick={openAddBookModal}
                className={styles.emptyStateButton}
              >
                Добавить первую книгу
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>

      {isAddBookModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Добавить книгу</h3>
              <button
                onClick={closeAddBookModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>

            {addBookError && (
              <div className={styles.errorMessage}>
                {addBookError}
              </div>
            )}

            <form onSubmit={handleAddBook}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Название *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={bookFormData.title}
                  onChange={handleBookFormChange}
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
                  value={bookFormData.author}
                  onChange={handleBookFormChange}
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
                  value={bookFormData.isbn}
                  onChange={handleBookFormChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="publishedYear" className={styles.label}>Год издания</label>
                <input
                  type="number"
                  id="publishedYear"
                  name="publishedYear"
                  value={bookFormData.publishedYear}
                  onChange={handleBookFormChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="coverImage" className={styles.label}>URL обложки</label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={bookFormData.coverImage}
                  onChange={handleBookFormChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeAddBookModal}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSavingBook}
                  className={styles.saveButton}
                >
                  {isSavingBook ? 'Добавление...' : 'Добавить книгу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddCollectionModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Создать коллекцию</h3>
              <button
                onClick={closeAddCollectionModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>

            {addCollectionError && (
              <div className={styles.errorMessage}>
                {addCollectionError}
              </div>
            )}

            <form onSubmit={handleAddCollection}>
              <div className={styles.formGroup}>
                <label htmlFor="collectionName" className={styles.label}>Название *</label>
                <input
                  type="text"
                  id="collectionName"
                  name="name"
                  value={collectionFormData.name}
                  onChange={handleCollectionFormChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="collectionDescription" className={styles.label}>Описание</label>
                <textarea
                  id="collectionDescription"
                  name="description"
                  value={collectionFormData.description}
                  onChange={handleCollectionFormChange}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Цвет</label>
                <div className={styles.colorPicker}>
                  {['#4A6FA5', '#6B8E23', '#8B4513', '#483D8B', '#800000', '#2F4F4F', '#BC8F8F'].map((color) => (
                    <div
                      key={color}
                      className={`${styles.colorOption} ${collectionFormData.color === color ? styles.colorOptionSelected : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCollectionFormData({ ...collectionFormData, color })}
                    ></div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeAddCollectionModal}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSavingCollection}
                  className={styles.saveButton}
                >
                  {isSavingCollection ? 'Создание...' : 'Создать коллекцию'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
