const STORAGE_KEY = 'photo_album_photos';
const MAX_IMAGE_PX = 1200; // canvas 압축 최대 크기

// --- Elements ---
const gallery = document.getElementById('gallery');
const emptyMsg = document.getElementById('empty-msg');

const addModal = document.getElementById('add-modal');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const photoUrlInput = document.getElementById('photo-url');
const photoTitleInput = document.getElementById('photo-title');
const photoDescInput = document.getElementById('photo-desc');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewWrap = document.getElementById('preview-wrap');
const previewImg = document.getElementById('preview-img');
const previewRemove = document.getElementById('preview-remove');

const confirmModal = document.getElementById('confirm-modal');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmDelete = document.getElementById('confirm-delete');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxDate = document.getElementById('lightbox-date');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
const lightboxClose = document.getElementById('lightbox-close');

// --- State ---
let pendingDeleteIndex = null;
let uploadedDataUrl = null;
let activeTab = 'upload';

// --- Storage ---
function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {
    alert('저장 공간이 부족합니다. 일부 사진을 삭제한 후 다시 시도해 주세요.');
  }
}

// --- Render Gallery ---
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
      <img src="${escapeAttr(photo.url)}" alt="${escapeAttr(photo.title)}"
           onerror="this.src='https://placehold.co/600x400?text=Image+Not+Found'" />
      <div class="photo-card-info">
        <h3>${escapeHtml(photo.title)}</h3>
        <p>${escapeHtml(photo.desc || '')}</p>
      </div>
      <button class="delete-btn" title="삭제">&times;</button>
    `;

    card.querySelector('img').addEventListener('click', () => openLightbox(photo));
    card.querySelector('.photo-card-info').addEventListener('click', () => openLightbox(photo));
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openConfirm(index);
    });

    gallery.appendChild(card);
  });
}

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-upload').classList.toggle('hidden', activeTab !== 'upload');
    document.getElementById('tab-url').classList.toggle('hidden', activeTab !== 'url');
  });
});

// --- File Upload ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

previewRemove.addEventListener('click', () => {
  uploadedDataUrl = null;
  fileInput.value = '';
  previewImg.src = '';
  previewWrap.classList.add('hidden');
  dropZone.classList.remove('hidden');
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    compressImage(e.target.result, (compressed) => {
      uploadedDataUrl = compressed;
      previewImg.src = compressed;
      dropZone.classList.add('hidden');
      previewWrap.classList.remove('hidden');

      // 파일명에서 제목 자동 입력
      if (!photoTitleInput.value) {
        photoTitleInput.value = file.name.replace(/\.[^.]+$/, '');
      }
    });
  };
  reader.readAsDataURL(file);
}

function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    let { width, height } = img;
    if (width > MAX_IMAGE_PX || height > MAX_IMAGE_PX) {
      const ratio = Math.min(MAX_IMAGE_PX / width, MAX_IMAGE_PX / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', 0.82));
  };
  img.src = dataUrl;
}

// --- Add Modal ---
addBtn.addEventListener('click', () => {
  clearForm();
  addModal.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => addModal.classList.add('hidden'));

addModal.addEventListener('click', (e) => {
  if (e.target === addModal) addModal.classList.add('hidden');
});

saveBtn.addEventListener('click', () => {
  const title = photoTitleInput.value.trim() || 'Untitled';
  const desc = photoDescInput.value.trim();
  let url = '';

  if (activeTab === 'upload') {
    if (!uploadedDataUrl) {
      dropZone.style.borderColor = '#ef4444';
      setTimeout(() => dropZone.style.borderColor = '', 1500);
      return;
    }
    url = uploadedDataUrl;
  } else {
    url = photoUrlInput.value.trim();
    if (!url) {
      photoUrlInput.style.borderColor = '#ef4444';
      photoUrlInput.focus();
      setTimeout(() => photoUrlInput.style.borderColor = '', 1500);
      return;
    }
  }

  const photos = loadPhotos();
  photos.unshift({ url, title, desc, addedAt: new Date().toISOString() });
  savePhotos(photos);
  addModal.classList.add('hidden');
  renderGallery();
});

function clearForm() {
  uploadedDataUrl = null;
  fileInput.value = '';
  previewImg.src = '';
  previewWrap.classList.add('hidden');
  dropZone.classList.remove('hidden');
  dropZone.style.borderColor = '';
  photoUrlInput.value = '';
  photoUrlInput.style.borderColor = '';
  photoTitleInput.value = '';
  photoDescInput.value = '';

  // 업로드 탭으로 초기화
  activeTab = 'upload';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="upload"]').classList.add('active');
  document.getElementById('tab-upload').classList.remove('hidden');
  document.getElementById('tab-url').classList.add('hidden');
}

// --- Delete Confirm ---
function openConfirm(index) {
  pendingDeleteIndex = index;
  confirmModal.classList.remove('hidden');
}

confirmCancel.addEventListener('click', () => {
  pendingDeleteIndex = null;
  confirmModal.classList.add('hidden');
});

confirmDelete.addEventListener('click', () => {
  if (pendingDeleteIndex !== null) {
    const photos = loadPhotos();
    photos.splice(pendingDeleteIndex, 1);
    savePhotos(photos);
    pendingDeleteIndex = null;
    confirmModal.classList.add('hidden');
    renderGallery();
  }
});

confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    pendingDeleteIndex = null;
    confirmModal.classList.add('hidden');
  }
});

// --- Lightbox ---
function openLightbox(photo) {
  lightboxImg.src = photo.url;
  lightboxImg.alt = photo.title;
  lightboxTitle.textContent = photo.title;
  lightboxDesc.textContent = photo.desc || '';
  lightboxDate.textContent = photo.addedAt
    ? new Date(photo.addedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
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
    confirmModal.classList.add('hidden');
  }
});

// --- Utility ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- Init ---
renderGallery();
