import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RiTimeLine,
  RiCalendarEventLine,
  RiAddLine,
  RiDeleteBin7Line,
  RiSaveLine,
  RiToggleFill,
  RiToggleLine,
} from "react-icons/ri";
import {
  fetchMyAvailability,
  updateAvailability,
  addBlockedDate,
  deleteBlockedDate,
} from "../store/availabilitySlice";
import type { AppDispatch, RootState } from "../../../app/store";
import { toast } from "react-toastify";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

interface AvailabilityItem {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const ProviderAvailability: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { availability, blockedDates, loading } = useSelector((state: RootState) => state.availability);

  const [localAvailability, setLocalAvailability] = useState<AvailabilityItem[]>([]);
  const [newBlocked, setNewBlocked] = useState({ startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    dispatch(fetchMyAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (availability && availability.length > 0) {
      setLocalAvailability(availability);
    } else if (!loading) {
      setLocalAvailability(DAYS.map(day => ({
        day,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true
      })));
    }
  }, [availability, loading]);

  const handleToggleDay = (day: string) => {
    setLocalAvailability(prev =>
      prev.map(a => a.day === day ? { ...a, isAvailable: !a.isAvailable } : a)
    );
  };

  const handleTimeChange = (day: string, field: "startTime" | "endTime", value: string) => {
    setLocalAvailability(prev =>
      prev.map(a => a.day === day ? { ...a, [field]: value } : a)
    );
  };

  const handleSaveAvailability = () => {
    dispatch(updateAvailability(localAvailability));
  };

  const handleAddBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocked.startDate || !newBlocked.endDate || !newBlocked.reason) return;

    const start = new Date(newBlocked.startDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
        toast.error("Cannot block dates in the past");
        return;
    }

    if (new Date(newBlocked.endDate) < start) {
        toast.error("End date cannot be before start date");
        return;
    }

    dispatch(addBlockedDate(newBlocked));
    setNewBlocked({ startDate: "", endDate: "", reason: "" });
  };

  return (
    <div className="qw-availability-container">
      <div className="qw-section-card">
        <div className="qw-section-title">
          <div className="d-flex align-items-center gap-2">
            <RiTimeLine className="text-primary" />
            Weekly Availability
          </div>
          <button
            className="qw-btn-save"
            onClick={handleSaveAvailability}
            disabled={loading}
          >
            <RiSaveLine /> {loading ? "Saving..." : "Save Schedule"}
          </button>
        </div>

        <div className="qw-availability-list mt-4">
          {localAvailability.map((a) => (
            <div key={a.day} className={`qw-availability-row ${!a.isAvailable ? 'disabled' : ''}`}>
              <div className="qw-day-info">
                <button
                    className="qw-toggle-btn"
                    onClick={() => handleToggleDay(a.day)}
                >
                    {a.isAvailable ? <RiToggleFill className="text-primary" size={28} /> : <RiToggleLine className="text-muted" size={28} />}
                </button>
                <span className="qw-day-name">{a.day}</span>
              </div>

              <div className="qw-time-inputs">
                <input
                  type="time"
                  value={a.startTime}
                  onChange={(e) => handleTimeChange(a.day, "startTime", e.target.value)}
                  disabled={!a.isAvailable}
                />
                <span className="qw-time-divider">to</span>
                <input
                  type="time"
                  value={a.endTime}
                  onChange={(e) => handleTimeChange(a.day, "endTime", e.target.value)}
                  disabled={!a.isAvailable}
                />
              </div>

              <div className="qw-day-status">
                {a.isAvailable ? (
                    <span className="status-badge available">Active</span>
                ) : (
                    <span className="status-badge away">Away</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="qw-section-card mt-4">
        <div className="qw-section-title">
          <div className="d-flex align-items-center gap-2">
            <RiCalendarEventLine className="text-danger" />
            Blocked Dates & Leave
          </div>
        </div>

        <form className="qw-blocked-form mt-4" onSubmit={handleAddBlocked}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="qw-field-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={newBlocked.startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setNewBlocked({...newBlocked, startDate: e.target.value})}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="qw-field-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={newBlocked.endDate}
                min={newBlocked.startDate || new Date().toISOString().split("T")[0]}
                onChange={e => setNewBlocked({...newBlocked, endDate: e.target.value})}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="qw-field-label">Reason (e.g. Vacation, Sick Leave)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Personal, Sick Leave..."
                value={newBlocked.reason}
                onChange={e => setNewBlocked({...newBlocked, reason: e.target.value})}
                required
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="qw-btn-add-blocked w-100">
                <RiAddLine /> Add
              </button>
            </div>
          </div>
        </form>

        <div className="qw-blocked-list mt-4">
          {blockedDates.filter(d => new Date(d.endDate) >= new Date(new Date().setHours(0,0,0,0))).length === 0 ? (
            <div className="text-center py-4 text-muted small">
                <RiCalendarEventLine size={32} className="mb-2 opacity-25" />
                <p>No upcoming blocked dates scheduled</p>
            </div>
          ) : (
            blockedDates
              .filter(d => new Date(d.endDate) >= new Date(new Date().setHours(0,0,0,0)))
              .map((d) => (
                <div key={d._id} className="qw-blocked-item">
                  <div className="qw-blocked-info">
                    <h6>{d.reason}</h6>
                    <p>{new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="qw-btn-delete-blocked"
                    onClick={() => d._id && dispatch(deleteBlockedDate(d._id))}
                  >
                    <RiDeleteBin7Line />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      <style>{`
        .qw-availability-container {
            font-family: 'Inter', sans-serif;
        }
        .qw-availability-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .qw-availability-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: #f8fafc;
            border-radius: 16px;
            border: 1px solid #f1f5f9;
            transition: all 0.2s;
        }
        .qw-availability-row.disabled {
            opacity: 0.6;
            background: #f1f5f9;
        }
        .qw-day-info {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 150px;
        }
        .qw-toggle-btn {
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
        }
        .qw-day-name {
            font-weight: 700;
            text-transform: capitalize;
            color: #0f172a;
        }
        .qw-time-inputs {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .qw-time-inputs input {
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            font-weight: 600;
            color: #0f172a;
            outline: none;
        }
        .qw-time-inputs input:focus {
            border-color: #3b82f6;
        }
        .qw-time-divider {
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
        }
        .status-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 100px;
            text-transform: uppercase;
        }
        .status-badge.available { background: #f0fdf4; color: #16a34a; }
        .status-badge.away { background: #f1f5f9; color: #64748b; }

        .qw-btn-save {
            background: #0f172a;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .qw-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .qw-blocked-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #fff;
            border: 1px solid #f1f5f9;
            border-radius: 14px;
            margin-bottom: 10px;
        }
        .qw-blocked-info h6 { margin: 0; font-weight: 700; color: #0f172a; }
        .qw-blocked-info p { margin: 2px 0 0; font-size: 12px; color: #64748b; }
        .qw-btn-delete-blocked {
            background: #fef2f2;
            color: #ef4444;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .qw-btn-delete-blocked:hover { background: #ef4444; color: #fff; }

        .qw-btn-add-blocked {
            background: #0f172a;
            color: #fff;
            border: none;
            padding: 10px;
            border-radius: 10px;
            font-weight: 700;
        }
        .qw-field-label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default ProviderAvailability;
