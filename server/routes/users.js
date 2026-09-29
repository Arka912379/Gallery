const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { requireAuth, clearToken } = require('../middleware/auth');
const {
  AVATAR_DIR,
  wrap,
  httpError,
  removeAvatarFile,
  makeImageUpload,
  isRealImage,
  deleteUserCascade,
} = require('../lib/utils');

const router = express.Router();
const avatarUpload = makeImageUpload(AVATAR_DIR);

router.use(requireAuth);

// Any signed-in user can view any avatar (low sensitivity, needed for admin's user list and gallery UI).
router.get(
  '/:id/avatar/file',
  wrap(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatarFilename) throw httpError(404, 'No avatar set');
    res.set('Cache-Control', 'private, max-age=86400');
    res.sendFile(path.join(AVATAR_DIR, user.avatarFilename));
  })
);

router.put(
  '/me/avatar',
  avatarUpload.single('avatar'),
  wrap(async (req, res) => {
    if (!req.file) throw httpError(400, 'Choose an image to upload');
    try {
      if (!(await isRealImage(AVATAR_DIR, req.file.filename, req.file.mimetype))) {
        throw httpError(400, 'That file is not a valid image');
      }
      const old = req.user.avatarFilename;
      req.user.avatarFilename = req.file.filename;
      await req.user.save();
      if (old) await removeAvatarFile(old);
      res.json({ user: req.user });
    } catch (err) {
      await removeAvatarFile(req.file.filename);
      throw err;
    }
  })
);

router.delete(
  '/me/avatar',
  wrap(async (req, res) => {
    const old = req.user.avatarFilename;
    req.user.avatarFilename = null;
    await req.user.save();
    if (old) await removeAvatarFile(old);
    res.json({ user: req.user });
  })
);

// Current user's profile with photo / favorite counts
router.get(
  '/me',
  wrap(async (req, res) => {
    const [photos, favorites] = await Promise.all([
      Photo.countDocuments({ owner: req.user._id }),
      Photo.countDocuments({ owner: req.user._id, favoritedBy: req.user._id }),
    ]);
    res.json({ user: req.user, stats: { photos, favorites } });
  })
);

router.put(
  '/me',
  wrap(async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (name.length > 60) throw httpError(400, 'Name must be 60 characters or fewer');
    req.user.name = name;
    await req.user.save();
    res.json({ user: req.user });
  })
);

router.put(
  '/me/password',
  wrap(async (req, res) => {
    const { currentPassword = '', newPassword = '' } = req.body;
    if (String(newPassword).length < 6) throw httpError(400, 'New password must be at least 6 characters');
    const user = await User.findById(req.user._id).select('+password');
    if (!(await bcrypt.compare(String(currentPassword), user.password))) {
      throw httpError(400, 'Current password is incorrect');
    }
    user.password = await bcrypt.hash(String(newPassword), 12);
    await user.save();
    res.json({ message: 'Password updated' });
  })
);

router.delete(
  '/me',
  wrap(async (req, res) => {
    if (req.user.role === 'admin') throw httpError(403, 'Administrator accounts cannot be deleted here');
    const user = await User.findById(req.user._id).select('+password');
    if (!(await bcrypt.compare(String(req.body.password || ''), user.password))) {
      throw httpError(400, 'Password is incorrect');
    }
    await deleteUserCascade(user._id);
    clearToken(res);
    res.status(204).end();
  })
);

module.exports = router;
