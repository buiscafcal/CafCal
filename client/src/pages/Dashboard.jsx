import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTrackingStore } from '../store/trackingStore';
import { useFoodStore } from '../store/foodStore';
import { usePremiumStore } from '../store/premiumStore';
import { format } from 'date-fns';
import { LogOut, Plus } from 'lucide-react';
import CalorieRing from '../components/CalorieRing';
import MacroBreakdown from '../components/MacroBreakdown';
import FoodLog from '../components/FoodLog';
import FoodSelector from '../components/FoodSelector';
import AdBanner from '../components/AdBanner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { dailyTracking, fetchDailyTracking, logFood, removeFood, isLoading } = useTrackingStore();
  const { foods, fetchFoods } = useFoodStore();
  const { isPremium, checkPremiumStatus } = usePremiumStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showFoodSelector, setShowFoodSelector] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkPremiumStatus();
    if (user.schoolId) {
      fetchFoods(user.schoolId);
      fetchDailyTracking(selectedDate);
    }
  }, [user, selectedDate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRemoveFood = async (logId) => {
    if (window.confirm('Remove this food from your log?')) {
      try {
        await removeFood(logId, selectedDate);
      } catch (error) {
        console.error('Failed to remove food:', error);
      }
    }
  };

  if (!user) return null;

  const calorieGoal = 2000;
  const caloriePercentage = dailyTracking
    ? Math.min((dailyTracking.totalCalories / calorieGoal) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-light-gray">
      {!isPremium && <AdBanner />}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-poppins font-bold text-primary">CafCal</h1>
            <p className="text-sm text-gray-600">Welcome, {user.username}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="input-field max-w-xs"
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex-center">
          <CalorieRing
            calories={dailyTracking?.totalCalories || 0}
            goal={calorieGoal}
            percentage={caloriePercentage}
          />
        </div>
        {isPremium && dailyTracking && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-poppins font-bold text-dark-gray mb-6">Macro Breakdown</h2>
            <MacroBreakdown tracking={dailyTracking} />
          </div>
        )}
        <div className="mb-8">
          <button
            onClick={() => setShowFoodSelector(true)}
            className="btn-primary flex items-center gap-2 w-full justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Food
          </button>
        </div>
        {dailyTracking && dailyTracking.foodLogs.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-light-gray">
              <h2 className="text-xl font-poppins font-bold text-dark-gray">
                Today's Log ({dailyTracking.foodLogs.length} items)
              </h2>
            </div>
            <div className="divide-y divide-light-gray">
              {dailyTracking.foodLogs.map((log) => (
                <FoodLog key={log.id} log={log} isPremium={isPremium} onRemove={() => handleRemoveFood(log.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No foods logged yet</p>
            <button onClick={() => setShowFoodSelector(true)} className="btn-primary">
              Add your first meal
            </button>
          </div>
        )}
      </main>
      {showFoodSelector && (
        <FoodSelector
          onClose={() => setShowFoodSelector(false)}
          onFoodSelected={async (foodId, servingSize) => {
            await logFood(foodId, 'lunch', servingSize, selectedDate);
            setShowFoodSelector(false);
          }}
          foods={foods}
          isPremium={isPremium}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}