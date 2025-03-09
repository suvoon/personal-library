import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './BookCard.module.css';

interface BookProps {
    book: {
        _id: string;
        title: string;
        author: string;
        coverImage?: string;
        genre?: string;
        publishedYear?: number;
    };
}

const BookCard: React.FC<BookProps> = ({ book }) => {
    return (
        <Link
            href={`/books/${book._id}`}
        >
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    {book.coverImage ? (
                        <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div className={styles.fallbackContainer}>
                            <div className={styles.fallbackContent}>
                                <p className={styles.fallbackTitle}>{book.title}</p>
                                <p className={styles.fallbackAuthor}>{book.author}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.content}>
                    <h3 className={styles.title}>{book.title}</h3>
                    <p className={styles.author}>by {book.author}</p>
                    {book.genre && <p className={styles.genre}>{book.genre}</p>}
                    {book.publishedYear && <p className={styles.year}>{book.publishedYear}</p>}
                    <div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BookCard; 