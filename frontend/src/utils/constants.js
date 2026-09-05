export const JOB_CATEGORIES = [
  { label: 'Cleaning', icon: '🧹', value: 'Cleaning' },
  { label: 'Security Guard', icon: '💂', value: 'Security Guard' },
  { label: 'Driver', icon: '🚗', value: 'Driver' },
  { label: 'Labor / Helper', icon: '🔨', value: 'Labor' },
  { label: 'Cook', icon: '🍳', value: 'Cook' },
  { label: 'Electrician', icon: '⚡', value: 'Electrician' },
  { label: 'Plumber', icon: '🔧', value: 'Plumber' },
  { label: 'Gardener', icon: '🌿', value: 'Gardener' },
  { label: 'Delivery', icon: '📦', value: 'Delivery' },
  { label: 'Carpenter', icon: '🪚', value: 'Carpenter' },
  { label: 'Painter', icon: '🎨', value: 'Painter' },
  { label: 'Peon / Office Boy', icon: '🏢', value: 'Peon' },
  { label: 'Watchman', icon: '👁️', value: 'Watchman' },
  { label: 'Nurse / Caretaker', icon: '🏥', value: 'Caretaker' },
  { label: 'Other', icon: '💼', value: 'Other' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

export const LANGUAGES = [
  'Hindi','English','Marathi','Gujarati','Bengali','Tamil','Telugu',
  'Kannada','Malayalam','Odia','Punjabi','Urdu','Assamese','Other',
];

export const DURATION_OPTIONS = [
  { label: '1 Day', value: 1 },
  { label: '3 Days', value: 3 },
  { label: '7 Days (1 Week)', value: 7 },
  { label: '15 Days', value: 15 },
  { label: '30 Days (1 Month)', value: 30 },
  { label: '90 Days (3 Months)', value: 90 },
  { label: '180 Days (6 Months)', value: 180 },
  { label: '365 Days (1 Year)', value: 365 },
];

export const STATUS_BADGE = {
  open: 'badge-success',
  assigned: 'badge-info',
  completed: 'badge-secondary',
  cancelled: 'badge-danger',
  pending: 'badge-warning',
  accepted: 'badge-success',
  rejected: 'badge-danger',
  busy: 'badge-warning',
  available: 'badge-success',
  offline: 'badge-secondary',
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
