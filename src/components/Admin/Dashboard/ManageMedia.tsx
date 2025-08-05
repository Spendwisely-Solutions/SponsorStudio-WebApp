import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { FaFolder, FaFile, FaTrash, FaEye, FaHome, FaArrowLeft } from 'react-icons/fa';

// Define types for Supabase file and folder objects
interface FileObject {
  name: string;
  updated_at: string;
  metadata?: {
    size: number;
  };
  path: string; // Full path including folder (using id)
  displayName: string; // company_name for display in UI
  isFile: boolean;
  folderSize?: number; // Total size of files in folder (in bytes)
}

// Define type for profile data
interface Profile {
  id: string;
  company_name: string | null;
}

const ManageMedia: React.FC = () => {
  const [items, setItems] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(['media']); // Breadcrumb path
  const [eventOrganizers, setEventOrganizers] = useState<Profile[]>([]);

  // Fetch profiles of event_organizer type from profiles table
  const fetchEventOrganizerProfiles = async (): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name')
        .eq('user_type', 'event_organizer');

      if (error) {
        throw new Error(`Failed to fetch event organizer profiles: ${error.message} (Code: ${error.code})`);
      }

      const profiles = data as Profile[];
      console.log('Event organizer profiles:', profiles);
      if (profiles.length === 0) {
        toast('No event organizer profiles found', { icon: 'ℹ️' });
      }
      return profiles;
    } catch (error: any) {
      console.error('Error fetching event organizer profiles:', error);
      toast.error('Error fetching profiles: ' + error.message);
      return [];
    }
  };

  // Recursively fetch all files in a folder to calculate total size and check if empty
  const calculateFolderSize = async (bucket: string, folderPath: string): Promise<{ size: number; hasContent: boolean }> => {
    let totalSize = 0;
    let hasContent = false;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath, { limit: 100 });

      if (error) {
        console.error(`Error listing files in ${folderPath}:`, error);
        return { size: 0, hasContent: false };
      }

      if (data.length > 0) {
        hasContent = true;
      }

      for (const item of data) {
        const itemPath = `${folderPath}/${item.name}`;
        if (item.metadata) {
          // This is a file
          totalSize += item.metadata.size || 0;
        } else {
          // This is a folder, recurse
          const subFolder = await calculateFolderSize(bucket, itemPath);
          totalSize += subFolder.size;
          if (subFolder.hasContent) {
            hasContent = true;
          }
        }
      }
      return { size: totalSize, hasContent };
    } catch (error: any) {
      console.error(`Error calculating size for ${folderPath}:`, error);
      return { size: 0, hasContent: false };
    }
  };

  // Fetch contents of the current folder
  const fetchFolderContents = async (path: string[]) => {
    try {
      setLoading(true);
      let folderItems: FileObject[] = [];

      if (path.length === 1) {
        // Root level: show opportunities and posts folders
        folderItems = [
          { name: 'opportunities', displayName: 'opportunities', updated_at: '', path: 'opportunities', isFile: false, folderSize: 0 },
          { name: 'posts', displayName: 'posts', updated_at: '', path: 'posts', isFile: false, folderSize: 0 },
        ];
        console.log('Root level items:', folderItems);
      } else if (path.length === 2 && ['opportunities', 'posts'].includes(path[1])) {
        // Show user ID folders for event organizers, display company_name, hide empty folders
        if (eventOrganizers.length === 0) {
          const profiles = await fetchEventOrganizerProfiles();
          setEventOrganizers(profiles);

          // Calculate folder sizes and filter non-empty folders
          const folderPromises = profiles.map(async (profile) => {
            const folderPath = `${path[1]}/${profile.id}`;
            const { size, hasContent } = await calculateFolderSize('media', folderPath);
            if (!hasContent) {
              console.log(`Skipping empty folder: ${folderPath}`);
              return null;
            }
            return {
              name: profile.id,
              displayName: profile.company_name || profile.id, // Fallback to id
              updated_at: '',
              path: folderPath,
              isFile: false,
              folderSize: size,
            };
          });

          folderItems = (await Promise.all(folderPromises)).filter((item): item is FileObject => item !== null);
        } else {
          const folderPromises = eventOrganizers.map(async (profile) => {
            const folderPath = `${path[1]}/${profile.id}`;
            const { size, hasContent } = await calculateFolderSize('media', folderPath);
            if (!hasContent) {
              console.log(`Skipping empty folder: ${folderPath}`);
              return null;
            }
            return {
              name: profile.id,
              displayName: profile.company_name || profile.id,
              updated_at: '',
              path: folderPath,
              isFile: false,
              folderSize: size,
            };
          });

          folderItems = (await Promise.all(folderPromises)).filter((item): item is FileObject => item !== null);
        }

        if (folderItems.length === 0) {
          toast(`No non-empty folders found in ${path[1]}`, { icon: 'ℹ️' });
        }
        console.log(`User folders in ${path[1]}:`, folderItems);
      } else if (path.length === 3) {
        // Fetch files in opportunities/<user_id> or posts/<user_id>
        const folderPath = path.slice(1).join('/');
        console.log(`Fetching files from: ${folderPath}`);
        const { data, error } = await supabase.storage
          .from('media')
          .list(folderPath, { limit: 100 });

        if (error) {
          throw new Error(`Failed to list files in ${folderPath}: ${error.message} (Code: ${error.code})`);
        }

        // Find the company_name for the current user_id
        const userId = path[2];
        const profile = eventOrganizers.find(p => p.id === userId);
        const displayName = profile?.company_name || userId;

        folderItems = data.map(item => ({
          ...item,
          path: `${folderPath}/${item.name}`,
          displayName: item.name, // Files use their own name
          isFile: !!item.metadata,
        }));

        if (!data || data.length === 0) {
          console.log(`No items found in ${folderPath}`);
          toast(`No files found in ${folderPath}`, { icon: 'ℹ️' });
        } else {
          console.log(`Items in ${folderPath}:`, folderItems);
        }
      }

      setItems(folderItems);
    } catch (error: any) {
      console.error('Error fetching folder contents:', error);
      toast.error('Error fetching contents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // View file by generating public URL
  const viewFile = async (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        throw new Error('Failed to generate public URL');
      }
      console.log('Preview URL:', data.publicUrl);
      setPreviewUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error viewing file:', error);
      toast.error('Error viewing file: ' + error.message);
    }
  };

  // Delete file from bucket
  const deleteFile = async (filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (error) throw error;
      toast.success('File deleted successfully');
      await fetchFolderContents(currentPath); // Refresh current folder
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (path: string, displayName: string) => {
    const newPath = [...currentPath, displayName];
    setCurrentPath(newPath);
    fetchFolderContents([...currentPath, path]); // Use actual path with id
  };

  // Navigate to a specific path in the breadcrumb
  const navigateToPath = (index: number) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    // Map displayName back to actual path (id) for fetching
    let actualPath = ['media'];
    if (newPath.length > 1) {
      actualPath.push(newPath[1]); // opportunities or posts
      if (newPath.length > 2) {
        const profile = eventOrganizers.find(p => p.company_name === newPath[2] || p.id === newPath[2]);
        actualPath.push(profile?.id || newPath[2]); // Use id for path
      }
    }
    fetchFolderContents(actualPath);
  };

  // Navigate back to parent folder
  const navigateBack = () => {
    if (currentPath.length <= 1) return; // No parent at root
    navigateToPath(currentPath.length - 2);
  };

  // Initial fetch
  useEffect(() => {
    fetchFolderContents(currentPath);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Media File Manager</h1>
          {currentPath.length > 1 && (
            <button
              onClick={navigateBack}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center"
            >
              <FaArrowLeft className="mr-1" /> Back
            </button>
          )}
        </div>
        <button
          onClick={() => fetchFolderContents(currentPath)}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center text-sm">
        {currentPath.map((segment, index) => (
          <span key={index} className="flex items-center">
            {index === 0 ? (
              <button
                onClick={() => navigateToPath(0)}
                className="text-blue-500 hover:underline flex items-center"
              >
                <FaHome className="mr-1" /> media
              </button>
            ) : (
              <button
                onClick={() => navigateToPath(index)}
                className="text-blue-500 hover:underline"
              >
                {segment}
              </button>
            )}
            {index < currentPath.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </div>

      {/* Folder/File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center p-4">Loading...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center p-4">No items found</div>
        ) : (
          items.map((item) => (
            <div
              key={item.path}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
            >
              <div className="flex items-center mb-2">
                {item.isFile ? (
                  <FaFile className="text-gray-500 mr-2" />
                ) : (
                  <FaFolder className="text-yellow-500 mr-2" />
                )}
                <span
                  className={`truncate ${!item.isFile ? 'text-blue-500 cursor-pointer hover:underline' : ''}`}
                  onClick={() => !item.isFile && navigateToFolder(item.name, item.displayName)}
                  title={item.displayName}
                >
                  {item.displayName}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {item.isFile ? (
                  <>
                    <p>Size: {item.metadata?.size ? `${(item.metadata.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                    <p>Last Modified: {new Date(item.updated_at).toLocaleString()}</p>
                  </>
                ) : (
                  <p>Size: {item.folderSize ? `${(item.folderSize / 1024).toFixed(2)} KB` : '0 KB'}</p>
                )}
                {item.isFile && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => viewFile(item.path)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => deleteFile(item.path)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">File Preview</h2>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              {previewUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[60vh]"
                  title="File Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedia;