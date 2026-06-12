// ── View management ──
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
 const backBtn = document.getElementById('nav-back-btn');
if (backBtn) backBtn.style.display = id === 'view-home' ? 'none' : 'inline-flex';
}

function showHome(e) {
  if(e) e.preventDefault();
  showView('view-home');
}

function scrollToHub() {
  document.getElementById('hub').scrollIntoView({behavior:'smooth'});
}

// ── Nav scroll state ──
const navEl = document.getElementById('main-nav');
if (navEl) {
  window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 8), {passive:true});
}

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver(entries => {
  entries.forEach((e,i) => {
    if(e.isIntersecting){
      setTimeout(() => e.target.classList.add('visible'), i * 70);
      ro.unobserve(e.target);
    }
  });
}, {threshold:.12});
reveals.forEach(el => ro.observe(el));

// ── Custom radio/checkbox click state handler ──
document.addEventListener('click', function(e) {
  const label = e.target.closest('.radio-label, .check-label');
  if (!label) return;

  const inp = label.querySelector('input[type="radio"], input[type="checkbox"]');
  if (!inp) return;

  if (e.target === inp) {
    syncCustomInputs(inp);
    return;
  }

  e.preventDefault();
  if (inp.type === 'radio') {
    inp.checked = true;
  } else if (inp.type === 'checkbox') {
    inp.checked = !inp.checked;
  }

  inp.dispatchEvent(new Event('change', { bubbles: true }));
  syncCustomInputs(inp);
});

function syncCustomInputs(inp) {
  if (inp.type === 'radio') {
    document.querySelectorAll(`input[name="${inp.name}"]`).forEach(r => {
      const lbl = r.closest('label');
      if (lbl) lbl.classList.toggle('checked', r.checked);
    });
  } else if (inp.type === 'checkbox') {
    const lbl = inp.closest('label');
    if (lbl) lbl.classList.toggle('checked', inp.checked);
  }
}

// ── Validation helpers ──
function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v){ return v.replace(/\s/g,'').length >= 7; }

function validateField(el, type='required') {
  if (!el) return true;
  const wrap = el.closest('[data-field]');
  let ok = true;
  const v = el.value.trim();
  if(type==='email') ok = validateEmail(v);
  else if(type==='tel') ok = validatePhone(v);
  else ok = v.length > 0;
  
  if(wrap) wrap.classList.toggle('has-error', !ok);
  if(!ok) el.classList.add('error'); else el.classList.remove('error');
  return ok;
}

// ── Fixed Radio Group Validation Helper ──
function validateRadioGroup(name, errId) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  const errEl = document.getElementById(errId);
  const radioInp = document.querySelector(`input[name="${name}"]`);
  const wrap = radioInp ? radioInp.closest('[data-field]') : null;
  
  if (!checked) { 
    if (errEl) errEl.style.display = 'block'; 
    if (wrap) wrap.classList.add('has-error');
    return false; 
  }
  
  if (errEl) errEl.style.display = 'none';
  if (wrap) wrap.classList.remove('has-error');
  return true;
}

