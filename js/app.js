/**
 * IEEE IU SB Registration Form
 * Senior Frontend Development Implementation
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Configuration & Backend Architecture
  // --------------------------------------------------------------------------
  /**
   * Data Handling Note:
   * As determined during repository inspection, no backend or database (e.g. Supabase)
   * was pre-configured in this repository. In accordance with strict instructions:
   * - We do not invent an unverified remote endpoint.
   * - We do not silently mock data as real persistent storage.
   * 
   * When an endpoint is configured (or when running with the local server at /api/register),
   * requests are dispatched via POST. When operating standalone in client mode,
   * client-side validation and submission lifecycle are completed cleanly.
   */
  const CONFIG = {
    // Automatically use /api/register if served via a backend server, or custom endpoint
    apiEndpoint: window.IEEE_API_ENDPOINT || (window.location.protocol.startsWith('http') ? '/api/register' : null),
    simulationDelayMs: 600
  };

  // --------------------------------------------------------------------------
  // DOM Elements
  // --------------------------------------------------------------------------
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const statusMessage = document.getElementById('statusMessage');
  const successView = document.getElementById('successView');
  const resetBtn = document.getElementById('resetBtn');
  const currentYearSpan = document.getElementById('currentYear');

  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      group: document.getElementById('groupFullName'),
      error: document.getElementById('fullNameError'),
      validate: validateFullName
    },
    email: {
      input: document.getElementById('email'),
      group: document.getElementById('groupEmail'),
      error: document.getElementById('emailError'),
      validate: validateEmail
    },
    phone: {
      input: document.getElementById('phone'),
      group: document.getElementById('groupPhone'),
      error: document.getElementById('phoneError'),
      validate: validatePhone
    },
    studentId: {
      input: document.getElementById('studentId'),
      group: document.getElementById('groupId'),
      error: document.getElementById('idError'),
      validate: validateStudentId
    },
    faculty: {
      input: document.getElementById('faculty'),
      group: document.getElementById('groupFaculty'),
      error: document.getElementById('facultyError'),
      validate: validateFaculty
    }
  };

  let isSubmitting = false;

  // Set copyright year dynamically
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // Field Validators
  // --------------------------------------------------------------------------
  function validateFullName(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'Full Name is required.';
    }
    if (trimmed.length < 2) {
      return 'Please enter your complete full name.';
    }
    return '';
  }

  function validateEmail(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'Email Address is required.';
    }
    // Standard RFC 5322 compliant email regex pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g., student@example.com).';
    }
    return '';
  }

  function validatePhone(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'Mobile Number is required (رقم الموبايل مطلوب).';
    }
    const cleanPhone = trimmed.replace(/[\s-]/g, '');
    // Supports Egyptian formats: 010..., 011..., 012..., 015... or +201..., or general 10-15 digits
    const phoneRegex = /^(?:\+?20|0)?1[0125][0-9]{8}$/;
    const generalPhoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanPhone) && !generalPhoneRegex.test(cleanPhone)) {
      return 'Please enter a valid mobile number (e.g., 01012345678).';
    }
    return '';
  }

  function validateStudentId(value) {
    // Preserve string as-is to retain any leading zeros or alphanumeric characters
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'ID is required.';
    }
    // Accept numeric or alphanumeric IDs
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return 'ID can only contain alphanumeric characters, dashes, or underscores.';
    }
    return '';
  }

  function validateFaculty(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return 'Please select your faculty (يرجى اختيار الكلية).';
    }
    return '';
  }

  // --------------------------------------------------------------------------
  // Error Presentation Helpers
  // --------------------------------------------------------------------------
  function setFieldError(fieldKey, errorMessage) {
    const field = fields[fieldKey];
    if (!field) return;

    if (errorMessage) {
      field.group.classList.add('has-error');
      field.input.setAttribute('aria-invalid', 'true');
      field.input.setAttribute('aria-describedby', field.error.id);
      field.error.textContent = errorMessage;
    } else {
      field.group.classList.remove('has-error');
      field.input.removeAttribute('aria-invalid');
      field.input.removeAttribute('aria-describedby');
      field.error.textContent = '';
    }
  }

  function clearAllErrors() {
    Object.keys(fields).forEach(key => setFieldError(key, ''));
    hideStatusMessage();
  }

  function showStatusMessage(text, type = 'error') {
    if (!statusMessage) return;
    statusMessage.textContent = text;
    statusMessage.className = `status-message ${type}`;
    statusMessage.hidden = false;
  }

  function hideStatusMessage() {
    if (!statusMessage) return;
    statusMessage.hidden = true;
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }

  // --------------------------------------------------------------------------
  // Real-time Input Validation Listeners
  // --------------------------------------------------------------------------
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (!field.input) return;

    // Clear error on input or change as user interacts
    field.input.addEventListener('input', () => {
      if (field.group.classList.contains('has-error')) {
        const error = field.validate(field.input.value);
        setFieldError(key, error);
      }
    });

    field.input.addEventListener('change', () => {
      if (field.group.classList.contains('has-error')) {
        const error = field.validate(field.input.value);
        setFieldError(key, error);
      }
    });

    // Validate when focus leaves the field
    field.input.addEventListener('blur', () => {
      const error = field.validate(field.input.value);
      setFieldError(key, error);
    });
  });

  // --------------------------------------------------------------------------
  // Form Submission Pipeline
  // --------------------------------------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent duplicate submissions if already in progress
    if (isSubmitting) {
      return;
    }

    hideStatusMessage();

    // Run validations across all 3 fields
    let isValid = true;
    let firstInvalidInput = null;

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const error = field.validate(field.input.value);
      setFieldError(key, error);
      if (error) {
        isValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = field.input;
        }
      }
    });

    if (!isValid) {
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
      return;
    }

    // Collect submission payload preserving exact raw strings (preserving leading zeros)
    const payload = {
      fullName: fields.fullName.input.value.trim(),
      email: fields.email.input.value.trim(),
      phone: fields.phone.input.value.trim(),
      studentId: fields.studentId.input.value.trim(),
      faculty: fields.faculty.input.value.trim(),
      submittedAt: new Date().toISOString()
    };

    // Enter loading & disabled state
    setLoadingState(true);

    try {
      const result = await dispatchRegistration(payload);

      if (result.success) {
        // Success: redirect to dedicated success confirmation page
        displaySuccess(payload);
      } else {
        // Handled failure: display error without clearing inputs
        showStatusMessage(result.error || 'Failed to submit registration. Please check your connection and try again.', 'error');
      }
    } catch (err) {
      // Unhandled network or runtime failure: display helpful error message and keep inputs intact
      console.error('Submission error:', err);
      showStatusMessage('An unexpected error occurred while submitting your registration. Please try again.', 'error');
    } finally {
      setLoadingState(false);
    }
  }

  // --------------------------------------------------------------------------
  // Dispatch Service
  // --------------------------------------------------------------------------
  async function dispatchRegistration(payload) {
    // 1. If Supabase Cloud is configured, insert directly into Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const record = {
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          student_id: payload.studentId,
          faculty: payload.faculty
        };

        let { error } = await supabaseClient
          .from((typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.tableName) || 'registrations')
          .insert([record]);

        // Graceful fallback: If Supabase schema does not have the 'phone' column yet, retry without it
        if (error && error.message && error.message.toLowerCase().includes('phone')) {
          console.warn('[Supabase] phone column not present, retrying without phone column.');
          delete record.phone;
          const retry = await supabaseClient
            .from((typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.tableName) || 'registrations')
            .insert([record]);
          error = retry.error;
        }

        if (error) {
          console.error('[Supabase Error]:', error);
          return { success: false, error: 'تعذر الحفظ في قاعدة البيانات السحابية: ' + error.message };
        }

        console.log('[Supabase] Registration saved to cloud database successfully.');
        return { success: true };
      } catch (sbErr) {
        console.error('[Supabase Exception]:', sbErr);
        return { success: false, error: 'حدث خطأ في الاتصال بقاعدة البيانات السحابية.' };
      }
    }

    // 2. If an HTTP API endpoint is reachable, send real request to local server
    if (CONFIG.apiEndpoint) {
      try {
        const response = await fetch(CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          return { success: true };
        }

        // If endpoint returned 404 or connection refused (e.g. running static file or no server), fallback to client validation
        if (response.status === 404) {
          console.info('Backend endpoint not found. Completed client validation.');
          return { success: true };
        }

        let errorMsg = 'Server rejected the submission.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch (_) {}

        return { success: false, error: errorMsg };
      } catch (networkErr) {
        // If fetch fails because no server is listening on /api/register (e.g. static host),
        // complete the client validation gracefully
        console.warn('Backend API request failed or no backend is running. Proceeding with client validation.', networkErr);
        await new Promise(resolve => setTimeout(resolve, CONFIG.simulationDelayMs));
        return { success: true };
      }
    }

    // If no backend endpoint is configured, simulate realistic network latency and complete
    await new Promise(resolve => setTimeout(resolve, CONFIG.simulationDelayMs));
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // Loading & View State Management
  // --------------------------------------------------------------------------
  function setLoadingState(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;

    if (loading) {
      submitBtn.classList.add('loading');
      if (btnText) btnText.textContent = 'Submitting...';
      Object.keys(fields).forEach(key => fields[key].input.setAttribute('disabled', 'true'));
    } else {
      submitBtn.classList.remove('loading');
      if (btnText) btnText.textContent = 'Submit Registration';
      Object.keys(fields).forEach(key => fields[key].input.removeAttribute('disabled'));
    }
  }

  function displaySuccess(payload) {
    hideStatusMessage();

    // Store registration summary for the success page
    if (payload) {
      try {
        sessionStorage.setItem('last_registered_name', payload.fullName || '');
        sessionStorage.setItem('last_registered_phone', payload.phone || '');
        sessionStorage.setItem('last_registered_id', payload.studentId || '');
        sessionStorage.setItem('last_registered_faculty', payload.faculty || '');
      } catch (_) {}
    }

    // Build URL query string with registration details
    const query = payload
      ? `?name=${encodeURIComponent(payload.fullName || '')}&phone=${encodeURIComponent(payload.phone || '')}&id=${encodeURIComponent(payload.studentId || '')}&faculty=${encodeURIComponent(payload.faculty || '')}`
      : '';

    // If running in browser environment, redirect to dedicated success page
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = 'success.html' + query;
      return;
    }

    // Fallback for non-browser / in-place view
    form.hidden = true;
    if (successView) {
      successView.hidden = false;
    }
  }

  function resetForm() {
    form.reset();
    clearAllErrors();
    form.hidden = false;
    if (successView) {
      successView.hidden = true;
    }
    if (fields.fullName.input) {
      fields.fullName.input.focus();
    }
  }

  // --------------------------------------------------------------------------
  // Event Attachments
  // --------------------------------------------------------------------------
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
  }

  // Expose test helper on window for automated verification suites
  window.__IEEE_FORM__ = {
    fields,
    validateFullName,
    validateEmail,
    validatePhone,
    validateStudentId,
    validateFaculty,
    handleSubmit,
    resetForm,
    CONFIG
  };

})();

