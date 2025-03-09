'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

const schema = yup.object({
    username: yup.string().required('Имя пользователя обязательно'),
    email: yup.string().email('Неверный формат email').required('Email обязателен'),
    password: yup.string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .required('Пароль обязателен'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Пароли должны совпадать')
        .required('Подтверждение пароля обязательно'),
    firstName: yup.string(),
    lastName: yup.string(),
}).required();

export default function Register() {
    const { register: registerUser } = useAuth();
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
            const { confirmPassword, ...userData } = data;
            await registerUser(userData);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось зарегистрироваться');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Создание аккаунта</h1>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.label}>
                        Имя пользователя
                    </label>
                    <input
                        id="username"
                        type="text"
                        className={styles.input}
                        {...register('username')}
                    />
                    {errors.username && (
                        <p className={styles.errorText}>{errors.username.message}</p>
                    )}
                </div>

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

                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName" className={styles.label}>
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            {...register('firstName')}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="lastName" className={styles.label}>
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            {...register('lastName')}
                            className={styles.input}
                        />
                    </div>
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

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        Подтверждение пароля
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={styles.input}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p className={styles.errorText}>{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>

            <div className={styles.links}>
                <p>
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className={styles.link}>
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
} 