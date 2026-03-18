import React from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';

/**
 * Icon component using Lucide React icons
 * Maps Material icon names to Lucide equivalents
 * @param {string} name - Icon name (e.g., 'restaurant', 'shopping_cart', 'close')
 * @param {string} className - Additional CSS classes
 * @param {number} size - Icon size in pixels (default: 24)
 */

// Map Material icon names to Lucide icon names
const iconMap = {
  // Navigation & UI
  'menu': 'Menu',
  'close': 'X',
  'arrow_back': 'ArrowLeft',
  'arrow_forward': 'ArrowRight',
  'arrow_drop_down': 'ChevronDown',
  'arrow_drop_up': 'ChevronUp',
  'expand_more': 'ChevronDown',
  'expand_less': 'ChevronUp',
  'chevron_right': 'ChevronRight',
  'chevron_left': 'ChevronLeft',

  // Actions
  'add': 'Plus',
  'remove': 'Minus',
  'edit': 'Edit',
  'delete': 'Trash2',
  'search': 'Search',
  'filter_list': 'Filter',
  'refresh': 'RefreshCw',
  'more_vert': 'MoreVertical',
  'more_horiz': 'MoreHorizontal',
  'settings': 'Settings',
  'tune': 'SlidersHorizontal',

  // Status
  'check': 'Check',
  'check_circle': 'CheckCircle',
  'error': 'AlertCircle',
  'warning': 'AlertTriangle',
  'info': 'Info',
  'cancel': 'XCircle',
  'done': 'Check',

  // Food & Restaurant
  'restaurant': 'Utensils',
  'restaurant_menu': 'MenuSquare',
  'local_dining': 'UtensilsCrossed',
  'fastfood': 'Pizza',
  'lunch_dining': 'Sandwich',
  'dinner_dining': 'ChefHat',
  'local_cafe': 'Coffee',
  'local_bar': 'Wine',

  // Shopping & Cart
  'shopping_cart': 'ShoppingCart',
  'shopping_bag': 'ShoppingBag',
  'add_shopping_cart': 'ShoppingCart',
  'store': 'Store',
  'storefront': 'Store',

  // Communication
  'notifications': 'Bell',
  'mail': 'Mail',
  'chat': 'MessageSquare',
  'phone': 'Phone',
  'call': 'Phone',

  // User & People
  'person': 'User',
  'people': 'Users',
  'account_circle': 'UserCircle',
  'group': 'Users',

  // Time & Date
  'schedule': 'Clock',
  'access_time': 'Clock',
  'timer': 'Timer',
  'today': 'Calendar',
  'event': 'Calendar',
  'date_range': 'CalendarDays',

  // Location
  'location_on': 'MapPin',
  'place': 'MapPin',
  'room': 'MapPin',
  'home': 'Home',
  'business': 'Building',

  // Media & Files
  'image': 'Image',
  'photo': 'Image',
  'attach_file': 'Paperclip',
  'download': 'Download',
  'upload': 'Upload',
  'cloud_upload': 'CloudUpload',

  // Money & Payment
  'payments': 'CreditCard',
  'payment': 'CreditCard',
  'account_balance_wallet': 'Wallet',
  'wallet': 'Wallet',
  'attach_money': 'DollarSign',
  'currency_rupee': 'IndianRupee',

  // Visibility
  'visibility': 'Eye',
  'visibility_off': 'EyeOff',

  // Rating
  'star': 'Star',
  'star_border': 'Star',
  'favorite': 'Heart',
  'favorite_border': 'Heart',

  // QR & Scan
  'qr_code': 'QrCode',
  'qr_code_scanner': 'ScanLine',
  'barcode_scanner': 'ScanBarcode',

  // Mobile & Device
  'phone_iphone': 'Smartphone',
  'smartphone': 'Smartphone',
  'tablet': 'Tablet',
  'computer': 'Monitor',
  'install_mobile': 'Smartphone',

  // Media Controls
  'play_circle': 'PlayCircle',
  'pause_circle': 'PauseCircle',
  'stop_circle': 'StopCircle',

  // Direction & Map
  'directions': 'Navigation',
  'my_location': 'Locate',
  'navigation': 'Navigation',

  // Business & Office
  'work': 'Briefcase',
  'business_center': 'Briefcase',
  'badge': 'BadgeCheck',
  'verified': 'BadgeCheck',

  // Security
  'lock': 'Lock',
  'lock_open': 'LockOpen',
  'security': 'Shield',
  'vpn_key': 'Key',

  // Misc
  'pending_actions': 'Clock',
  'hourglass_empty': 'Hourglass',
  'inbox': 'Inbox',
  'send': 'Send',
  'logout': 'LogOut',
  'login': 'LogIn',

  // Analytics & Stats
  'trending_up': 'TrendingUp',
  'trending_down': 'TrendingDown',
  'bar_chart': 'BarChart3',
  'pie_chart': 'PieChart',
  'show_chart': 'LineChart',

  // Support & Help
  'headphones': 'Headphones',
  'help': 'HelpCircle',
  'support_agent': 'Headphones',

  // Additional
  'zap': 'Zap',
  'bolt': 'Zap',
  'wifi_off': 'WifiOff',
  'history': 'History',
  'mark_email_read': 'MailCheck',
};

const Icon = ({
  name,
  className = '',
  size = 24,
  fill = 0,
  strokeWidth,
  ...props
}) => {
  // Get Lucide icon name from map
  const lucideIconName = iconMap[name] || name;

  // Get the icon component from Lucide
  const LucideIcon = LucideIcons[lucideIconName];

  // Fallback to a default icon if not found
  if (!LucideIcon) {
    console.warn(`Icon "${name}" (mapped to "${lucideIconName}") not found in Lucide icons`);
    return (
      <LucideIcons.Circle
        size={size}
        className={className}
        strokeWidth={strokeWidth || 2}
        fill={fill > 0 ? 'currentColor' : 'none'}
        {...props}
      />
    );
  }

  return (
    <LucideIcon
      size={size}
      className={className}
      strokeWidth={strokeWidth || 2}
      fill={fill > 0 ? 'currentColor' : 'none'}
      {...props}
    />
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.number,
  fill: PropTypes.number,
  strokeWidth: PropTypes.number,
};

export default Icon;
