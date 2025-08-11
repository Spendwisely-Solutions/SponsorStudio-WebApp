import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Modal from '../../Modal';
import compressMedia from '../../../utils/compressMedia';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('Invalid Supabase URL format');
}
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

function ManageClientsLogos() {
  type Logo = { id: string; name: string; logo_url: string; created_at: string };
  const [logos, setLogos] = useState<Logo[]>([]);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLogoId, setDeleteLogoId] = useState<string | null>(null);
  const [deleteLogoUrl, setDeleteLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ originalSize?: number; compressedSize?: number; previewUrl?: string } | null>(null);

  useEffect(() => {
    fetchLogos();
  }, []);

  async function fetchLogos() {
    setLoading(true);
    const { data, error } = await supabase.from('client_logos').select('*').order('created_at', { ascending: false });
    if (!error) setLogos(data || []);
    setLoading(false);
  }

  async function handleAddLogo() {
    if (!name || !file) return;
    setUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressMedia(file, { maxSizeMB: 0.15, maxWidthOrHeight: 400 });
      setCompressionInfo({
        originalSize: file.size,
        compressedSize: compressedFile.size,
        previewUrl: URL.createObjectURL(compressedFile),
      });
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('client-logos').upload(fileName, compressedFile);
      if (uploadError) {
        alert('Upload failed');
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('client-logos').getPublicUrl(fileName);
      const logoUrl = urlData.publicUrl;
      const { error: insertError } = await supabase.from('client_logos').insert({ name, logo_url: logoUrl });
      if (insertError) alert('Insert failed');
      setName('');
      setFile(null);
      setUploading(false);
      setShowUploadModal(false);
      setCompressionInfo(null);
      fetchLogos();
    } catch (err) {
      alert('Compression failed');
      setUploading(false);
    }
  }

  async function handleDeleteLogo() {
    if (!deleteLogoId) return;
    const path = deleteLogoUrl.split('/client-logos/')[1];
    if (path) await supabase.storage.from('client-logos').remove([path]);
    await supabase.from('client_logos').delete().eq('id', deleteLogoId);
    setShowDeleteModal(false);
    setDeleteLogoId(null);
    setDeleteLogoUrl('');
    fetchLogos();
  }

  function startEditLogo(logo: Logo) {
    setEditId(logo.id);
    setEditName(logo.name);
    setEditLogoUrl(logo.logo_url);
    setShowUploadModal(true);
  }

  async function handleEditLogo() {
    let newLogoUrl = editLogoUrl;
    if (file) {
      try {
        // Compress image before upload
        const compressedFile = await compressMedia(file, { maxSizeMB: 0.15, maxWidthOrHeight: 400 });
        setCompressionInfo({
          originalSize: file.size,
          compressedSize: compressedFile.size,
          previewUrl: URL.createObjectURL(compressedFile),
        });
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('client-logos').upload(fileName, compressedFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('client-logos').getPublicUrl(fileName);
          newLogoUrl = urlData.publicUrl;
        }
      } catch (err) {
        alert('Compression failed');
      }
    }
    await supabase.from('client_logos').update({ name: editName, logo_url: newLogoUrl }).eq('id', editId);
    setEditId(null);
    setEditName('');
    setEditLogoUrl('');
    setFile(null);
    setShowUploadModal(false);
    setCompressionInfo(null);
    fetchLogos();
  }

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Client Logos</h1>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-xl shadow hover:scale-105 hover:from-blue-700 hover:to-blue-600 transition-all font-semibold"
          onClick={() => { setShowUploadModal(true); setEditId(null); setName(''); setFile(null); setEditName(''); setEditLogoUrl(''); }}
        >
          <span className="inline-block align-middle mr-2">+</span> Add New Logo
        </button>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by client name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
            <p className="text-gray-500 text-lg">Loading logos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {logos.filter(logo => logo.name.toLowerCase().includes(search.toLowerCase())).map((logo) => (
              <div
                key={logo.id}
                className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-blue-300 group relative"
                style={{ minHeight: 220 }}
              >
                <div className="w-20 h-20 mb-3 flex items-center justify-center rounded-xl bg-white shadow group-hover:scale-105 transition-transform">
                  <img src={logo.logo_url} alt={logo.name} className="h-16 w-16 object-contain" />
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1 text-center truncate w-full" title={logo.name}>{logo.name}</div>
                <div className="flex gap-3 mt-4">
                  <button
                    className="px-4 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-all shadow"
                    onClick={() => startEditLogo(logo)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-1 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-all shadow"
                    onClick={() => { setDeleteLogoId(logo.id); setDeleteLogoUrl(logo.logo_url); setShowDeleteModal(true); }}
                  >
                    Delete
                  </button>
                </div>
                <div className="absolute top-2 right-2 text-xs text-gray-400">{new Date(logo.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            {logos.filter(logo => logo.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 text-blue-200"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-2-7h4v2h-4v-2zm0-6h4v5h-4V7z" fill="currentColor"/></svg>
                <p className="text-gray-500 text-lg">No logos found. Try a different search or add a new logo.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => { setShowUploadModal(false); setEditId(null); setEditName(''); setEditLogoUrl(''); setFile(null); setName(''); setCompressionInfo(null); }}
        onConfirm={editId ? handleEditLogo : handleAddLogo}
        title={editId ? 'Update Logo' : 'Add New Logo'}
        message={
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Client Name"
              value={editId ? editName : name}
              onChange={e => editId ? setEditName(e.target.value) : setName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                const selectedFile = e.target.files?.[0] || null;
                setFile(selectedFile);
                if (selectedFile) {
                  try {
                    const compressedFile = await compressMedia(selectedFile, { maxSizeMB: 0.15, maxWidthOrHeight: 400 });
                    setCompressionInfo({
                      originalSize: selectedFile.size,
                      compressedSize: compressedFile.size,
                      previewUrl: URL.createObjectURL(compressedFile),
                    });
                  } catch {
                    setCompressionInfo(null);
                  }
                } else {
                  setCompressionInfo(null);
                }
              }}
              className="border p-2 rounded w-full"
            />
            {compressionInfo && (
              <div className="bg-gray-50 rounded-lg p-3 mt-2 flex flex-col items-center">
                <div className="text-sm text-gray-700 mb-2">Compression Results:</div>
                <div className="flex gap-4 items-center">
                  <div>
                    <div className="text-xs text-gray-500">Original Size</div>
                    <div className="font-semibold">{(compressionInfo.originalSize! / 1024).toFixed(1)} KB</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Compressed Size</div>
                    <div className="font-semibold">{(compressionInfo.compressedSize! / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                {compressionInfo.previewUrl && (
                  <img src={compressionInfo.previewUrl} alt="Compressed Preview" className="h-16 w-16 object-contain mt-3 rounded shadow" />
                )}
              </div>
            )}
            {editId && editLogoUrl && !compressionInfo && (
              <img src={editLogoUrl} alt={editName} className="h-16 w-16 object-contain mx-auto" />
            )}
          </div>
        }
        confirmText={editId ? 'Update Logo' : uploading ? 'Uploading...' : 'Add Logo'}
        cancelText="Cancel"
        confirmButtonClass="bg-blue-600 text-white hover:bg-blue-700"
        cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteLogoId(null); setDeleteLogoUrl(''); }}
        onConfirm={handleDeleteLogo}
        title="Delete Logo"
        message="Are you sure you want to delete this logo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
}

export default ManageClientsLogos
