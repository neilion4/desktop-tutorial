const addModal = document.getElementById('add-modal');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
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

let pendingDeleteId = null;

// --- 추가 모달 ---
addBtn.addEventListener('click', () => {
  clearForm();
  addModal.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => addModal.classList.add('hidden'));

addModal.addEventListener('click', (e) => {
  if (e.target === addModal) addModal.classList.add('hidden');
});

// --- 파일 업로드 ---
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
  if (file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    showPreview(file);
  }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) showPreview(fileInput.files[0]);
});

previewRemove.addEventListener('click', () => {
  fileInput.value = '';
  previewImg.src = '';
  previewWrap.classList.add('hidden');
  dropZone.classList.remove('hidden');
});

function showPreview(file) {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    dropZone.classList.add('hidden');
    previewWrap.classList.remove('hidden');
    const titleInput = document.getElementById('photo-title');
    if (!titleInput.value) {
      titleInput.value = file.name.replace(/\.[^.]+$/, '');
    }
  };
  reader.readAsDataURL(file);
}

function clearForm() {
  fileInput.value = '';
  previewImg.src = '';
  previewWrap.classList.add('hidden');
  dropZone.classList.remove('hidden');
  document.getElementById('photo-title').value = '';
  document.getElementById('photo-desc').value = '';
}

// --- 삭제 ---
document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    pendingDeleteId = btn.dataset.id;
    confirmModal.classList.remove('hidden');
  });
});

confirmCancel.addEventListener('click', () => {
  pendingDeleteId = null;
  confirmModal.classList.add('hidden');
});

confirmDelete.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    const res = await fetch(`/photos/${pendingDeleteId}`, { method: 'DELETE' });
    if (res.ok) {
      confirmModal.classList.add('hidden');
      location.reload();
    }
  } catch {
    alert('삭제 중 오류가 발생했습니다.');
  }
});

confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    pendingDeleteId = null;
    confirmModal.classList.add('hidden');
  }
});

// --- 라이트박스 ---
document.querySelectorAll('.photo-card').forEach(card => {
  card.querySelector('img').addEventListener('click', () => openLightbox(card));
  card.querySelector('.photo-card-info').addEventListener('click', () => openLightbox(card));
});

function openLightbox(card) {
  lightboxImg.src = card.dataset.src;
  lightboxImg.alt = card.dataset.title;
  lightboxTitle.textContent = card.dataset.title;
  lightboxDesc.textContent = card.dataset.desc || '';
  lightboxDate.textContent = card.dataset.date || '';
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
