import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import { useModal } from '../Scripts/hooks/useModal.js';
import { emailValidationRules, passwordValidationRules } from '../Scripts/utils/validators.js';
import FormWrapper from '../Components/FormWrapper.jsx';
import Input from '../Components/Input.jsx';
import Button from '../Components/Button.jsx';
import ModalAlert from '../Components/ModalAlert.jsx';

/**
 * Pantalla completa de Login gestionada con React Hook Form
 * Compatible tanto con Sistema A como Sistema B
 */
export default function LoginView({ onNavigateToRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const { modalState, showError, hideModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      showError(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormWrapper
        title="Iniciar Sesión"
        subtitle="Ingresa a tu cuenta para acceder al sistema"
        footer={
          <div className="text-center text-sm text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
            ¿No tienes una cuenta aún?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-autumn-terracotta hover:underline dark:text-autumn-terracotta-light bg-transparent border-0 p-0 cursor-pointer"
            >
              Regístrate aquí
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            error={errors.email}
            {...register('email', emailValidationRules)}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password', passwordValidationRules)}
          />

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              isLoading={isSubmitting}
            >
              Ingresar al Sistema
            </Button>
          </div>
        </form>
      </FormWrapper>

      <ModalAlert
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={hideModal}
      />
    </>
  );
}
