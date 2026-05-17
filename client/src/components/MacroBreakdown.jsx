export default function MacroBreakdown({ tracking }) {
  const macros = [
    { name: 'Protein', value: Math.round(tracking.totalProtein), unit: 'g', goal: 50, color: '#FF8C42' },
    { name: 'Carbs', value: Math.round(tracking.totalCarbs), unit: 'g', goal: 300, color: '#00A86B' },
    { name: 'Fat', value: Math.round(tracking.totalFat), unit: 'g', goal: 65, color: '#98FF98' },
    { name: 'Fiber', value: Math.round(tracking.totalFiber), unit: 'g', goal: 25, color: '#333333' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {macros.map((macro) => {
        const percentage = Math.min((macro.value / macro.goal) * 100, 100);
        const circumference = 2 * Math.PI * 35;
        return (
          <div key={macro.name} className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4 flex-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#F5F5F5" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke={macro.color}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (percentage / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-poppins font-bold text-lg">{macro.value}</p>
                <p className="text-xs text-gray-600">{macro.unit}</p>
              </div>
            </div>
            <p className="font-semibold text-dark-gray">{macro.name}</p>
            <p className="text-xs text-gray-600">Goal: {macro.goal}{macro.unit}</p>
          </div>
        );
      })}
    </div>
  );
}