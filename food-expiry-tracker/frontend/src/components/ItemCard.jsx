import { Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ExpiryBadge from './ExpiryBadge';
import { formatDate, formatCurrency } from '../utils/auth';

export default function ItemCard({ item, onConsume, onDelete }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-lg">{item.name}</h3>
          <p className="text-sm text-neutral-600">
            {item.quantity} {item.unit}
          </p>
        </div>
        <ExpiryBadge expiryDate={item.expiryDate} />
      </div>

      <div className="space-y-2 mb-4 text-sm text-neutral-600">
        {item.price && (
          <p>
            Price: <span className="font-medium text-neutral-900">{formatCurrency(item.price)}</span>
          </p>
        )}
        <p>
          Added: <span className="font-medium">{formatDate(item.createdAt)}</span>
        </p>
        <p>
          Expires: <span className="font-medium">{formatDate(item.expiryDate)}</span>
        </p>
      </div>

      {item.notes && (
        <p className="text-sm text-neutral-600 bg-neutral-50 rounded p-2 mb-4">
          {item.notes}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onConsume(item._id)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark Used
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}
