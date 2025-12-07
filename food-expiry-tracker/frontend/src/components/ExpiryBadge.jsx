import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function ExpiryBadge({ expiryDate }) {
  const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

  let icon, text, color;

  if (daysUntilExpiry < 0) {
    icon = AlertCircle;
    text = 'Expired';
    color = 'bg-red-100 text-red-700 border-red-300';
  } else if (daysUntilExpiry === 0) {
    icon = AlertTriangle;
    text = 'Expires Today';
    color = 'bg-orange-100 text-orange-700 border-orange-300';
  } else if (daysUntilExpiry === 1) {
    icon = AlertTriangle;
    text = 'Expires Tomorrow';
    color = 'bg-orange-100 text-orange-700 border-orange-300';
  } else if (daysUntilExpiry <= 3) {
    icon = AlertTriangle;
    text = `${daysUntilExpiry} days left`;
    color = 'bg-yellow-100 text-yellow-700 border-yellow-300';
  } else {
    icon = CheckCircle;
    text = `${daysUntilExpiry} days left`;
    color = 'bg-green-100 text-green-700 border-green-300';
  }

  const Icon = icon;

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
}
