import React from 'react';
import { StationLocation } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Droplets, TrendingUp, X, MapPin } from 'lucide-react';

interface SidebarProps {
  station: StationLocation | null;
  onClose: () => void;
  dateList: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ station, onClose, dateList, selectedDate, onDateChange }) => {
  return (
    <div className="flex flex-col h-full bg-white shadow-xl border-l border-gray-200 w-full md:w-96 absolute right-0 top-0 z-[1000] transition-transform duration-300 transform translate-x-0">
      
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6" />
          <h1 className="text-lg font-bold">Water Insights</h1>
        </div>
        {station && (
           <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition">
             <X className="w-5 h-5" />
           </button>
        )}
      </div>

      {/* Date Selector */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Report Date
        </label>
        <select 
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {dateList.map(date => (
            <option key={date} value={date} className="text-gray-900 bg-white">
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {!station ? (
          <div className="text-center py-10 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Select a location on the map to view detailed statistics.</p>
          </div>
        ) : (
          <>
            {/* Station Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{station.name}</h2>
              <p className="text-blue-600 font-medium">{station.river} River</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-3">
              {station.metrics.map((metric, idx) => (
                <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-500 font-bold uppercase">{metric.label}</p>
                    <p className="text-sm text-gray-500">{metric.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">{metric.value.toLocaleString()}</span>
                    <span className="ml-1 text-xs text-gray-500">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">Historical Trend ({station.historical[0]?.type})</h3>
              </div>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={station.historical}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 10}} 
                      tickLine={false}
                      axisLine={false}
                      minTickGap={10}
                    />
                    <YAxis 
                      tick={{fontSize: 10}} 
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      labelStyle={{color: '#6b7280', fontSize: '12px'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 text-center">
         <p className="text-xs text-gray-400">Data Source: IRSA Press Release</p>
      </div>
    </div>
  );
};

export default Sidebar;