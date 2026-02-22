/**
 * Narcissus Riyadh Booking Form – Frontend Logic
 * Handles validation, date restriction, and AJAX submission to Google Apps Script.
 */

(function() {
    'use strict';

    // ===== DOM Elements =====
    const form = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const dateInput = document.getElementById('bookingDate');
    const phoneInput = document.getElementById('phone');

    // ===== Configuration =====
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfu4C8EpAdgE_WZSVtk_rj0Vy6aor_cMX6GgZCwdQLmd18teY6mKDPFjpthxPSOArLhA/exec'; // Replace with your deployed URL

    // ===== Helper Functions =====

    /**
     * Sets the minimum date for the date input to today (YYYY-MM-DD).
     * This prevents users from selecting past dates.
     */
    function setMinDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        if (dateInput) {
            dateInput.setAttribute('min', todayFormatted);
        }
    }

    /**
     * Validates Saudi phone number format.
     * Accepts: 05xxxxxxxx or 5xxxxxxxx (10 digits, starts with 05 or 5)
     * @param {string} phone - The phone number to validate.
     * @returns {boolean} - True if valid.
     */
    function isValidSaudiPhone(phone) {
        const re = /^(05|5)[0-9]{8}$/; // 10 digits total, starts with 05 or 5
        return re.test(phone);
    }

    /**
     * Displays a temporary message to the user.
     * @param {string} message - The message text.
     * @param {string} type - 'success' or 'error'.
     */
    function showMessage(message, type) {
        // Remove any existing message
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `form-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.setAttribute('role', 'alert');

        // Insert after the submit button
        submitBtn.parentNode.insertAdjacentElement('afterend', msgDiv);

        // Auto-hide after 5 seconds (for success)
        if (type === 'success') {
            setTimeout(() => {
                if (msgDiv.parentNode) msgDiv.remove();
            }, 5000);
        }
    }

    /**
     * Toggles the loading state of the submit button.
     * @param {boolean} isLoading - True to show loading spinner and disable.
     */
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            // Show spinner (it exists in HTML)
            const spinner = submitBtn.querySelector('.btn-loader');
            const btnText = submitBtn.querySelector('.btn-text');
            if (spinner) spinner.style.display = 'inline-block';
            if (btnText) btnText.style.opacity = '0.7';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            const spinner = submitBtn.querySelector('.btn-loader');
            const btnText = submitBtn.querySelector('.btn-text');
            if (spinner) spinner.style.display = 'none';
            if (btnText) btnText.style.opacity = '1';
        }
    }

    /**
     * Collects form data into a plain object.
     * @returns {Object} - Key-value pairs of form fields.
     */
    function getFormData() {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    // ===== Form Submission Handler =====
    async function handleSubmit(event) {
        event.preventDefault(); // Prevent default browser submission

        // 1. Additional custom validation
        const phone = phoneInput.value.trim();
        if (!isValidSaudiPhone(phone)) {
            showMessage('يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)', 'error');
            phoneInput.focus();
            return;
        }

        // 2. Check all required fields (HTML5 already does, but double-check)
        if (!form.checkValidity()) {
            // Let the browser show its validation messages
            form.reportValidity();
            return;
        }

        // 3. Show loading state
        setLoading(true);

        // 4. Collect data
        const payload = getFormData();

        // 5. Send to Google Apps Script
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important: Google Apps Script Web App with doPost() often requires no-cors if not configured correctly. But we'll set mode to 'cors' if possible. However, for simplicity and to avoid CORS issues, we'll use no-cors. Note: with no-cors, we cannot read response. We'll assume success if no network error.
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // With no-cors, response is opaque; we cannot check status.
            // We'll assume success if fetch didn't throw.
            setLoading(false);
            showMessage('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.', 'success');
            form.reset(); // Clear form (optional)

        } catch (error) {
            console.error('Submission error:', error);
            setLoading(false);
            showMessage('عذراً، حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.', 'error');
        }
    }

    // ===== Initialization =====
    function init() {
        // Set min date for date picker
        setMinDate();

        // Attach submit handler
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        // Optional: real-time phone validation hint (could be added)
    }

    // Run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


})();

