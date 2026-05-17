import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';

export default function FoodSelector({ onClose, onFoodSelected, foods, isPremium, isLoading }) {
  const { searchFoods } = useFoodStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingSize, setServingSize] = useState(1);
  const [searchResults, setSearchResults] = useState(foods);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(foods);
      return;
    }
    try {
      const results = await searchFoods(foods[0]?.school_id, query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setServingSize(1);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onFoodSelected(selectedFood.id, servingSize);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-light-gray">
          <h2 className="text-2xl font-poppins font-bold text-dark-gray">
            {selectedFood ? 'Confirm Food' : 'Select Food'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-light-gray rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedFood ? (
            <>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left p-4 rounded-lg border border-light-gray hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <h3 className="font-semibold text-dark-gray">{food.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{food.category}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{food.calories} cal</span>
                        {isPremium && (
                          <>
                            <span>P: {food.protein}g</span>
                            <span>C: {food.carbohydrates}g</span>
                            <span>F: {food.fat}g</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-8">No foods found</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-dark-gray mb-2">{selectedFood.name}</h3>
                <p className="text-gray-600 mb-4">{selectedFood.category}</p>
                <div className="bg-light-gray rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="text-2xl font-poppins font-bold text-primary">
                        {Math.round(selectedFood.calories * servingSize)}
                      </p>
                    </div>
                    {isPremium && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Protein</p>
                          <p className="text-lg font-semibold">{(selectedFood.protein * servingSize).toFixed(1)}g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Carbs</p>
                          <p className="text-lg font-semibold">{(selectedFood.carbohydrates * servingSize).toFixed(1)}g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fat</p>
                          <p className="text-lg font-semibold">{(selectedFood.fat * servingSize).toFixed(1)}g</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    Serving Size: {servingSize}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={servingSize}
                    onChange={(e) => setServingSize(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="border-t border-light-gray p-6 flex gap-3">
          <button
            onClick={() => (selectedFood ? setSelectedFood(null) : onClose())}
            className="btn-secondary flex-1"
          >
            {selectedFood ? 'Back' : 'Cancel'}
          </button>
          {selectedFood && (
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Food'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}