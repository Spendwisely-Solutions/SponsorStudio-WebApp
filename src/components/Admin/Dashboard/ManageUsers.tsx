import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { UserCog, Trash2, Edit, Search } from 'lucide-react';
import Modal from '../../Modal';

interface Profile {
  id: string;
  user_type: string | null;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  annual_marketing_budget: number | null;
  target_audience: string | null;
  location: string | null;
  created_at: string | null;
  updated_at: string | null;
  industry_details: string | null;
  company_size: string | null;
  marketing_channels: string | null;
  previous_sponsorships: any | null;
  sponsorship_goals: string | null;
  contact_person_name: string | null;
  contact_person_position: string | null;
  contact_person_phone: string | null;
  social_media: any | null;
  profile_picture_url: string | null;
  phone_number: string | null;
  phone_number_verified: boolean | null;
  email?: string | null;
}

interface ManageUsersProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

interface UserTypeCount {
  user_type: string | null;
  count: number;
}

export default function ManageUsers({ searchTerm: externalSearchTerm, setSearchTerm: setExternalSearchTerm }: ManageUsersProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersToDelete, setUsersToDelete] = useState<string[]>([]);
  const [userTypeCounts, setUserTypeCounts] = useState<UserTypeCount[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (setExternalSearchTerm) {
      setExternalSearchTerm(newSearchTerm);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserTypeCounts();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

 
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_type', 'admin');

      if (profilesError) {
        console.error('Supabase fetch error (profiles):', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      if (!profilesData || profilesData.length === 0) {
        console.warn('No profiles data returned from Supabase');
        setUsers([]);
        return;
      }

      setUsers(profilesData as Profile[]);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypeCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .neq('user_type', 'admin');

      if (error) {
        console.error('Supabase fetch error (user type counts):', error);
        throw new Error(`Failed to fetch user type counts: ${error.message}`);
      }

      const userTypeMap = new Map<string | null, number>();
      data.forEach(item => {
        const userType = item.user_type || 'Unknown';
        userTypeMap.set(userType, (userTypeMap.get(userType) || 0) + 1);
      });

      const counts: UserTypeCount[] = Array.from(userTypeMap.entries()).map(([user_type, count]) => ({
        user_type,
        count,
      }));

      setUserTypeCounts(counts);
    } catch (error) {
      console.error('Error in fetchUserTypeCounts:', error);
      toast.error('Failed to load user type counts');
    }
  };

  const handleDeleteUsers = async (userIds: string[]) => {
    try {
      setIsDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found. Please log in.');
      }

      const response = await fetch('https://urablfvmqregyvfyaovi.supabase.co/functions/v1/delete-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete users');
      }

      setUsers(users.filter(user => !userIds.includes(user.id)));
      setSelectedUsers([]);
      setIsSelectionMode(false);
      toast.success(`${userIds.length} user${userIds.length > 1 ? 's' : ''} deleted successfully`);
      fetchUserTypeCounts();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete users');
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (userIds: string | string[]) => {
    setUsersToDelete(Array.isArray(userIds) ? userIds : [userIds]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUsersToDelete([]);
  };

  const confirmDelete = () => {
    if (usersToDelete.length > 0) {
      closeModal();
      handleDeleteUsers(usersToDelete);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (!isSelectionMode) return;
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
      setIsSelectionMode(false);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const startLongPress = (userId: string) => {
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDoubleClick = (userId: string) => {
    setIsSelectionMode(true);
    setSelectedUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearchTerm =
      !searchTerm ||
      (user.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.website?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.industry?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.company_size?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false);


    return matchesSearchTerm;
  });


  return (
    <div className="relative w-full">
      {/* Progress Bar Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <p className="text-center text-gray-700 mb-4">Deleting users...</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full animate-progress"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        {selectedUsers.length > 0 && (
          <button
            onClick={() => openModal(selectedUsers)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Selected ({selectedUsers.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        {userTypeCounts.map((count, index) => {
          const userTypeLabel =
            count.user_type === 'brand' ? 'Brands' :
            count.user_type === 'event_organizer' ? 'Event Organizers' :
            count.user_type === 'agency' ? 'Agencies' :
            count.user_type === 'creator' ? 'Creators' :
            count.user_type === 'influencer' ? 'Influencers' :
            'Unknown';
          return (
            <div
              key={count.user_type || 'unknown'}
              className={`p-4 rounded-lg text-center ${getTileColor(index)}`}
            >
              <h3 className="text-lg font-semibold text-blue-800">{userTypeLabel}</h3>
              <p className="text-2xl font-bold text-blue-600">{count.count}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, company, website, industry, company size, location, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-lg shadow">
          <table className="w-full table-auto text-left">
            <thead className="bg-blue-100">
              <tr>
                {selectedUsers.length > 0 && (
                  <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[100px]">Name</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[100px]">Contact Person</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[120px] hidden sm:table-cell">Email</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden md:table-cell">Role</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[100px] hidden lg:table-cell">Website</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden lg:table-cell">Industry</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden xl:table-cell">Company Size</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden xl:table-cell">Location</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden 2xl:table-cell">Created At</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase border-r border-blue-200 min-w-[80px] hidden lg:table-cell">Phone Number</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onMouseDown={() => startLongPress(user.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onDoubleClick={() => handleDoubleClick(user.id)}
                  onClick={() => handleSelectUser(user.id)}
                  className={`cursor-pointer ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {selectedUsers.length > 0 && (
                    <td className="px-2 py-2 border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[100px]" title={user.company_name || ' - '}>
                    {user.company_name || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[100px]" title={user.contact_person_name || ' - '}>
                    {user.contact_person_name || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[120px] hidden sm:table-cell" title={user.email || ' - '}>
                    {user.email || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[80px] hidden md:table-cell" title={user.user_type || ' - '}>
                    {user.user_type || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[100px] hidden lg:table-cell" title={user.website || ' - '}>
                    {user.website ? (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    ) : (
                      ' - '
                    )}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[80px] hidden lg:table-cell" title={user.industry || ' - '}>
                    {user.industry || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 truncate max-w-[80px] hidden xl:table-cell" title={user.company_size || ' - '}>
                    {user.company_size || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-blue-200 truncate max-w-[80px] hidden xl:table-cell" title={user.location || ' - '}>
                    {user.location || ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-blue-200 truncate max-w-[80px] hidden 2xl:table-cell" title={user.created_at ? new Date(user.created_at).toLocaleDateString() : ' - '}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : ' - '}
                  </td>
                  <td className="px-2 py-2 border-r border-blue-200 truncate max-w-[80px] hidden lg:table-cell" title={user.phone_number || ' - '}>
                    {user.contact_person_phone || ' - '}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Edit user ${user.contact_person_name} (ID: ${user.id})`);
                        }}
                        className="px-1 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(user.id);
                        }}
                        className="px-1 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${usersToDelete.length} user${usersToDelete.length > 1 ? 's' : ''}? This action cannot be undone and will also remove the user${usersToDelete.length > 1 ? 's' : ''} from authentication.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
}

const getTileColor = (index: number) => {
  const colors = [
    'bg-green-200', // Brands
    'bg-red-300', // Creators
    'bg-yellow-200', // Event Organizers
    'bg-purple-200', // Agencies
    'bg-pink-200', // Influencers
  ];
  return colors[index % colors.length] || 'bg-blue-100';
};

// Add custom CSS for the progress bar animation and truncation
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    0% {  transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  .animate-progress {
    animation: progress 2s linear infinite;
  }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
document.head.appendChild(style);