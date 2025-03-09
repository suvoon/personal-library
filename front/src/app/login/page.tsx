'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

const schema = yup.object({
    email: yup.string().email('Неверный формат email').required('Email обязателен'),
    password: yup.string().required('Пароль обязателен'),
}).required();

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            await login(data.email, data.password);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось войти в систему');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Вход в аккаунт</h1>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className={styles.errorText}>{errors.email.message}</p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        className={styles.input}
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className={styles.errorText}>{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                >
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>

            <div className={styles.links}>
                <p>
                    Нет аккаунта?{' '}
                    <Link href="/register" className={styles.link}>
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
} 