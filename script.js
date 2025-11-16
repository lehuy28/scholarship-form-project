let formData = {};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scholarshipForm');
    const reasonTextarea = form.querySelector('textarea[name="reason"]');
    const charCount = document.getElementById('charCount');
    
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('error')) validateField(field);
        });
    });
    
    if (reasonTextarea) {
        reasonTextarea.addEventListener('input', () => {
            charCount.textContent = reasonTextarea.value.length;
        });
    }
    
    form.addEventListener('submit', handleSubmit);
});

function validateField(field) {
    const errorMsg = field.closest('.form-question')?.querySelector('.error-msg');
    let isValid = true;
    let message = '';
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        if (field.type === 'radio') {
            const checked = document.querySelector(`input[name="${field.name}"]:checked`);
            if (!checked) {
                isValid = false;
                message = 'Vui lòng chọn một tùy chọn';
            }
        } else if (field.type === 'checkbox' && field.name === 'agreement') {
            if (!field.checked) {
                isValid = false;
                message = 'Bạn phải đồng ý với cam kết';
            }
        } else {
            isValid = false;
            message = 'Trường này là bắt buộc';
        }
    }
    
    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        isValid = false;
        message = 'Email không hợp lệ';
    }
    
    if (field.name === 'phone' && field.value && !isValidPhone(field.value)) {
        isValid = false;
        message = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    }
    
    if (field.name === 'idCard' && field.value && !isValidIDCard(field.value)) {
        isValid = false;
        message = 'Số CCCD phải có đúng 12 chữ số';
    }
    
    if (field.name === 'studentId' && field.value && !isValidStudentId(field.value)) {
        isValid = false;
        message = 'Mã sinh viên không hợp lệ';
    }
    
    if (field.name === 'academicYear' && field.value && !isValidAcademicYear(field.value)) {
        isValid = false;
        message = 'Năm học phải có dạng YYYY-YYYY (VD: 2023-2024)';
    }
    
    if (field.name === 'gpa' && field.value) {
        const gpa = parseFloat(field.value);
        if (gpa < 0 || gpa > 4) {
            isValid = false;
            message = 'GPA phải từ 0.00 đến 4.00';
        }
    }
    
    if (field.name === 'trainingScore' && field.value) {
        const score = parseInt(field.value);
        if (score < 0 || score > 100) {
            isValid = false;
            message = 'Điểm rèn luyện phải từ 0 đến 100';
        }
    }
    
    // if (field.name === 'reason' && field.value && field.value.length < 50) {
    //     isValid = false;
    //     message = 'Lý do xin học bổng phải có ít nhất 50 ký tự';
    // }
    
    if (isValid) {
        field.classList.remove('error');
        if (errorMsg) errorMsg.textContent = '';
    } else {
        field.classList.add('error');
        if (errorMsg) errorMsg.textContent = message;
    }
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^0\d{9}$/.test(phone);
}

function isValidIDCard(id) {
    return /^\d{12}$/.test(id);
}

function isValidStudentId(id) {
    return /^[A-Z0-9]{6,10}$/i.test(id);
}

function isValidAcademicYear(year) {
    return /^\d{4}-\d{4}$/.test(year);
}

function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formElements = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    formElements.forEach(field => {
        if (!validateField(field)) isValid = false;
    });
    
    if (!isValid) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    collectFormData(form);
    formData.submittedAt = new Date().toISOString();
    formData.submittedBy = 'lehuy28';
    
    saveToLocalStorage(formData);
    
    console.log('✅ Form Data:', formData);
    
    showSuccessModal();
    
    form.reset();
    document.getElementById('charCount').textContent = '0';
}

function collectFormData(form) {
    formData = {};
    
    const formElements = form.querySelectorAll('input, select, textarea');
    
    formElements.forEach(field => {
        const name = field.name;
        if (!name) return;
        
        if (field.type === 'checkbox') {
            if (name === 'agreement') {
                formData.agreement = field.checked;
            }
        } else if (field.type === 'radio') {
            if (field.checked) formData[name] = field.value;
        } else if (field.type === 'file') {
            if (field.files.length > 0) {
                formData[name] = Array.from(field.files).map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                }));
            }
        } else {
            formData[name] = field.value;
        }
    });
}

function saveToLocalStorage(data) {
    let submissions = JSON.parse(localStorage.getItem('scholarships')) || [];
    submissions.push(data);
    localStorage.setItem('scholarships', JSON.stringify(submissions));
    console.log('💾 Saved to localStorage. Total submissions:', submissions.length);
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
}

window.closeModal = function() {
    document.getElementById('successModal').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

window.clearForm = function() {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ form?')) return;
    
    const form = document.getElementById('scholarshipForm');
    form.reset();
    
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    
    document.getElementById('charCount').textContent = '0';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}