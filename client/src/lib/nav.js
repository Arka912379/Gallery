import { Heart, Images, LayoutDashboard, Plus, User, Users } from 'lucide-react';

export const USER_NAV = [
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/add-photo', label: 'Add Photo', icon: Plus },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/profile', label: 'Profile', icon: User },
];

export const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/photos', label: 'Photos', icon: Images },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/favorites', label: 'Favorites', icon: Heart },
];
