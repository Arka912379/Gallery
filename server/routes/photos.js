const path = require('path');
const express = require('express');
const Photo = require('../models/Photo');
const { CATEGORIES } = require('../models/Photo');
const { requireAuth } = require('../middleware/auth');
const {
  UPLOAD_DIR,
  wrap,
  httpError,
  removePhotoFile,
  makeImageUpload,
  isRealImage,
  photoFilter,
  serializePhoto,
} = require('../lib/utils');

const router = express.Router();
router.use(requireAuth);

const upload = makeImageUpload(UPLOAD_DIR);

// Loads a photo the current user may access: the owner, or an admin (unless ownerOnly).
async function loadPhoto(req, { ownerOnly = false } = {}) {
  const admin = req.user.role === 'admin';
  let query = Photo.findById(req.params.id);
  if (admin) query = query.populate('owner', 'email').populate('favoritedBy', 'email');
  const photo = await query;
  if (!photo) throw httpError(404, 'Photo not found');
  const isOwner = String(photo.owner._id || photo.owner) === String(req.user._id);
  if (!isOwner && !(admin && !ownerOnly)) throw httpError(404, 'Photo not found');
  return photo;
}

// List the current user's photos (?q= search, ?favorites=true)
router.get(
  '/',
  wrap(async (req, res) => {
    const filter = photoFilter(req.query, { owner: req.user._id }, req.user._id);
    const photos = await Photo.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ photos: photos.map((p) => serializePhoto(p, req.user._id)) });
  })
);

// Upload a photo
router.post(
  '/',
  upload.single('photo'),
  wrap(async (req, res) => {
    if (!req.file) throw httpError(400, 'Choose an image to upload');
    try {
      if (!(await isRealImage(UPLOAD_DIR, req.file.filename, req.file.mimetype))) {
        throw httpError(400, 'That file is not a valid image');
      }
      const title = String(req.body.title || '').trim();
      if (!title) throw httpError(400, 'Title is required');
      if (title.length > 100) throw httpError(400, 'Title must be 100 characters or fewer');
      const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'Other';
      const date = req.body.date ? new Date(req.body.date) : new Date();
      if (Number.isNaN(date.getTime())) throw httpError(400, 'Enter a valid date');

      const photo = await Photo.create({
        owner: req.user._id,
        title,
        category,
        date,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
      });
      res.status(201).json({ photo: serializePhoto(photo, req.user._id) });
    } catch (err) {
      await removePhotoFile(req.file.filename); // don't leave orphaned uploads behind
      throw err;
    }
  })
);

router.get(
  '/:id',
  wrap(async (req, res) => {
    const photo = await loadPhoto(req);
    res.json({ photo: serializePhoto(photo, req.user._id, { admin: req.user.role === 'admin' }) });
  })
);

// The image itself. Behind auth so only the owner or an admin can fetch it (the session cookie rides along with <img>).
router.get(
  '/:id/file',
  wrap(async (req, res) => {
    const photo = await loadPhoto(req);
    res.type(photo.mimeType);
    res.set('Cache-Control', 'private, max-age=86400');
    res.sendFile(path.join(UPLOAD_DIR, photo.filename));
  })
);

router.post(
  '/:id/favorite',
  wrap(async (req, res) => {
    const photo = await loadPhoto(req, { ownerOnly: true });
    await Photo.updateOne({ _id: photo._id }, { $addToSet: { favoritedBy: req.user._id } });
    res.json({ isFavorite: true });
  })
);

router.delete(
  '/:id/favorite',
  wrap(async (req, res) => {
    const photo = await loadPhoto(req, { ownerOnly: true });
    await Photo.updateOne({ _id: photo._id }, { $pull: { favoritedBy: req.user._id } });
    res.json({ isFavorite: false });
  })
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    const photo = await loadPhoto(req);
    await removePhotoFile(photo.filename);
    await photo.deleteOne();
    res.status(204).end();
  })
);

module.exports = router;
