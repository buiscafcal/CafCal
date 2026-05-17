export default function CalorieRing({ calories, goal, percentage }) {
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-64 h-64 flex-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#F5F5F5" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#00A86B"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex-center flex-col">
        <div className="calorie-counter">{Math.round(calories)}</div>
        <p className="text-gray-600 text-sm">of {goal} cal</p>
        <p className="text-gray-500 text-xs mt-2">{Math.round(percentage)}%</p>
      </div>
    </div>
  );
}