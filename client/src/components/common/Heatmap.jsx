import React, { useMemo } from 'react';

export const Heatmap = ({ activityData = [], weeksCount = 24 }) => {
  // activityData: array of { date: 'YYYY-MM-DD', minutes: number, count: number }
  const activityMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(activityData)) {
      activityData.forEach((item) => {
        if (item && item.date) {
          map.set(item.date, item);
        }
      });
    }
    return map;
  }, [activityData]);

  // Generate grid for the past `weeksCount` weeks ending today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // End on current week's Sunday/Saturday
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const daysToGenerate = weeksCount * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToGenerate + (6 - dayOfWeek));

    const weeksList = [];
    const months = [];
    let currentWeek = [];
    let lastMonth = -1;

    for (let i = 0; i < daysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth();

      // Check if we should track a month label
      if (month !== lastMonth && d.getDate() <= 7) {
        months.push({
          weekIndex: Math.floor(i / 7),
          name: d.toLocaleString('default', { month: 'short' }),
        });
        lastMonth = month;
      }

      const activity = activityMap.get(dateStr);
      const minutes = activity ? activity.minutes : 0;
      const count = activity ? activity.count : 0;

      // Determine level
      let level = 0;
      if (minutes > 0 || count > 0) {
        if (minutes >= 180 || count >= 4) level = 4;
        else if (minutes >= 120 || count >= 3) level = 3;
        else if (minutes >= 60 || count >= 2) level = 2;
        else level = 1;
      }

      currentWeek.push({
        date: dateStr,
        dayName: d.toLocaleDateString('default', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('default', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        minutes,
        count,
        level,
        isFuture: d > today,
      });

      if (currentWeek.length === 7) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: weeksList, monthLabels: months };
  }, [activityMap, weeksCount]);

  const levelColors = {
    0: 'bg-[#EAE2D3] border-[#E3D5BD]',
    1: 'bg-[#C6D4C0] border-[#B2C4AB]',
    2: 'bg-[#8DA885] border-[#799471]',
    3: 'bg-[#53734B] border-[#435F3C]',
    4: 'bg-[#263524] border-[#1B271A] shadow-sm',
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[620px]">
        {/* Months header */}
        <div className="flex text-[11px] text-[#6E7167] font-mono mb-2 pl-7 gap-1">
          {monthLabels.map((m, idx) => (
            <div
              key={idx}
              style={{
                marginLeft: idx === 0 ? `${m.weekIndex * 15}px` : undefined,
                width: '60px',
              }}
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1.5 items-start">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1.5 text-[10px] text-[#6E7167] font-mono pr-2 select-none">
            <span className="h-3 leading-3">Mon</span>
            <span className="h-3 leading-3 opacity-0">Tue</span>
            <span className="h-3 leading-3">Wed</span>
            <span className="h-3 leading-3 opacity-0">Thu</span>
            <span className="h-3 leading-3">Fri</span>
            <span className="h-3 leading-3 opacity-0">Sat</span>
            <span className="h-3 leading-3">Sun</span>
          </div>

          {/* Weeks columns */}
          <div className="flex gap-1.5 flex-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const title = `${day.minutes} min active on ${day.formattedDate}`;
                  return (
                    <div
                      key={day.date}
                      title={title}
                      className={`w-3 h-3 rounded-[3px] border transition-transform duration-100 hover:scale-125 cursor-pointer ${
                        day.isFuture
                          ? 'opacity-30 bg-[#EAE2D3] border-transparent cursor-not-allowed'
                          : levelColors[day.level]
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-xs text-[#6E7167] font-mono mt-4">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={`w-3 h-3 rounded-[3px] border ${levelColors[0]}`} />
            <div className={`w-3 h-3 rounded-[3px] border ${levelColors[1]}`} />
            <div className={`w-3 h-3 rounded-[3px] border ${levelColors[2]}`} />
            <div className={`w-3 h-3 rounded-[3px] border ${levelColors[3]}`} />
            <div className={`w-3 h-3 rounded-[3px] border ${levelColors[4]}`} />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
