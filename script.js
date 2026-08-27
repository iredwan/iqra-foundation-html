/* =========================================================
   ইক্বরা ইসলামিক মাদরাসা (IIM) — Scalable JS Script
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initTabs();
  initRevealOnScroll();
  initRefererCapture();
  initRegistrationId();
  initFormValidation();
});

/* ---------------- Footer year ---------------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------- Tab navigation with URL Shareable Link Sync ---------------- */
function initTabs() {
  const tabButtons = document.querySelectorAll("[data-tab]");
  const targetButtons = document.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll(".tab-panel");

  function activateTab(tabId, updateHash = true) {
    if (!tabId) return;
    
    // Toggle active state on panels
    panels.forEach(p => p.classList.toggle("active", p.id === tabId));
    
    // Toggle active state on buttons
    tabButtons.forEach(b => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Update Browser Hash for Link Sharing
    if (updateHash && history.pushState) {
      history.pushState(null, null, `#${tabId}`);
    }

    // Scroll to view
    const mainWrap = document.querySelector("main");
    if (mainWrap) {
      const y = mainWrap.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    requestAnimationFrame(checkRevealNow);
  }

  // Click Handlers
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  targetButtons.forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tabTarget));
  });

  const topbarCta = document.getElementById("topbarCta");
  if (topbarCta) topbarCta.addEventListener("click", () => activateTab("registration"));

  // Check URL Hash on Load for Direct Shared Links
  const currentHash = window.location.hash.replace("#", "");
  if (currentHash && document.getElementById(currentHash)) {
    activateTab(currentHash, false);
  }

  // Handle Browser Back/Forward buttons
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "") || "course";
    if (document.getElementById(hash)) {
      activateTab(hash, false);
    }
  });
}

/* ---------------- Reveal on scroll ---------------- */
let revealObserver;
function initRevealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in-view"));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(i => revealObserver.observe(i));
}

function checkRevealNow() {
  document.querySelectorAll(".tab-panel.active .reveal:not(.in-view)").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add("in-view");
  });
}

/* ---------------- Registration ID (hidden, auto-generated) ---------------- */
function generateRegistrationId() {
  const timePart = Date.now().toString().slice(-7);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `IIM-02-${timePart}${randomPart}`;
}

function initRegistrationId() {
  const hiddenField = document.getElementById("registrationId");
  if (!hiddenField) return;
  hiddenField.value = generateRegistrationId();
}

/* ---------------- Referer capture (hidden field) ---------------- */
function initRefererCapture() {
  const hiddenField = document.getElementById("referer");
  if (!hiddenField) return;
  const params = new URLSearchParams(window.location.search);
  const refValue = params.get("ref") || params.get("referer") || params.get("referrer") || "";
  hiddenField.value = refValue;
}

/* ---------------- Validation helpers ---------------- */
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;
const FACEBOOK_URL_REGEX = /^(https?:\/\/)?(www\.)?(m\.)?facebook\.com\/[A-Za-z0-9._\-\/]+\/?$/i;

function normalizeDigits(value) {
  const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
  let normalized = value.replace(/[০-৯]/g, match => bnToEnMap[match]);
  return normalized.replace(/[\s-]/g, "");
}

function setError(inputEl, msgEl, message) {
  if (msgEl) msgEl.textContent = message || "";
  if (!inputEl) return;
  inputEl.classList.toggle("is-invalid", !!message);
  inputEl.classList.toggle("is-valid", !message && inputEl.value.trim() !== "");
}

function validateFullName() {
  const input = document.getElementById("fullName");
  const err = document.getElementById("err-fullName");
  if (!input) return true;
  const val = input.value.trim();
  if (val.length < 3) {
    setError(input, err, "অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)।");
    return false;
  }
  if (val.length > 100) {
    setError(input, err, "নামটি অনেক বড় — অনুগ্রহ করে সংক্ষিপ্ত করুন।");
    return false;
  }
  setError(input, err, "");
  return true;
}

function validatePhone() {
  const input = document.getElementById("phone");
  const err = document.getElementById("err-phone");
  if (!input) return true;
  const val = normalizeDigits(input.value.trim());
  if (!val) {
    setError(input, err, "ফোন নাম্বার আবশ্যক।");
    return false;
  }
  if (!BD_PHONE_REGEX.test(val)) {
    setError(input, err, "সঠিক বাংলাদেশী ফোন নাম্বার দিন (যেমনঃ 01XXXXXXXXX)।");
    return false;
  }
  setError(input, err, "");
  return true;
}

function validateWhatsapp({ silent = false } = {}) {
  const input = document.getElementById("whatsapp");
  const err = document.getElementById("err-whatsapp");
  if (!input) return true;
  const val = normalizeDigits(input.value.trim());
  if (!val) {
    setError(input, err, "");
    return true;
  }
  if (!BD_PHONE_REGEX.test(val)) {
    if (!silent) setError(input, err, "সঠিক WhatsApp নাম্বার দিন (যেমনঃ 01XXXXXXXXX)।");
    return false;
  }
  setError(input, err, "");
  return true;
}

