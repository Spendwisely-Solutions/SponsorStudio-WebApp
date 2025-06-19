import React, { useState, useEffect } from 'react';
import { Calendar, CalendarPlus, CheckCircle, Clock, Frown, Sparkles, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '../../lib/database.types';

type Match = Database['public']['Tables']['matches']['Row'] & {
  opportunities?: Database['public']['Tables']['opportunities']['Row'] & {
    profiles?: Database['public']['Tables']['profiles']['Row'];
  };
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface ScheduledMeetingsProps {
  meetings: Match[];
  isBrand: boolean;
}

export default function ScheduledMeetings({ meetings, isBrand }: ScheduledMeetingsProps) {
  const [statusFilter, setStatusFilter] = useState<string>('accepted');
  const [eventNameFilter, setEventNameFilter] = useState<string>('');
  const [filteredMeetings, setFilteredMeetings] = useState<Match[]>([]);

  // Filter meetings based on status and event name
  useEffect(() => {
    setFilteredMeetings(
      meetings.filter((meeting) => {
        const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
        const matchesEventName = !eventNameFilter || 
          (meeting.opportunities?.title?.toLowerCase() || '').includes(eventNameFilter.toLowerCase());
        return matchesStatus && matchesEventName;
      })
    );
  }, [meetings, statusFilter, eventNameFilter]);

  // Function to generate Google Calendar event link (unchanged)
  const generateGoogleCalendarLink = (meeting: Match) => {
    const event = {
      title: `Meeting for ${meeting.opportunities?.title || 'Opportunity'} with ${meeting.profiles?.company_name || 'Brand'}`,
      description: `Meeting with creator for ${meeting.opportunities?.title || 'Opportunity'}.\nBrand: ${meeting.profiles?.company_name || 'Unknown Brand'}\nJoin Meeting: ${meeting.meeting_link || ''}`,
      start: meeting.meeting_scheduled_at || new Date().toISOString(),
      end: meeting.meeting_scheduled_at 
        ? new Date(new Date(meeting.meeting_scheduled_at).getTime() + 60 * 60 * 1000).toISOString() 
        : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      location: meeting.meeting_link || 'TBD',
    };

    const baseUrl = 'https://calendar.google.com/calendar/render';
    const startTime = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0];
    const endTime = new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0];
    const dates = `${startTime}%2F${endTime}`; // Use %2F directly for date separator

    // Encode the description directly, letting encodeURIComponent handle \n to %0A conversion
    const encodedDescription = encodeURIComponent(event.description.trim());

    // Construct the URL manually to avoid double-encoding
    const params = [
      `action=TEMPLATE`,
      `text=${encodeURIComponent(event.title.trim()).replace(/%20/g, '+')}`, // Replace %20 with + for spaces in text
      `dates=${dates}`, // Already formatted with %2F
      `details=${encodedDescription}`, // Encode description with \n converted to %0A
      `location=${encodeURIComponent(event.location.trim())}`, // Encode location
    ];

    return `${baseUrl}?${params.join('&')}`;
  };

  // Common content for both mobile and desktop views
  const content = (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduled Meetings</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search by event name..."
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 w-full sm:w-64"
            value={eventNameFilter}
            onChange={(e) => setEventNameFilter(e.target.value)}
            aria-label="Search meetings by event name"
          />
          <select
            className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter meetings by status"
          >
            <option value="all">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center space-x-3 mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
              <Frown className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-4">No meetings found for the selected filters.</p>
            <a
              href="/schedule"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Schedule a new meeting"
            >
              Schedule a Meeting
            </a>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Table layout for larger screens */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Event
                  </th>
                  {!isBrand && (
                    <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Brand
                    </th>
                  )}
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Meeting Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredMeetings.map((meeting, index) => (
                    <motion.tr
                      key={meeting.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900 truncate max-w-[200px] group relative">
                          <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
                          <span className="truncate">{meeting.opportunities?.title || 'Unknown Event'}</span>
                          <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-10">
                            {meeting.opportunities?.title || 'Unknown Event'}
                          </div>
                        </div>
                      </td>
                      {!isBrand && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[200px] group relative">
                          <span className="truncate">{meeting.profiles?.company_name || 'Unknown Brand'}</span>
                          <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-10">
                            {meeting.profiles?.company_name || 'Unknown Brand'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                          {meeting.meeting_scheduled_at
                            ? new Date(meeting.meeting_scheduled_at).toLocaleString()
                            : 'Not scheduled'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        {meeting.meeting_link ? (
                          <motion.a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Join meeting for ${meeting.opportunities?.title || 'Opportunity'}`}
                          >
                            <Video className="w-5 h-5 mr-2" />
                            Join
                          </motion.a>
                        ) : (
                          <span className="text-gray-400 text-sm">Scheduling in progress</span>
                        )}
                        {meeting.meeting_scheduled_at && meeting.meeting_link && (
                          <motion.a
                            href={generateGoogleCalendarLink(meeting)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Add meeting to calendar for ${meeting.opportunities?.title || 'Opportunity'}`}
                          >
                            <CalendarPlus className="w-5 h-5 mr-2" />
                            Add to Calendar
                          </motion.a>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Card layout for mobile screens */}
          <div className="block sm:hidden space-y-6">
            <AnimatePresence>
              {filteredMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border border-gray-200 rounded-xl p-6 bg-white shadow-sm ${
                    index === filteredMeetings.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center text-sm font-medium text-gray-900 truncate max-w-[200px] group relative">
                      <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
                      <span className="truncate">{meeting.opportunities?.title || 'Unknown Event'}</span>
                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-10">
                        {meeting.opportunities?.title || 'Unknown Event'}
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 inline-flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                  </div>
                  {!isBrand && (
                    <div className="flex items-center text-sm text-gray-500 mb-4 truncate max-w-[200px] group relative">
                      <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
                      <span className="truncate">{meeting.profiles?.company_name || 'Unknown Brand'}</span>
                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-10">
                        {meeting.profiles?.company_name || 'Unknown Brand'}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                    {meeting.meeting_scheduled_at
                      ? new Date(meeting.meeting_scheduled_at).toLocaleString()
                      : 'Not scheduled'}
                  </div>
                  <div className="flex flex-row gap-3">
                    {meeting.meeting_link ? (
                      <motion.a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 truncate"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Join meeting for ${meeting.opportunities?.title || 'Opportunity'}`}
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Join
                      </motion.a>
                    ) : (
                      <span className="flex-1 text-gray-400 text-sm text-center">Scheduling in progress</span>
                    )}
                    {meeting.meeting_scheduled_at && meeting.meeting_link && (
                      <motion.a
                        href={generateGoogleCalendarLink(meeting)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 truncate"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Add meeting to calendar for ${meeting.opportunities?.title || 'Opportunity'}`}
                      >
                        <CalendarPlus className="w-5 h-5 mr-2" />
                        Add to Calendar
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop view with outer container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden sm:block bg-white rounded-xl shadow-lg p-6"
      >
        {content}
      </motion.div>
      {/* Mobile view without outer container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="block sm:hidden pb-16"
      >
        {content}
      </motion.div>
    </>
  );
}