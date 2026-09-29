const express = require('express');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { wrap, httpError, photoFilter, serializePhoto, deleteUserCascade } = require('../lib/utils');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get(
  '/stats',
  wrap(async (_req, res) => {
    const [users, photos, fav] = await Promise.all([
      User.countDocuments(),
      Photo.countDocuments(),
      Photo.aggregate([{ $group: { _id: null, n: { $sum: { $size: '$favoritedBy' } } } }]),
    ]);
    res.json({ users, photos, favorites: fav[0] ? fav[0].n : 0 });
  })
);

// Every photo in the system, with owner and who favorited it (?q=, ?favorites=true)
router.get(
  '/photos',
  wrap(async (req, res) => {
    const photos = await Photo.find(photoFilter(req.query))
      .sort({ createdAt: -1 })
      .populate('owner', 'email')
      .populate('favoritedBy', 'email');
    res.json({ photos: photos.map((p) => serializePhoto(p, req.user._id, { admin: true })) });
  })
);

router.get(
  '/users',
  wrap(async (_req, res) => {
    const [users, counts] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Photo.aggregate([{ $group: { _id: '$owner', n: { $sum: 1 } } }]),
    ]);
    const byOwner = new Map(counts.map((c) => [String(c._id), c.n]));
    res.json({ users: users.map((u) => ({ ...u.toJSON(), photoCount: byOwner.get(String(u._id)) || 0 })) });
  })
);

router.patch(
  '/users/:id/role',
  wrap(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) throw httpError(400, 'Role must be "user" or "admin"');
    if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot change your own role');
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw httpError(404, 'User not found');
    res.json({ user });
  })
);

router.delete(
  '/users/:id',
  wrap(async (req, res) => {
    if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot delete your own account');
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, 'User not found');
    await deleteUserCascade(user._id);
    res.status(204).end();
  })
);

module.exports = router;
