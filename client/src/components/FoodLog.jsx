import { Trash2 } from 'lucide-react';

export default function FoodLog({ log, isPremium, onRemove }) {
  const getCalorieStatus = (calories) => {
    if (calories < 100) return 'good';
    if (calories < 300) return 'moderate';
    return 'high';
  };

  const status = getCalorieStatus(log.caloriesConsumed);

  return (
    <div className="food-card">
      <div className="flex-1">
        <h3 className="font-semibold text-dark-gray">{log.name}</h3>
        <p className="text-xs text-gray-600 mt-1">{log.category}</p>
        {isPremium && (
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span>P: {Math.round(log.proteinConsumed)}g</span>
            <span>C: {Math.round(log.carbsConsumed)}g</span>
            <span>F: {Math.round(log.fatConsumed)}g</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`status-badge ${status}`}>{log.caloriesConsumed} cal</p>
          {log.servingSize !== 1 && (
            <p className="text-xs text-gray-600 mt-1">{log.servingSize}x serving</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
          title="Remove food"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}