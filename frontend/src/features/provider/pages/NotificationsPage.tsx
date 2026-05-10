import React, { useEffect } from "react";
import { RiNotification3Line, RiCheckDoubleLine, RiDeleteBin7Line } from "react-icons/ri";
import { useNotifications } from "../../notification/hooks/useNotifications";
import FallbackScreen from "../../../components/ui/FallbackScreen";

const NotificationsPage: React.FC = () => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  if (loading && notifications.length === 0) return <FallbackScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 mt-1 font-medium">Stay updated with your latest activities.</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
            >
              <RiCheckDoubleLine size={18} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <RiNotification3Line size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No notifications yet</h3>
              <p className="text-slate-500">We'll notify you when something important happens.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n._id} className={`p-6 flex gap-4 transition-colors ${!n.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600' :
                    n.type === 'JOB_ASSIGNMENT' ? 'bg-blue-50 text-blue-600' :
                    n.type === 'REVIEW' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    <RiNotification3Line size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-base ${!n.isRead ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'}`}>{n.title}</h4>
                      <span className="text-xs font-medium text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{n.message}</p>
                    <div className="flex items-center gap-4">
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n._id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1"
                      >
                        <RiDeleteBin7Line size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
