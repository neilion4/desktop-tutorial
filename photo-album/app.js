const STORAGE_KEY = 'photo_album_photos';

const gallery = document.getElementById('gallery');
const emptyMsg = document.getElementById('empty-msg');

// Add modal elements
const addModal = document.getElementById('add-modal');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const photoUrlInput = document.getElementById('photo-url');
const photoTitleInput = document.getElementById('photo-title');
const photoDescInput = document.getElementById('photo-desc');

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
const lightboxClose = document.getElementById('lightbox-close');

// --- State ---
function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

// --- Render ---
function renderGallery() {
  const photos = loadPhotos();
  gallery.innerHTML = '';

  if (photos.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `
      <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.title)}" onerror="this.src='https://placehold.co/600x400?text=Image+Not+Found'" />
      <div class="photo-card-info">
        <h3>${escapeHtml(photo.title)}</h3>
        <p>${escapeHtml(photo.desc || '')}</p>
      </div>
      <button class="delete-btn" data-index="${index}" title="Delete">&times;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) return;
      openLightbox(photo);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deletePhoto(index);
    });

    gallery.appendChild(card);
  });
}

// --- Add Photo ---
addBtn.addEventListener('click', () => {
  clearForm();
  addModal.classList.remove('hidden');
  photoUrlInput.focus();
});

cancelBtn.addEventListener('click', () => {
  addModal.classList.add('hidden');
});

saveBtn.addEventListener('click', () => {
  const url = photoUrlInput.value.trim();
  const title = photoTitleInput.value.trim() || 'Untitled';
  const desc = photoDescInput.value.trim();

  if (!url) {
    photoUrlInput.focus();
    photoUrlInput.style.borderColor = '#ef4444';
    return;
  }

  photoUrlInput.style.borderColor = '';

  const photos = loadPhotos();
  photos.push({ url, title, desc, addedAt: new Date().toISOString() });
  savePhotos(photos);
  addModal.classList.add('hidden');
  renderGallery();
});

// Close modal when clicking outside
addModal.addEventListener('click', (e) => {
  if (e.target === addModal) {
    addModal.classList.add('hidden');
  }
});

// Allow Enter key to save
photoUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveBtn.click();
});

function clearForm() {
  photoUrlInput.value = '';
  photoTitleInput.value = '';
  photoDescInput.value = '';
  photoUrlInput.style.borderColor = '';
}

// --- Delete Photo ---
function deletePhoto(index) {
  const photos = loadPhotos();
  photos.splice(index, 1);
  savePhotos(photos);
  renderGallery();
}

// --- Lightbox ---
function openLightbox(photo) {
  lightboxImg.src = photo.url;
  lightboxImg.alt = photo.title;
  lightboxTitle.textContent = photo.title;
  lightboxDesc.textContent = photo.desc || '';
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

lightboxCloseBtn.addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    addModal.classList.add('hidden');
  }
});

// --- Utility ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// --- Init ---
renderGallery();
