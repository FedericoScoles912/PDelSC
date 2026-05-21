const Validations = {
    isEmpty(value) {
        return value === null || value === undefined || value.toString().trim() === '';
    },

    hasMinLength(value, min) {
        return value.toString().trim().length >= min;
    },

    hasMaxLength(value, max) {
        return value.toString().trim().length <= max;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isOnlyNumbers(value) {
        const numberRegex = /^[0-9]+$/;
        return numberRegex.test(value);
    },

    isOnlyLetters(value) {
        const letterRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return letterRegex.test(value);
    },

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    isValidAge(birthDate, minAge = 0, maxAge = 120) {
        if (!this.isValidDate(birthDate)) return false;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= minAge && age <= maxAge;
    },

    isValidPhone(phone) {
        const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
        return phoneRegex.test(phone);
    },

    isValidDocument(doc, type = 'DNI') {
        if (type === 'DNI') {
            return this.isOnlyNumbers(doc) && doc.length >= 7 && doc.length <= 10;
        }
        return !this.isEmpty(doc);
    },

    validateField(field, rules) {
        const value = field.value;
        let isValid = true;
        let message = '';

        if (rules.required && this.isEmpty(value)) {
            isValid = false;
            message = 'Este campo es obligatorio';
        } else if (!this.isEmpty(value)) {
            if (rules.minLength && !this.hasMinLength(value, rules.minLength)) {
                isValid = false;
                message = `Debe tener al menos ${rules.minLength} caracteres`;
            } else if (rules.maxLength && !this.hasMaxLength(value, rules.maxLength)) {
                isValid = false;
                message = `Debe tener máximo ${rules.maxLength} caracteres`;
            } else if (rules.email && !this.isValidEmail(value)) {
                isValid = false;
                message = 'Ingrese un email válido';
            } else if (rules.numbers && !this.isOnlyNumbers(value)) {
                isValid = false;
                message = 'Solo se permiten números';
            } else if (rules.letters && !this.isOnlyLetters(value)) {
                isValid = false;
                message = 'Solo se permiten letras';
            } else if (rules.date && !this.isValidDate(value)) {
                isValid = false;
                message = 'Ingrese una fecha válida';
            } else if (rules.age && !this.isValidAge(value, rules.minAge, rules.maxAge)) {
                isValid = false;
                message = `Edad debe estar entre ${rules.minAge || 0} y ${rules.maxAge || 120} años`;
            } else if (rules.phone && !this.isValidPhone(value)) {
                isValid = false;
                message = 'Ingrese un teléfono válido';
            } else if (rules.document && !this.isValidDocument(value)) {
                isValid = false;
                message = 'Documento inválido';
            }
        }

        return { isValid, message };
    },

    setFieldValidation(field, isValid, message) {
        const feedbackDiv = field.parentNode.querySelector('.invalid-feedback, .valid-feedback');
        field.classList.remove('is-valid', 'is-invalid');

        if (isValid) {
            field.classList.add('is-valid');
            if (feedbackDiv) {
                feedbackDiv.classList.remove('invalid-feedback');
                feedbackDiv.classList.add('valid-feedback');
                feedbackDiv.textContent = 'Campo válido';
            }
        } else {
            field.classList.add('is-invalid');
            if (feedbackDiv) {
                feedbackDiv.classList.remove('valid-feedback');
                feedbackDiv.classList.add('invalid-feedback');
                feedbackDiv.textContent = message;
            }
        }
    },

    validateForm(form, rules) {
        let isFormValid = true;
        const fields = form.querySelectorAll('[name]');

        fields.forEach(field => {
            const fieldRules = rules[field.name];
            if (fieldRules) {
                const { isValid, message } = this.validateField(field, fieldRules);
                this.setFieldValidation(field, isValid, message);
                if (!isValid) isFormValid = false;
            }
        });

        return isFormValid;
    },

    clearValidation(form) {
        const fields = form.querySelectorAll('[name]');
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }
};
