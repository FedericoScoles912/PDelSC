// ============================================================
// Components/ContactForm.jsx  (Sección + Formulario)
// Formulario de contacto con 3 campos (name, email, body).
// Validación inline usando validateNotEmpty y validateEmail
// desde Scripts/utils. Envía los datos por POST vía apiClient.
// Muestra notificaciones de éxito/error mediante useNotification.
// ============================================================
import { useState } from 'react';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';
import { validateNotEmpty, validateEmail } from '../Scripts/utils.js';
import * as apiClient from '../Scripts/apiClient.js';
import { useNotification } from '../Scripts/NotificationContext.jsx';

export function ContactForm() {
  const { notify } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    body: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    body: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', body: '' };
    let valid = true;

    if (!validateNotEmpty(formData.name)) {
      newErrors.name = 'El nombre es obligatorio.';
      valid = false;
    }

    if (!validateNotEmpty(formData.email)) {
      newErrors.email = 'El correo electrónico es obligatorio.';
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido.';
      valid = false;
    }

    if (!validateNotEmpty(formData.body)) {
      newErrors.body = 'El mensaje es obligatorio.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        body: formData.body.trim(),
      };

      await apiClient.post('/api/messages', payload);

      notify('success', 'Mensaje enviado!');

      setFormData({ name: '', email: '', body: '' });
      setErrors({ name: '', email: '', body: '' });
    } catch (err) {
      notify('error', 'Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full py-16 md:py-24 px-6 md:px-10 lg:px-16"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="section-title font-display text-3xl md:text-4xl lg:text-5xl
          font-bold text-softBrown dark:text-mustard mb-10 md:mb-14 text-center">
          Contacto
        </h2>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl p-6 md:p-8
            bg-white/70 dark:bg-deepBrown/50
            border border-terracotta/15 dark:border-burntOrange/15
            shadow-warm dark:shadow-warmDark
            flex flex-col gap-5"
        >
          <Input
            name="name"
            label="Nombre"
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleChange}
            errorMessage={errors.name}
            disabled={loading}
          />

          <Input
            name="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            errorMessage={errors.email}
            disabled={loading}
          />

          <Input
            name="body"
            label="Mensaje"
            type="textarea"
            placeholder="Contame sobre tu proyecto o consulta..."
            value={formData.body}
            onChange={handleChange}
            errorMessage={errors.body}
            disabled={loading}
            rows={6}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              <Icon name="send" size={18} />
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
