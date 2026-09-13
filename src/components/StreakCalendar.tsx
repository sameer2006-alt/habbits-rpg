import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, Check } from "lucide-react";
import type { CalendarDayData, MonthViewData } from "../data/streakCalendar";
import { fetchMonthActivityRecords, generateMonthViewData } from "../lib/streakCalendarData";

interface StreakCalendarProps {
  userId: string;
  className?: string;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ userId, className = "" }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [monthData, setMonthData] = useState<MonthViewData | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchMonthActivityRecords(userId, year, month)
      .then((records) => {
        if (!isMounted) return;
        const data = generateMonthViewData(year, month, records);
        setMonthData(data);
        // Default select today if in this month
        const todayDay = data.days.find((d) => d.isToday);
        if (todayDay) setSelectedDay(todayDay);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, year, month]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div
      className={`panel-box streak-calendar-panel ${className}`}
      style={{
        border: "1px solid rgba(201, 168, 118, 0.3)",
        background: "linear-gradient(135deg, rgba(20, 24, 32, 0.95) 0%, rgba(12, 14, 18, 0.98) 100%)",
        borderRadius: "8px",
        padding: "16px",
        opacity: loading ? 0.7 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarIcon size={18} color="#c9a876" />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c9a876",
            }}
          >
            STREAK CALENDAR &amp; ACTIVITY LOG
          </span>
        </div>

        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handlePrevMonth}
            className="action-btn"
            style={{ padding: "4px 8px", background: "rgba(0,0,0,0.3)" }}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f2e9e9", minWidth: "120px", textAlign: "center" }}>
            {monthData?.monthLabel || "Loading..."}
          </span>
          <button
            onClick={handleNextMonth}
            className="action-btn"
            style={{ padding: "4px 8px", background: "rgba(0,0,0,0.3)" }}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Summary Badges */}
      {monthData && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "14px",
            fontSize: "0.75rem",
            color: "#8a6b70",
          }}
        >
          <span>Active Days: <strong style={{ color: "#22c55e" }}>{monthData.daysWithActivity}</strong></span>
          <span>Quests Done: <strong style={{ color: "#06b6d4" }}>{monthData.totalQuestsCompleted}</strong></span>
          <span>Perfect Days: <strong style={{ color: "#ffd700" }}>{monthData.totalPerfectDays}</strong></span>
        </div>
      )}

      {/* Weekday Labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280" }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
        }}
      >
        {monthData?.days.map((day, idx) => {
          if (day.status === "empty") {
            return <div key={`empty_${idx}`} style={{ height: "42px" }} />;
          }

          const isSelected = selectedDay?.date === day.date;
          let borderColor = "rgba(255, 255, 255, 0.08)";
          let bgColor = "rgba(0, 0, 0, 0.25)";
          let textColor = "#9ca3af";

          if (day.status === "perfect_day") {
            borderColor = "#ffd700";
            bgColor = "rgba(255, 215, 0, 0.12)";
            textColor = "#ffd700";
          } else if (day.status === "completed") {
            borderColor = "rgba(34, 197, 94, 0.6)";
            bgColor = "rgba(34, 197, 94, 0.1)";
            textColor = "#22c55e";
          } else if (day.status === "partial") {
            borderColor = "rgba(245, 158, 11, 0.5)";
            bgColor = "rgba(245, 158, 11, 0.08)";
            textColor = "#f59e0b";
          } else if (day.status === "missed") {
            borderColor = "rgba(230, 57, 70, 0.25)";
            textColor = "#6b7280";
          } else if (day.status === "future") {
            textColor = "#4b5563";
          }

          if (day.isToday) {
            borderColor = "#06b6d4";
          }

          if (isSelected) {
            bgColor = "rgba(201, 168, 118, 0.2)";
          }

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              style={{
                height: "44px",
                borderRadius: "5px",
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: day.status === "future" ? "default" : "pointer",
                padding: "2px",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: day.isToday ? 800 : 600 }}>
                {day.dayNumber}
              </span>
              {day.status === "perfect_day" && <Star size={9} color="#ffd700" style={{ marginTop: "2px" }} />}
              {day.status === "completed" && <Check size={9} color="#22c55e" style={{ marginTop: "2px" }} />}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && selectedDay.date && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            borderRadius: "6px",
            border: "1px solid rgba(201, 168, 118, 0.2)",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <strong style={{ color: "#f2e9e9" }}>{selectedDay.date} {selectedDay.isToday ? "(Today)" : ""}</strong>
            <span
              className="value-badge"
              style={{
                fontSize: "0.7rem",
                padding: "2px 6px",
                color:
                  selectedDay.status === "perfect_day"
                    ? "#ffd700"
                    : selectedDay.status === "completed"
                    ? "#22c55e"
                    : selectedDay.status === "partial"
                    ? "#f59e0b"
                    : "#8a6b70",
              }}
            >
              {selectedDay.status.toUpperCase().replace("_", " ")}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "#8a6b70", marginTop: "6px" }}>
            <span>Quests Completed: <strong style={{ color: "#f2e9e9" }}>{selectedDay.record?.questsCompleted ?? 0}</strong></span>
            <span>Directive: <strong style={{ color: selectedDay.record?.directiveCompleted ? "#22c55e" : "#e63946" }}>{selectedDay.record?.directiveCompleted ? "Accomplished" : "Incomplete"}</strong></span>
            <span>Perfect Day: <strong style={{ color: selectedDay.record?.perfectDayEarned ? "#ffd700" : "#8a6b70" }}>{selectedDay.record?.perfectDayEarned ? "Achieved ✦" : "No"}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCalendar;
