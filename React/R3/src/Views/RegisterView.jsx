import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import { useModal } from '../Scripts/hooks/useModal.js';
import {
  nameValidationRules,
  emailValidationRules,
  passwordValidationRules,
} from '../Scripts/utils/validators.js';
import FormWrapper from '../Components/FormWrapper.jsx';
import Input from '../Components/Input.jsx';
import Button from '../Components/Button.jsx';
import ModalAlert from '../Components/ModalAlert.jsx';

/**
 * Pantalla completa de Registro gestionada con React Hook Form
 */
export default function RegisterView({ onNavigateToLogin, onRegisterSuccess }) {
  const { register: registerUser } = useAuth();
  const { modalState, showError, hideModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      showError(err.message || 'No fue posible registrar la cuenta. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormWrapper
        title="Crear Cuenta"
        subtitle="Completa tus datos para registrarte en la base de datos SQL"
        footer={
          <div className="text-center text-sm text-autumn-warmbrown-light dark:text-autumn-darktext-secondary">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-autumn-terracotta hover:underline dark:text-autumn-terracotta-light bg-transparent border-0 p-0 cursor-pointer"
            >
              Inicia sesión aquí
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="María López"
            error={errors.name}
            {...register('name', nameValidationRules)}
          />

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
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            {...register('password', passwordValidationRules)}
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            error={errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (value) =>
                value === passwordValue || 'Las contraseñas no coinciden',
            })}
          />

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              isLoading={isSubmitting}
            >
              Crear Cuenta
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