function validateFacebook({ silent = false } = {}) {
  const input = document.getElementById("facebook");
  const err = document.getElementById("err-facebook");
  if (!input) return true;
  const val = input.value.trim();
  if (!val) {
    setError(input, err, "");
    return true;
  }
  if (!FACEBOOK_URL_REGEX.test(val)) {
    if (!silent) setError(input, err, "শুধুমাত্র সঠিক Facebook প্রোফাইল/আইডির লিংক দিন (facebook.com/...)।");
    return false;
  }
  setError(input, err, "");
  return true;
}

function validateContactRequirement() {
  const whatsappEl = document.getElementById("whatsapp");
  const facebookEl = document.getElementById("facebook");
  if (!whatsappEl || !facebookEl) return true;
  
  const whatsapp = whatsappEl.value.trim();
  const facebook = facebookEl.value.trim();
  const hint = document.getElementById("contactHint");
  const ok = whatsapp !== "" || facebook !== "";
  
  if (hint) {
    hint.classList.toggle("border-danger", !ok);
    hint.classList.toggle("text-danger", !ok);
  }
  return ok;
}

function validateInstitution() {
  const radios = document.querySelectorAll('input[name="entry.1660800759"]');
  const err = document.getElementById("err-institution");
  if (!radios.length) return true;
  const checked = Array.from(radios).some(r => r.checked);
  if (err) err.textContent = checked ? "" : "অনুগ্রহ করে একটি অপশন নির্বাচন করুন।";
  return checked;
}

/* ---------------- Form Wiring ---------------- */
function initFormValidation() {
  const fullName = document.getElementById("fullName");
  const phone = document.getElementById("phone");
  const whatsapp = document.getElementById("whatsapp");
  const facebook = document.getElementById("facebook");
  const radios = document.querySelectorAll('input[name="entry.1660800759"]');

  if (fullName) fullName.addEventListener("blur", validateFullName);
  if (phone) phone.addEventListener("blur", validatePhone);
  if (whatsapp) {
    whatsapp.addEventListener("input", () => { validateWhatsapp({ silent: true }); validateContactRequirement(); });
    whatsapp.addEventListener("blur", () => { validateWhatsapp(); validateContactRequirement(); });
  }
  if (facebook) {
    facebook.addEventListener("input", () => { validateFacebook({ silent: true }); validateContactRequirement(); });
    facebook.addEventListener("blur", () => { validateFacebook(); validateContactRequirement(); });
  }
  radios.forEach(r => r.addEventListener("change", validateInstitution));

  // Connect Modular Form Submitter
  const forms = document.querySelectorAll(".custom-gform");
  forms.forEach(form => {
    form.addEventListener("submit", (e) => handleModularSubmit(e, form));
  });
}

/* ---------------- Modular Scalable Submit Handler ---------------- */
function handleModularSubmit(e, form) {
  // If it's the main regForm, trigger validation logic
  if (form.id === "regForm") {
    const isNameValid = validateFullName();
    const isPhoneValid = validatePhone();
    const isWhatsappValid = validateWhatsapp();
    const isFacebookValid = validateFacebook();
    const hasContact = validateContactRequirement();
    const isInstitutionValid = validateInstitution();

    if (!hasContact) {
      const err = document.getElementById("err-whatsapp");
      if (err) err.textContent = "WhatsApp নম্বর অথবা Facebook আইডি — যেকোনো একটি অবশ্যই দিতে হবে।";
    }

    const allValid = isNameValid && isPhoneValid && isWhatsappValid && isFacebookValid && hasContact && isInstitutionValid;

    if (!allValid) {
      e.preventDefault();
      const firstInvalid = form.querySelector(".is-invalid, .error-msg:not(:empty)");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const phoneInput = document.getElementById("phone");
    const whatsappInput = document.getElementById("whatsapp");
    if (phoneInput) phoneInput.value = normalizeDigits(phoneInput.value.trim());
    if (whatsappInput && whatsappInput.value.trim()) whatsappInput.value = normalizeDigits(whatsappInput.value.trim());
  }

  // Submit Feedback UI
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn?.querySelector(".btn-spinner");
  
  if (submitBtn) submitBtn.disabled = true;
  if (spinner) spinner.classList.remove("d-none");

  const registrationId = document.getElementById("registrationId")?.value.trim() || "";
  const successOverlayId = form.dataset.successId || "successOverlay";
  const iframe = document.getElementById("gform_iframe");

  const handleIframeLoad = () => {
    showSuccess(registrationId, successOverlayId);
    form.reset();
    form.querySelectorAll(".is-valid, .is-invalid").forEach(el => el.classList.remove("is-valid", "is-invalid"));
    initRegistrationId();

    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.classList.add("d-none");

    iframe.removeEventListener("load", handleIframeLoad);
  };

  if (iframe) iframe.addEventListener("load", handleIframeLoad);
}

/* ---------------- Success overlay ---------------- */
function showSuccess(registrationId, targetId = "successOverlay") {
  const overlay = document.getElementById(targetId);
  const idDisplay = document.getElementById("regIdDisplay");
  if (idDisplay) idDisplay.textContent = registrationId || "";
  if (overlay) overlay.classList.add("show");
  
  const closeBtn = document.getElementById("closeSuccess");
  const closeHandler = () => {
    if (overlay) overlay.classList.remove("show");
    if (closeBtn) closeBtn.removeEventListener("click", closeHandler);
  };
  if (closeBtn) closeBtn.addEventListener("click", closeHandler);
}