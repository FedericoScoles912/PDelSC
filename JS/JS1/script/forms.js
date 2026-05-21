const Forms = {
    getElementById(form, fieldName) {
        return document.getElementById(fieldName).value;
    },

    getQuerySelector(form, fieldName) {
        return form.querySelector(`[name="${fieldName}"]`).value;
    },

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    },

    reset(form) {
        form.reset();
        Validations.clearValidation(form);
    },

    fill(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
};
