import { api, onAuthChange } from './api.js';

const IS_LOGIN = location.pathname.endsWith('login.html');
const IS_REGISTER = location.pathname.endsWith('register.html');

// ----------------------------------------------------------------
// Page bootstrapping
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Try to restore session (silent refresh) on any page
  const restored = await api._silentRefresh();

  if (IS_LOGIN || IS_REGISTER) {
    if (restored) {
      // already logged in, bounce home
      location.href = '/index.html';
      return;
    }
    wireForms();
  } else {
    // main app pages require auth
    if (!restored) {
      location.href = '/login.html';
      return;
    }
    wireNavbar();
  }
});

// ----------------------------------------------------------------
// Navbar: show real user, wire logout
// ----------------------------------------------------------------
function wireNavbar() {
  onAuthChange(({ user }) => {
    const nameSpan = document.querySelector('#navbarDropdown');
    if (nameSpan && user) {
      nameSpan.innerHTML =
        `<i class="fas fa-user-circle me-1"></i> ${user.fullName}` +
        (user.role !== 'STUDENT'
          ? ` <span class="badge bg-primary ms-1">${user.role}</span>`
          : '');
    }
    // hide "Create Event" for STUDENT
    const createLink = document.querySelector('[data-section="create"]');
    if (createLink && user && user.role === 'STUDENT') {
      createLink.closest('.nav-item')?.classList.add('d-none');
    }
  });

  document.querySelectorAll('[data-logout]').forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      await api.logout();
      location.href = '/login.html';
    });
  });
}

// ----------------------------------------------------------------
// Login / Register form handlers
// ----------------------------------------------------------------
function wireForms() {
  const loginForm = document.querySelector('#loginForm');
  const registerForm = document.querySelector('#registerForm');
  const alertBox = document.querySelector('#formAlert');

  const showError = (msg) => {
    if (!alertBox) return alert(msg);
    alertBox.textContent = msg;
    alertBox.classList.remove('d-none');
  };
  const clearError = () => alertBox?.classList.add('d-none');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const btn = loginForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await api.login({
        email: loginForm.email.value.trim(),
        password: loginForm.password.value,
      });
      location.href = '/index.html';
    } catch (err) {
      showError(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const btn = registerForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await api.register({
        fullName: registerForm.fullName.value.trim(),
        email: registerForm.email.value.trim(),
        password: registerForm.password.value,
        studentId: registerForm.studentId.value.trim() || undefined,
        department: registerForm.department.value.trim() || undefined,
      });
      // Auto-login after register
      await api.login({
        email: registerForm.email.value.trim(),
        password: registerForm.password.value,
      });
      location.href = '/index.html';
    } catch (err) {
      showError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}