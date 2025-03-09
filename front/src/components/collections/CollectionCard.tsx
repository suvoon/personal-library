import React from 'react';
import Link from 'next/link';
import styles from './CollectionCard.module.css';

interface CollectionProps {
    collection: {
        _id: string;
        name: string;
        description?: string;
        books: any[];
    };
}

const CollectionCard: React.FC<CollectionProps> = ({ collection }) => {
    return (
        <Link
            href={`/collections/${collection._id}`}
        >
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.content}>
                        <h3 className={styles.title}>{collection.name}</h3>
                        {collection.description && (
                            <p className={styles.description}>{collection.description}</p>
                        )}
                        <p className={styles.bookCount}>
                            {collection.books.length} {collection.books.length === 1 ? 'книга' : 'книг'}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CollectionCard; 