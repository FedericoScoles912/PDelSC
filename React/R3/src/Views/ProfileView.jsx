import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../Scripts/hooks/useAuth.js';
import { useModal } from '../Scripts/hooks/useModal.js';
import {
  nameValidationRules,
  emailValidationRules,
  optionalPasswordValidationRules,
} from '../Scripts/utils/validators.js';
import FormWrapper from '../Components/FormWrapper.jsx';
import Input from '../Components/Input.jsx';
import Button from '../Components/Button.jsx';
import ModalAlert from '../Components/ModalAlert.jsx';

/**
 * Pantalla completa de Perfil y Edición de Usuario gestionada con React Hook Form
 */
export default function ProfileView({ onNavigateToDashboard }) {
  const { user, updateProfile } = useAuth();
  const { modalState, showSuccess, showError, hideModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  // Actualizar valores del formulario si el usuario en contexto cambia
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const newPasswordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
      };

      if (data.password && data.password.trim().length > 0) {
        payload.password = data.password;
      }

      await updateProfile(payload);
      showSuccess('Los datos de tu perfil fueron actualizados exitosamente en MySQL.');
      // Limpiar campos de contraseña
      reset({
        name: data.name,
        email: data.email,
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      showError(err.message || 'No fue posible actualizar tu perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FormWrapper
        title="Perfil de Usuario"
        subtitle="Edita tu información personal guardada en la base de datos"
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-autumn-warmbrown-light dark:text-autumn-darktext-muted">
            <span>ID: <code className="bg-autumn-beige-200 dark:bg-autumn-darkbg px-1.5 py-0.5 rounded text-[11px] font-mono">{user?.id}</code></span>
            <span>Registrado el: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <Input
                label="Nombre Completo"
                type="text"
                placeholder="Tu nombre completo"
                error={errors.name}
                {...register('name', nameValidationRules)}
              />
            </div>

            <div className="col-12">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="ejemplo@correo.com"
                error={errors.email}
                {...register('email', emailValidationRules)}
              />
            </div>

            <div className="col-12 mt-2 pt-2 border-t border-autumn-beige-200 dark:border-autumn-darkbg-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-autumn-terracotta dark:text-autumn-terracotta-light mb-3">
                Cambio de Contraseña (Opcional)
              </p>
            </div>

            <div className="col-12 col-md-6">
              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="Dejar en blanco para no cambiar"
                error={errors.password}
                {...register('password', optionalPasswordValidationRules)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="Repite la nueva contraseña"
                error={errors.confirmPassword}
                {...register('confirmPassword', {
                  validate: (value) => {
                    if (newPasswordValue && value !== newPasswordValue) {
                      return 'Las contraseñas no coinciden';
                    }
                    return true;
                  },
                })}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            {onNavigateToDashboard && (
              <Button
                variant="ghost"
                onClick={onNavigateToDashboard}
              >
                Volver al Dashboard
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty || isSubmitting}
              isLoading={isSubmitting}
            >
              Guardar Cambios
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
