const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'photos');
const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const IMAGE_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

// Lets async route handlers throw; Express 4 needs the rejection forwarded to next().
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const httpError = (status, message) => Object.assign(new Error(message), { status });

const removeFileAt = (dir, name) => (name ? fs.promises.unlink(path.join(dir, name)).catch(() => {}) : Promise.resolve());
const removePhotoFile = (name) => removeFileAt(UPLOAD_DIR, name);
const removeAvatarFile = (name) => removeFileAt(AVATAR_DIR, name);

// A single-file image upload middleware factory, shared by photo uploads and avatar uploads.
function makeImageUpload(dir) {
  return multer({
    storage: multer.diskStorage({
      destination: dir,
      // Random server-chosen names: the client's filename is never used on disk.
      filename: (_req, file, cb) => cb(null, crypto.randomUUID() + IMAGE_EXT[file.mimetype]),
    }),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) =>
      IMAGE_EXT[file.mimetype] ? cb(null, true) : cb(httpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed')),
  });
}

// Checks the file's magic bytes so a renamed .exe can't pass as an image.
async function isRealImage(dir, filename, mime) {
  const handle = await fs.promises.open(path.join(dir, filename), 'r');
  try {
    const buf = Buffer.alloc(12);
    await handle.read(buf, 0, 12, 0);
    if (mime === 'image/jpeg') return buf.toString('hex', 0, 3) === 'ffd8ff';
    if (mime === 'image/png') return buf.toString('hex', 0, 4) === '89504e47';
    if (mime === 'image/gif') return buf.toString('ascii', 0, 4) === 'GIF8';
    if (mime === 'image/webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    return false;
  } finally {
    await handle.close();
  }
}

// Builds a Mongo filter from ?q= and ?favorites=true.
function photoFilter(query, base = {}, viewerId) {
  const filter = { ...base };
  const q = String(query.q || '').trim().slice(0, 60);
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { category: rx }];
  }
  if (query.favorites === 'true') {
    filter.favoritedBy = viewerId ? viewerId : { $not: { $size: 0 } };
  }
  return filter;
}

function serializePhoto(photo, viewerId, { admin = false } = {}) {
  const favs = photo.favoritedBy || [];
  const ownerDoc = photo.owner && photo.owner.email ? photo.owner : null;
  const out = {
    id: photo.id,
    title: photo.title,
    category: photo.category,
    date: photo.date,
    createdAt: photo.createdAt,
    url: `/api/photos/${photo.id}/file`,
    ownerId: String(ownerDoc ? ownerDoc._id : photo.owner),
    isFavorite: favs.some((f) => String(f._id || f) === String(viewerId)),
    favoritesCount: favs.length,
  };
  if (admin) {
    out.owner = ownerDoc ? ownerDoc.email : null;
    out.favoritedBy = favs.filter((f) => f.email).map((f) => f.email);
  }
  return out;
}

// Removes a user together with their photos (and files) and their favorites on other photos.
async function deleteUserCascade(userId) {
  const [photos, user] = await Promise.all([Photo.find({ owner: userId }).select('filename'), User.findById(userId)]);
  await Promise.all(photos.map((p) => removePhotoFile(p.filename)));
  if (user && user.avatarFilename) await removeAvatarFile(user.avatarFilename);
  await Photo.deleteMany({ owner: userId });
  await Photo.updateMany({ favoritedBy: userId }, { $pull: { favoritedBy: userId } });
  await User.deleteOne({ _id: userId });
}

module.exports = {
  UPLOAD_DIR,
  AVATAR_DIR,
  wrap,
  httpError,
  removePhotoFile,
  removeAvatarFile,
  makeImageUpload,
  isRealImage,
  photoFilter,
  serializePhoto,
  deleteUserCascade,
};
