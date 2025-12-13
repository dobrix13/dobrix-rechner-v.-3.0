import React, { useEffect, useState } from "react";
import ClockIcon from "../utils/clockIcon";

interface CallToActionBlockProps {
  user: { name: string; organisation?: string; restaurant?: string; userId?: string; restaurantId?: string };
  dayName: string;
  date: string;
  time: string;
  onAbrechnungClick?: (existingData?: TodayAbrechnung) => void;
  onStatistikClick?: () => void;
}

interface TodayAbrechnung {
  _id: string;
  totalSales: number;
  teamTipsPaid: number;
  privatTips: number;
  salesInCash: number;
  finalAmountInCash: number;
}

const CallToActionBlock: React.FC<CallToActionBlockProps> = ({ user, dayName, date, time, onAbrechnungClick, onStatistikClick }) => {
  const [todayAbrechnung, setTodayAbrechnung] = useState<TodayAbrechnung | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAbrechnung = async () => {
      if (!user.userId || !user.restaurantId) {
        setLoading(false);
        return;
      }

      try {
        // Calculate geschäfts_tag using the same logic as backend:
        // If before 06:00 UTC, use previous day at midnight UTC
        // If 06:00 UTC or later, use current day at midnight UTC
        const now = new Date();
        const hours = now.getUTCHours();
        
        const businessDay = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0, 0, 0, 0
        ));
        
        // If before 06:00 UTC, subtract one day
        if (hours < 6) {
          businessDay.setUTCDate(businessDay.getUTCDate() - 1);
        }
        
        const res = await fetch(
          `/api/abrechnungen?restaurantId=${user.restaurantId}&geschaefts_tag=${businessDay.toISOString()}`
        );
        
        if (res.ok) {
          const data = await res.json();
          // Find today's abrechnung for this user
          const userAbrechnung = data.find((ab: any) => ab.userId === user.userId);
          if (userAbrechnung) {
            setTodayAbrechnung({
              _id: userAbrechnung._id,
              totalSales: userAbrechnung.totalSales || 0,
              teamTipsPaid: userAbrechnung.teamTipsPaid || 0,
              privatTips: userAbrechnung.privatTips || 0,
              salesInCash: userAbrechnung.salesInCash || 0,
              finalAmountInCash: userAbrechnung.finalAmountInCash || 0,
            });
          }
        }
      } catch (error: any) {
        console.error("Error fetching today's abrechnung:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAbrechnung();
  }, [user.userId, user.restaurantId]);

  return (
  <div className="relative w-full flex items-center justify-center py-0 z-10">
    {/* Transparent background - no gradient */}
    <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
    </div>
    {/* Stack info and CTA blocks vertically */}
    <div className="flex flex-col w-full max-w-[600px] px-0">
      {/* Info block (top part, rounded top corners, 20px height) */}
      <div
        className="px-4 flex items-center w-full"
        style={{
          height: "auto",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          border: "2px solid rgba(0,255,247,0.18)",
          background: "rgba(30, 40, 60, 0.45)",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "none",
          fontSize: "0.85rem",
        }}
      >
        <div className="flex flex-col flex-1">
          <span className="text-cyan-200 whitespace-nowrap">
            {user.organisation ? user.organisation : "Organisation nicht gefunden"}
          </span>
          <span className="text-cyan-300 whitespace-nowrap text-xs mt-1">
            {user.restaurant ? user.restaurant : "Restaurant nicht gefunden"}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-cyan-100 whitespace-nowrap text-center font-medium">
            {date}
          </span>
        </div>
        <div className="flex items-center justify-end flex-1">
          <ClockIcon className="text-cyan-300" />
        </div>
      </div>
      {/* Glass panel CTA block (bottom part, rounded bottom corners) */}
      <div
        className="flex flex-col items-center px-8 py-8"
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
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg animate-slide-in-1 mb-4">
          Hallo, {user.name}!
        </h2>
        
        {loading ? (
          <div className="text-cyan-200 text-center py-4">Laden...</div>
        ) : todayAbrechnung ? (
          <>
            <div className="text-cyan-200 text-center mb-6 space-y-3 w-full px-4">
              <p className="text-base leading-relaxed">
                Du bist heute schon abgerechnet.
              </p>
              <div className="bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 space-y-2 max-w-lg mx-auto">
                <div className="flex justify-between">
                  <span className="text-cyan-300">Dein Umsatz:</span>
                  <span className="text-cyan-100 font-semibold">
                    {todayAbrechnung.totalSales.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-300">Team-Trinkgeld ausgezahlt:</span>
                  <span className="text-cyan-100 font-semibold">
                    {todayAbrechnung.teamTipsPaid.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-cyan-400/30 pt-2">
                  <span className="text-cyan-300">Für dich übrig geblieben:</span>
                  <span className="text-cyan-100 font-bold text-lg">
                    {todayAbrechnung.privatTips.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4 w-full justify-center mt-2">
              <button
                className="px-6 py-3 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/25 text-cyan-100 font-semibold text-base hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200 backdrop-blur-sm"
                onClick={() => onAbrechnungClick && onAbrechnungClick(todayAbrechnung)}
              >
                Abrechnung ansehen
              </button>
              <button
                className="px-6 py-3 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/25 text-cyan-100 font-semibold text-base hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200 backdrop-blur-sm"
                onClick={onStatistikClick}
              >
                Statistik
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-cyan-200 text-center mb-8 text-base leading-relaxed max-w-md">
              Ich hoffe, du hast eine gute Schicht gehabt!<br />
              Möchtest du jetzt abrechnen oder deine Statistik anschauen?
            </p>
            <div className="flex flex-row gap-6 w-full justify-center">
              <button
                className="px-8 py-3 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/25 text-cyan-100 font-semibold text-lg hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200 backdrop-blur-sm animate-slide-in-2"
                style={{ animationDelay: "0.2s" }}
                onClick={() => onAbrechnungClick && onAbrechnungClick()}
              >
                Abrechnung
              </button>
              <button
                className="px-8 py-3 rounded-lg border-2 border-cyan-400/40 bg-cyan-900/25 text-cyan-100 font-semibold text-lg hover:bg-cyan-800/40 hover:border-cyan-400/60 transition-all duration-200 backdrop-blur-sm animate-slide-in-3"
                style={{ animationDelay: "0.4s" }}
                onClick={onStatistikClick}
              >
                Statistik
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
};

export default CallToActionBlock;
