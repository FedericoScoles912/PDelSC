import { useCallback, useMemo, useState } from 'react';

/**
 * useForm — Hook reutilizable y atomizado para formularios.
 *
 * Maneja:
 *  - values        -> estado actual de campos
 *  - errors        -> errores por campo (validación cliente)
 *  - handleChange  -> onChange unificado (soporta checkbox/input/text/number)
 *  - handleSubmit  -> onSubmit que ejecuta validación antes de invocar onSubmit
 *  - setField, reset
 *  - isValid       -> flag derivado
 *
 * @param {object} options
 * @param {object} options.initialValues         Valores iniciales { email:'', password:'', ... }
 * @param {Record<string, (value:any, values:object)=>string|undefined>} options.validate Rules
 * @param {(values:object, helpers)=>Promise<void>|void} options.onSubmit Acción submit exitosa
 */
export function useForm({ initialValues = {}, validate = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const runValidation = useCallback((v = values, fields = null) => {
    const acc = {};
    const keys = fields || Object.keys(validate);
    for (const key of keys) {
      const rule = validate[key];
      if (typeof rule === 'function') {
        const err = rule(v[key], v);
        if (err) acc[key] = err;
      }
    }
    return acc;
  }, [validate, values]);

  const isValid = useMemo(() => {
    return Object.keys(runValidation()).length === 0;
  }, [runValidation]);

  const handleChange = useCallback((e) => {
    const target = e?.target;
    if (!target) return;
    const { name, type, value, checked } = target;
    if (!name) return;
    const nextVal = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: nextVal }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const reset = useCallback((next = initialValues) => {
    setValues(next);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const validationErrors = runValidation(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(values, { setField, setFieldError, reset });
    } catch (err) {
      // Los errores de servidor se pueden mostrar vía NotificationContext o setFieldError
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [values, runValidation, onSubmit, setField, setFieldError, reset]);

  return {
    values,
    errors,
    touched,
    submitting,
    isValid,
    handleChange,
    handleSubmit,
    setField,
    setFieldError,
    setErrors,
    reset,
  };
}

export default useForm;
