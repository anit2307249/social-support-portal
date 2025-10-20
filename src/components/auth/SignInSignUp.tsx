import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, signup } from '../../store/authSlice';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { toastOptions } from '../../utils/toastConfig';
import { useTranslation } from 'react-i18next';

interface AuthFormValues {
    role: 'user' | 'admin';
    name: string;
    email: string;
    password: string;
}

export default function SignInSignUp() {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
        setValue,
        reset,
    } = useForm<AuthFormValues>({
        defaultValues: {
            role: 'user',
            name: '',
            email: '',
            password: '',
        },
        mode: 'onSubmit',
    });

    const role = watch('role');

    useEffect(() => {
        if (mode === 'signup' && role !== 'user') {
            setValue('role', 'user');
            toast(t('signupUserOnly'), { ...toastOptions, icon: '⚠️' });
        }
    }, [mode, role, setValue, t]);

    useEffect(() => {
        reset({}, { keepValues: true });
    }, [i18n.language, reset]);

    const onSubmit = async (data: AuthFormValues) => {
        try {
            if (mode === 'signin') {
                const resultAction = await dispatch(login({ email: data.email, password: data.password }));
                if (login.fulfilled.match(resultAction)) {
                    toast.success(t('loginSuccess'), toastOptions);
                } else {
                    toast.error(resultAction.payload || t('loginFailed'), toastOptions);
                }
            } else {
                const isValid = await trigger(['name', 'email', 'password']);
                if (!isValid) {
                    toast.error(t('fillRequiredFields'), toastOptions);
                    return;
                }

                const resultAction = await dispatch(signup({ name: data.name, email: data.email, password: data.password }));
                if (signup.fulfilled.match(resultAction)) {
                    toast.success(t('signupSuccess'), toastOptions);
                    setMode('signin');
                    reset({ role: 'user', name: '', email: '', password: '' });
                } else {
                    toast.error(resultAction.payload || t('signupFailed'), toastOptions);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(t('somethingWentWrong'), toastOptions);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow relative" role="form" aria-labelledby="authFormTitle">
            {/* Sign In / Sign Up toggle */}
            <div className="flex justify-center mb-6 relative">
                <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`px-4 py-2 font-medium ${mode === 'signin' ? 'border-b-2 border-purple-600' : 'text-gray-500'}`}
                    aria-pressed={mode === 'signin'}
                    aria-label={t('signIn')}
                >
                    {t('signIn')}
                </button>
                <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-4 py-2 font-medium ${mode === 'signup' ? 'border-b-2 border-purple-600' : 'text-gray-500'}`}
                    aria-pressed={mode === 'signup'}
                    aria-label={t('signUp')}
                >
                    {t('signUp')}
                </button>

                {/* Language Switcher */}
                <div className="absolute right-0 top-0 py-2" aria-live="polite">
                    <label htmlFor="languageSelect" className="sr-only">{t('selectLanguage')}</label>
                    <select
                        id="languageSelect"
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        className="border p-1 rounded"
                        aria-label={t('selectLanguage')}
                    >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-labelledby="authForm">
                <div>
                    <label htmlFor="role" className="block mb-1">{t('role')}</label>
                    <select
                        {...register('role')}
                        id="role"
                        className="w-full border p-2 rounded"
                        disabled={mode === 'signup'}
                        aria-invalid={errors.role ? 'true' : 'false'}
                        aria-describedby="roleError"
                    >
                        <option value="user">{t('user')}</option>
                        {mode === 'signin' && <option value="admin">{t('admin')}</option>}
                    </select>
                    {errors.role && <span id="roleError" className="text-red-500 text-sm">{errors.role.message}</span>}
                </div>

                {mode === 'signup' && (
                    <div>
                        <label htmlFor="name" className="block mb-1">{t('name')}</label>
                        <input
                            {...register('name', { required: t('nameRequired') })}
                            id="name"
                            className={`w-full border p-2 rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            aria-invalid={errors.name ? 'true' : 'false'}
                            aria-describedby="nameError"
                        />
                        {errors.name && <span id="nameError" className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block mb-1">{t('email')}</label>
                    <input
                        {...register('email', {
                            required: t('emailRequired'),
                            pattern: { value: /^\S+@\S+$/i, message: t('invalidEmail') },
                        })}
                        id="email"
                        className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby="emailError"
                    />
                    {errors.email && <span id="emailError" className="text-red-500 text-sm">{errors.email.message}</span>}
                </div>

                <div>
                    <label htmlFor="password" className="block mb-1">{t('password')}</label>
                    <input
                        {...register('password', {
                            required: t('passwordRequired'),
                            minLength: { value: 6, message: t('passwordMinLength') },
                        })}
                        id="password"
                        type="password"
                        className={`w-full border p-2 rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby="passwordError"
                    />
                    {errors.password && <span id="passwordError" className="text-red-500 text-sm">{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded flex justify-center items-center gap-2"
                    disabled={auth.loading}
                    aria-live="assertive"
                >
                    {auth.loading && <Loader size={4} color="white" />}
                    {mode === 'signin'
                        ? auth.loading ? t('signingIn') : t('signIn')
                        : auth.loading ? t('signingUp') : t('signUp')}
                </button>
            </form>
        </div>
    );
}