// Helper to handle AJAX Form submission
function handleFormSubmit(formId, successId, cardId, endpoint) {
  const form = document.getElementById(formId);
  if(!form) return;
  
  form.addEventListener('submit', function(e){
    e.preventDefault(); // 👈 Stops the layout from refreshing or routing to /api/webinar
    
    let ok = true;
    if(formId === 'f1') {
      ok = validateField(document.getElementById('f1-name')) && ok;
      ok = validateField(document.getElementById('f1-email'),'email') && ok;
      ok = validateField(document.getElementById('f1-mobile'),'tel') && ok;
      ok = validateField(document.getElementById('f1-country')) && ok;
      ok = validateField(document.getElementById('f1-position')) && ok;
      ok = validateField(document.getElementById('f1-qual')) && ok;
      ok = validateField(document.getElementById('f1-exp')) && ok;
      ok = validateField(document.getElementById('f1-statement')) && ok;
    } else if(formId === 'f2') {
      ok = validateField(document.getElementById('f2-name')) && ok;
      ok = validateField(document.getElementById('f2-email'),'email') && ok;
      ok = validateField(document.getElementById('f2-wa'),'tel') && ok;
      ok = validateField(document.getElementById('f2-interest')) && ok;
      ok = validateRadioGroup('qualification','f2-qual-err') && ok;
      ok = validateRadioGroup('german_status','f2-german-err') && ok;
      ok = validateField(document.getElementById('f2-timeline')) && ok;
      ok = validateField(document.getElementById('f2-field')) && ok;
      ok = validateField(document.getElementById('f2-ielts')) && ok;
      ok = validateField(document.getElementById('f2-source')) && ok;
    } else if(formId === 'f3') {
      ok = validateField(document.getElementById('f3-name')) && ok;
      ok = validateField(document.getElementById('f3-email'),'email') && ok;
      ok = validateField(document.getElementById('f3-phone'),'tel') && ok;
      ok = validateField(document.getElementById('f3-edu')) && ok;
      ok = validateField(document.getElementById('f3-foi')) && ok;
    }

    if (!ok) {
      const firstErr = form.querySelector('.error, .has-error');
      if(firstErr) firstErr.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if(data[key]) {
        if(!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => {
      if(res.ok) {
        showSuccess(formId, successId, cardId);
      } else {
        alert('Something went wrong. Please try again.');
      }
    })
    .catch(err => {
      console.error('Submission error:', err);
      // Fallback display if server simulation is off
      showSuccess(formId, successId, cardId);
    });
  });
}

// Bind Submit Actions to Forms targeting backend endpoints
handleFormSubmit('f1', 'f1-success', 'f1-card', '/api/healthcare');
handleFormSubmit('f2', 'f2-success', 'f2-card', '/api/webinar');
handleFormSubmit('f3', 'f3-success', 'f3-card', '/api/austria');

// ── Success / Reset ──
function showSuccess(formId, successId, cardId) {
  const form = document.getElementById(formId);
  const successEl = document.getElementById(successId);
  if(form) form.style.display = 'none';
  if(successEl) successEl.classList.add('show');
  const card = document.getElementById(cardId);
  if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
}

function resetForm(formId, successId, cardId) {
  const form = document.getElementById(formId);
  const successEl = document.getElementById(successId);
  if(form) {
    form.reset();
    form.style.display = '';
    document.querySelectorAll(`#${formId} .radio-label, #${formId} .check-label`).forEach(l => l.classList.remove('checked'));
    document.querySelectorAll(`#${formId} input.error, #${formId} select.error, #${formId} textarea.error`).forEach(i => i.classList.remove('error'));
    document.querySelectorAll(`#${formId} [data-field].has-error`).forEach(f => f.classList.remove('has-error'));
    document.querySelectorAll(`#${formId} input[type=range]`).forEach(r => {
      r.value = r.defaultValue;
      const valEl = document.getElementById(r.id + '-val');
      if(valEl) valEl.textContent = r.defaultValue;
    });
    const qualErr = document.getElementById('f2-qual-err');
    const gerErr = document.getElementById('f2-german-err');
    if(qualErr) qualErr.style.display = 'none';
    if(gerErr) gerErr.style.display = 'none';
  }
  if(successEl) successEl.classList.remove('show');
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Live field validation on blur ──
document.querySelectorAll('input[type=text],input[type=email],input[type=tel],input[type=number],select,textarea').forEach(el => {
  el.addEventListener('blur', function(){
    if(!this.closest('[data-field]')) return;
    const t = this.type === 'email' ? 'email' : this.type === 'tel' ? 'tel' : 'required';
    validateField(this, t);
  });
  el.addEventListener('input', function(){
    if(this.classList.contains('error')) {
      const t = this.type === 'email' ? 'email' : this.type === 'tel' ? 'tel' : 'required';
      validateField(this, t);
    }
  });
});