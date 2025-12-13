import React, { useEffect, useState } from "react";

interface WaiterStatistikProps {
  user: {
    userId?: string;
    restaurantId?: string;
    name: string;
  };
  onClose?: () => void;
}

interface AbrechnungData {
  _id: string;
  totalSales: number;
  teamTipsPaid: number;
  privatTips: number;
  salesInCash: number;
  date: string;
  geschaefts_tag: string;
  station?: string;
}

interface DayStats {
  day: string;
  totalSales: number;
  totalTips: number;
  privateTips: number;
  privateTipPercentage: number;
  tipPercentage: number;
  count: number;
}

type TimeRange = "week" | "month" | "day";

const WaiterStatistik: React.FC<WaiterStatistikProps> = ({ user, onClose }) => {
  const [abrechnungen, setAbrechnungen] = useState<AbrechnungData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchAbrechnungen();
  }, [timeRange, selectedDate, user.userId, user.restaurantId]);

  const fetchAbrechnungen = async () => {
    if (!user.userId || !user.restaurantId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/abrechnungen?restaurantId=${user.restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        // Filter for current user only
        const userAbrechnungen = data.filter((ab: any) => ab.userId === user.userId);
        setAbrechnungen(userAbrechnungen);
      }
    } catch (error: any) {
      console.error("Error fetching abrechnungen:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (): AbrechnungData[] => {
    const now = new Date(selectedDate);
    return abrechnungen.filter((ab) => {
      const abDate = new Date(ab.geschaefts_tag || ab.date);
      
      if (timeRange === "day") {
        return abDate.toISOString().split("T")[0] === selectedDate;
      } else if (timeRange === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return abDate >= weekStart && abDate < weekEnd;
      } else if (timeRange === "month") {
        return (
          abDate.getMonth() === now.getMonth() &&
          abDate.getFullYear() === now.getFullYear()
        );
      }
      return false;
    });
  };

  const getWeekdayStats = (): DayStats[] => {
    const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    const stats: { [key: string]: { totalSales: number; totalTips: number; privateTips: number; count: number } } = {};

    const filteredData = getFilteredData();

    filteredData.forEach((ab) => {
      const date = new Date(ab.geschaefts_tag || ab.date);
      const dayIndex = date.getDay();
      const dayName = weekdays[dayIndex];

      if (!stats[dayName]) {
        stats[dayName] = { totalSales: 0, totalTips: 0, privateTips: 0, count: 0 };
      }

      stats[dayName].totalSales += ab.totalSales;
      stats[dayName].totalTips += ab.privatTips + ab.teamTipsPaid;
      stats[dayName].privateTips = (stats[dayName].privateTips || 0) + ab.privatTips;
      stats[dayName].count += 1;
    });

    return weekdays.map((day) => {
      const data = stats[day] || { totalSales: 0, totalTips: 0, privateTips: 0, count: 0 };
      return {
        day,
        totalSales: data.totalSales,
        totalTips: data.totalTips,
        privateTips: data.privateTips,
        privateTipPercentage: data.totalSales > 0 ? (data.privateTips / data.totalSales) * 100 : 0,
        tipPercentage: data.totalSales > 0 ? (data.totalTips / data.totalSales) * 100 : 0,
        count: data.count,
      };
    });
  };

  const getTotalStats = () => {
    const filteredData = getFilteredData();
    const totalSales = filteredData.reduce((sum, ab) => sum + ab.totalSales, 0);
    const totalTips = filteredData.reduce((sum, ab) => sum + ab.privatTips + ab.teamTipsPaid, 0);
    const privateTips = filteredData.reduce((sum, ab) => sum + ab.privatTips, 0);
    const avgTipPercentage = totalSales > 0 ? (totalTips / totalSales) * 100 : 0;
    const privateTipPercentage = totalSales > 0 ? (privateTips / totalSales) * 100 : 0;

    return { totalSales, totalTips, privateTips, avgTipPercentage, privateTipPercentage, count: filteredData.length };
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    // Sort by date
    const sortedData = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.geschaefts_tag || a.date);
      const dateB = new Date(b.geschaefts_tag || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Group by date
    const groupedByDate: { [key: string]: { totalSales: number; privateTips: number; count: number } } = {};
    sortedData.forEach(ab => {
      const date = new Date(ab.geschaefts_tag || ab.date);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { totalSales: 0, privateTips: 0, count: 0 };
      }
      
      groupedByDate[dateKey].totalSales += ab.totalSales;
      groupedByDate[dateKey].privateTips += ab.privatTips;
      groupedByDate[dateKey].count += 1;
    });

    // Convert to chart data array
    return Object.entries(groupedByDate).map(([dateKey, data]) => {
      const date = new Date(dateKey);
      const label = timeRange === 'day' 
        ? date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      
      return {
        label,
        value: data.totalSales,
        tips: data.privateTips,
        tipPercent: data.totalSales > 0 ? (data.privateTips / data.totalSales) * 100 : 0,
        date: dateKey,
      };
    });
  };

  const weekdayStats = getWeekdayStats();
  const totalStats = getTotalStats();
  const maxValue = Math.max(...weekdayStats.map((s) => s.totalSales), 1);

  return (
    <div className="relative w-full flex items-center justify-center py-0 z-10">
      <div className="flex flex-col w-full max-w-[600px] px-0">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between w-full"
          style={{
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            border: "2px solid rgba(0,255,247,0.18)",
            background: "rgba(30, 40, 60, 0.45)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "none",
          }}
        >
          <h2 className="text-xl font-bold text-cyan-100">Statistik - {user.name}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-cyan-300 hover:text-cyan-100 text-2xl transition-colors"
              aria-label="Schließen"
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="flex flex-col px-6 py-6 space-y-6"
          style={{
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            border: "2px solid rgba(0,255,247,0.18)",
            borderTop: "none",
            background: "rgba(30, 40, 60, 0.35)",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Time Range Selector */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTimeRange("day")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === "day"
                  ? "bg-cyan-500/40 text-cyan-100 border-2 border-cyan-400/60"
                  : "bg-cyan-900/20 text-cyan-300 border-2 border-cyan-400/30 hover:border-cyan-400/50"
              }`}
            >
              Tag
            </button>
            <button
              onClick={() => setTimeRange("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === "week"
                  ? "bg-cyan-500/40 text-cyan-100 border-2 border-cyan-400/60"
                  : "bg-cyan-900/20 text-cyan-300 border-2 border-cyan-400/30 hover:border-cyan-400/50"
              }`}
            >
              Woche
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === "month"
                  ? "bg-cyan-500/40 text-cyan-100 border-2 border-cyan-400/60"
                  : "bg-cyan-900/20 text-cyan-300 border-2 border-cyan-400/30 hover:border-cyan-400/50"
              }`}
            >
              Monat
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex justify-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-cyan-900/30 border-2 border-cyan-400/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
            />
          </div>

          {loading ? (
            <div className="text-cyan-200 text-center py-8">Laden...</div>
          ) : (
            <>
              {/* Total Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
                  <div className="text-cyan-300 text-sm mb-1">Gesamtumsatz</div>
                  <div className="text-cyan-100 text-2xl font-bold">
                    {totalStats.totalSales.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </div>
                  <div className="text-cyan-400 text-xs mt-1">{totalStats.count} Schichten</div>
                </div>
                <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
                  <div className="text-cyan-300 text-sm mb-1">Verdientes Trinkgeld</div>
                  <div className="text-cyan-100 text-2xl font-bold">
                    {totalStats.privateTips.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </div>
                  <div className="text-cyan-400 text-xs mt-1">
                    ⌀ {totalStats.privateTipPercentage.toFixed(1)}% vom Umsatz
                  </div>
                </div>
              </div>

              {/* Weekday Statistics */}
              {timeRange !== "day" && (
                <div className="space-y-3">
                  <h3 className="text-cyan-100 font-semibold text-lg">Statistik nach Wochentag</h3>
                  {weekdayStats.map((stat) => (
                    <div key={stat.day} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-300">{stat.day}</span>
                        <span className="text-cyan-200">
                          {stat.totalSales.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          {stat.count > 0 && (
                            <span className="text-green-400 text-xs ml-2">
                              +{stat.privateTips.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} ({stat.privateTipPercentage.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                      {/* Bar Chart */}
                      <div className="relative h-6 bg-cyan-900/20 rounded-full overflow-hidden border border-cyan-400/20">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/60 to-cyan-400/80 transition-all duration-500"
                          style={{ width: `${(stat.totalSales / maxValue) * 100}%` }}
                        />
                        {stat.count > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium drop-shadow-lg">
                            {stat.count} Schicht{stat.count !== 1 ? "en" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Time Series Chart - Performance Over Time */}
              <div className="space-y-3">
                <h3 className="text-cyan-100 font-semibold text-lg">Leistungsverlauf</h3>
                <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
                  {(() => {
                    const chartData = getChartData();
                    if (chartData.length === 0) {
                      return <div className="text-cyan-300 text-center py-4">Keine Daten verfügbar</div>;
                    }

                    const maxSales = Math.max(...chartData.map(d => d.value), ...chartData.map(d => d.tips), 1);
                    const minSales = Math.min(...chartData.map(d => d.value), ...chartData.map(d => d.tips), 0);
                    const range = maxSales - minSales || 1;
                    
                    // Tip percentage scale (right Y-axis)
                    const maxTipPercent = Math.max(...chartData.map(d => d.tipPercent), 10);
                    const minTipPercent = Math.min(...chartData.map(d => d.tipPercent), 0);
                    const tipPercentRange = maxTipPercent - minTipPercent || 1;

                    return (
                      <div className="space-y-2">
                        {/* Chart Area */}
                        <div className="relative h-48 w-full">
                          {/* Y-axis labels (left - Euro) */}
                          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-cyan-400 pr-2">
                            <span>{maxSales.toFixed(0)}€</span>
                            <span>{(maxSales * 0.75 + minSales * 0.25).toFixed(0)}€</span>
                            <span>{(maxSales * 0.5 + minSales * 0.5).toFixed(0)}€</span>
                            <span>{(maxSales * 0.25 + minSales * 0.75).toFixed(0)}€</span>
                            <span>{minSales.toFixed(0)}€</span>
                          </div>

                          {/* Y-axis labels (right - Percentage) */}
                          <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-amber-400 pl-2">
                            <span>{maxTipPercent.toFixed(1)}%</span>
                            <span>{(maxTipPercent * 0.75 + minTipPercent * 0.25).toFixed(1)}%</span>
                            <span>{(maxTipPercent * 0.5 + minTipPercent * 0.5).toFixed(1)}%</span>
                            <span>{(maxTipPercent * 0.25 + minTipPercent * 0.75).toFixed(1)}%</span>
                            <span>{minTipPercent.toFixed(1)}%</span>
                          </div>

                          {/* Chart SVG */}
                          <svg className="absolute left-12 right-12 top-0 bottom-0 w-[calc(100%-6rem)] h-full">
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => {
                              const yPos = (i * 25) + '%';
                              return (
                                <line
                                  key={i}
                                  x1="0"
                                  y1={yPos}
                                  x2="100%"
                                  y2={yPos}
                                  stroke="rgba(0, 255, 247, 0.1)"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            {/* Area under the line */}
                            <defs>
                              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                                <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                              </linearGradient>
                              <linearGradient id="tipsAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
                                <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                              </linearGradient>
                            </defs>
                            
                            {/* Sales Area */}
                            <path
                              d={
                                chartData.length > 0
                                  ? 'M 0 ' + (192 - ((chartData[0].value - minSales) / range) * 192) + ' ' +
                                    chartData.map((d, i) => {
                                      const x = (i / (chartData.length - 1 || 1)) * 100;
                                      const y = 192 - ((d.value - minSales) / range) * 192;
                                      return 'L ' + x + '% ' + y;
                                    }).join(' ') +
                                    ' L 100% 192 L 0 192 Z'
                                  : ''
                              }
                              fill="url(#areaGradient)"
                            />

                            {/* Tips Area */}
                            <path
                              d={
                                chartData.length > 0
                                  ? 'M 0 ' + (192 - ((chartData[0].tips - minSales) / range) * 192) + ' ' +
                                    chartData.map((d, i) => {
                                      const x = (i / (chartData.length - 1 || 1)) * 100;
                                      const y = 192 - ((d.tips - minSales) / range) * 192;
                                      return 'L ' + x + '% ' + y;
                                    }).join(' ') +
                                    ' L 100% 192 L 0 192 Z'
                                  : ''
                              }
                              fill="url(#tipsAreaGradient)"
                            />

                            {/* Sales Line chart (thicker 3px) */}
                            <polyline
                              fill="none"
                              stroke="rgb(34, 211, 238)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1 || 1)) * 100;
                                const y = 100 - ((d.value - minSales) / range) * 100;
                                return x + '%,' + y + '%';
                              }).join(' ')}
                            />

                            {/* Tips Line chart (thicker 3px) */}
                            <polyline
                              fill="none"
                              stroke="rgb(34, 197, 94)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1 || 1)) * 100;
                                const y = 100 - ((d.tips - minSales) / range) * 100;
                                return x + '%,' + y + '%';
                              }).join(' ')}
                            />

                            {/* Tip Percentage Line chart (2px) */}
                            <polyline
                              fill="none"
                              stroke="rgb(251, 191, 36)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1 || 1)) * 100;
                                const y = 100 - ((d.tipPercent - minTipPercent) / tipPercentRange) * 100;
                                return x + '%,' + y + '%';
                              }).join(' ')}
                            />

                            {/* Sales Data points */}
                            {chartData.map((d, i) => {
                              const x = (i / (chartData.length - 1 || 1)) * 100;
                              const y = 100 - ((d.value - minSales) / range) * 100;
                              const xPos = x + '%';
                              const yPos = y + '%';
                              return (
                                <g key={`sales-${i}`}>
                                  <circle
                                    cx={xPos}
                                    cy={yPos}
                                    r="4"
                                    fill="rgb(34, 211, 238)"
                                    stroke="rgb(30, 40, 60)"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all cursor-pointer"
                                  />
                                  <title>{d.label + ': Umsatz ' + d.value.toFixed(2) + '€'}</title>
                                </g>
                              );
                            })}

                            {/* Tips Data points */}
                            {chartData.map((d, i) => {
                              const x = (i / (chartData.length - 1 || 1)) * 100;
                              const y = 100 - ((d.tips - minSales) / range) * 100;
                              const xPos = `${x}%`;
                              const yPos = `${y}%`;
                              return (
                                <g key={`tips-${i}`}>
                                  <circle
                                    cx={xPos}
                                    cy={yPos}
                                    r="4"
                                    fill="rgb(34, 197, 94)"
                                    stroke="rgb(30, 40, 60)"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all cursor-pointer"
                                  />
                                  <title>{d.label + ': Trinkgeld ' + d.tips.toFixed(2) + '€ (' + d.tipPercent.toFixed(1) + '%)'}</title>
                                </g>
                              );
                            })}

                            {/* Tip Percentage Data points */}
                            {chartData.map((d, i) => {
                              const x = (i / (chartData.length - 1 || 1)) * 100;
                              const y = 100 - ((d.tipPercent - minTipPercent) / tipPercentRange) * 100;
                              const xPos = `${x}%`;
                              const yPos = `${y}%`;
                              return (
                                <g key={`percent-${i}`}>
                                  <circle
                                    cx={xPos}
                                    cy={yPos}
                                    r="3"
                                    fill="rgb(251, 191, 36)"
                                    stroke="rgb(30, 40, 60)"
                                    strokeWidth="1.5"
                                    className="hover:r-5 transition-all cursor-pointer"
                                  />
                                  <title>{d.label + ': ' + d.tipPercent.toFixed(1) + '% Trinkgeld-Anteil'}</title>
                                </g>
                              );
                            })}
                          </svg>
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-xs text-cyan-400 pl-12 pr-12">
                          {chartData.length > 0 && (
                            <>
                              <span>{chartData[0].label}</span>
                              {chartData.length > 2 && (
                                <span>{chartData[Math.floor(chartData.length / 2)].label}</span>
                              )}
                              <span>{chartData[chartData.length - 1].label}</span>
                            </>
                          )}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-4 pt-2 text-xs flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <span className="text-cyan-300">Umsatz</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-cyan-300">Privates Trinkgeld</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <span className="text-cyan-300">Trinkgeld %</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Day View - Show individual abrechnungen */}
              {timeRange === "day" && (
                <div className="space-y-3">
                  <h3 className="text-cyan-100 font-semibold text-lg">Abrechnungen am {selectedDate}</h3>
                  {getFilteredData().length === 0 ? (
                    <div className="text-cyan-300 text-center py-4">Keine Abrechnungen für diesen Tag</div>
                  ) : (
                    getFilteredData().map((ab) => (
                      <div
                        key={ab._id}
                        className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between">
                          <span className="text-cyan-300">Umsatz:</span>
                          <span className="text-cyan-100 font-semibold">
                            {ab.totalSales.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-300">Privates Trinkgeld:</span>
                          <span className="text-cyan-100 font-semibold">
                            {ab.privatTips.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-300">Team-Trinkgeld:</span>
                          <span className="text-cyan-100 font-semibold">
                            {ab.teamTipsPaid.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-cyan-400/30 pt-2">
                          <span className="text-cyan-300">Trinkgeld-Anteil:</span>
                          <span className="text-cyan-100 font-bold">
                            {(((ab.privatTips + ab.teamTipsPaid) / ab.totalSales) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterStatistik;
