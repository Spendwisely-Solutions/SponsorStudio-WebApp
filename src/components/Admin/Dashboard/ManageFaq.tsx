import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit3, Trash2, HelpCircle, Save, X, Search, GripVertical } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // Adjust the import path as necessary
import toast from 'react-hot-toast';
import Modal from "../../Modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  is_brand: boolean; // true = brand FAQ, false = opportunity FAQ
  list_order: number; // determines the order of FAQs
  created_at: string;
};

// Sortable FAQ Item Component
interface SortableFAQItemProps {
  faq: FAQItem;
  index: number;
  onEdit: (faq: FAQItem) => void;
  onDelete: (id: number) => void;
}

const SortableFAQItem: React.FC<SortableFAQItemProps> = ({ faq, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    scale: isDragging ? 1.02 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40 p-6 transition-all duration-200 ease-out ${
        isDragging 
          ? 'z-[1000] shadow-2xl border-blue-300/60 bg-white/95 rotate-1' 
          : 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-200/60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={`p-2 rounded-lg transition-all duration-200 ease-out mr-2 mt-1 ${
              isDragging 
                ? 'text-blue-600 bg-blue-100 cursor-grabbing scale-110' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-grab active:cursor-grabbing'
            }`}
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-200 ${
                isDragging 
                  ? 'bg-blue-200 scale-110' 
                  : 'bg-blue-100'
              }`}>
                <span className={`font-semibold text-sm transition-colors duration-200 ${
                  isDragging ? 'text-blue-700' : 'text-blue-600'
                }`}>{index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 flex-1">
                {faq.question}
              </h3>
              {/* Type badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                faq.is_brand 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {faq.is_brand ? 'Brand' : 'Opportunity'}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed ml-11">
              {faq.answer}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(faq)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit FAQ"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(faq.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete FAQ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageFaq: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]); // Database-synced state
  const [localFilteredFaqs, setLocalFilteredFaqs] = useState<FAQItem[]>([]); // Local state for filtered FAQs
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isBrand, setIsBrand] = useState<boolean>(true); // Default to true (brand FAQ)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
  const [showBrands, setShowBrands] = useState<boolean>(true); // Toggle state for filtering
  const [isDragging, setIsDragging] = useState(false); // Track dragging state

  // DnD Kit sensors with improved responsiveness
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch FAQs and sync with local state
  const fetchFaqs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .order("list_order", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Failed to fetch FAQs");
    } else {
      const fetchedFaqs = data || [];
      setFaqs(fetchedFaqs);
      // Update filtered FAQs based on current filter
      setLocalFilteredFaqs(fetchedFaqs.filter(faq => faq.is_brand === showBrands));
    }
    setLoading(false);
  };

  // Update filtered FAQs when showBrands changes
  useEffect(() => {
    setLocalFilteredFaqs(faqs.filter(faq => faq.is_brand === showBrands));
  }, [faqs, showBrands]);

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end with instant local updates
  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find indices in the filtered FAQs array
    const oldIndex = localFilteredFaqs.findIndex((faq) => faq.id === active.id);
    const newIndex = localFilteredFaqs.findIndex((faq) => faq.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const reorderedFilteredFaqs = arrayMove(localFilteredFaqs, oldIndex, newIndex);

    // Calculate new orders and update objects immediately
    const startOrder = showBrands ? 1 : 100;
    const updatedReordered = reorderedFilteredFaqs.map((faq, index) => ({
      ...faq,
      list_order: startOrder + index
    }));

    // Set local state with updated objects for instant UI update
    setLocalFilteredFaqs(updatedReordered);

    // Update database in background
    const updateDatabase = async () => {
      try {
        const updates = updatedReordered.map(faq => ({
          id: faq.id,
          list_order: faq.list_order,
        }));

        // Batch update for better performance
        const updatePromises = updates.map(update => 
          supabase
            .from("faq")
            .update({ list_order: update.list_order })
            .eq("id", update.id)
        );

        await Promise.all(updatePromises);

        // Update faqs state to reflect new order
        const updatedFaqs = faqs.map(faq => {
          const updated = updates.find(u => u.id === faq.id);
          return updated ? { ...faq, list_order: updated.list_order } : faq;
        });

        // Sort the updated faqs by list_order for consistency
        const sortedUpdatedFaqs = [...updatedFaqs].sort((a, b) => a.list_order - b.list_order);
        setFaqs(sortedUpdatedFaqs);

        toast.success("Order saved", {
          duration: 1000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
          },
        });
      } catch (error) {
        console.error("Failed to update FAQ order:", error);
        toast.error("Failed to save order changes");
        // Revert to database state on error
        fetchFaqs();
      }
    };

    // Run database update in background
    updateDatabase();
  };

  // Add or update FAQ
  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("faq")
        .update({ 
          question: question.trim(), 
          answer: answer.trim(), 
          is_brand: isBrand 
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        toast.error("Failed to update FAQ");
      } else {
        toast.success("FAQ updated successfully");
        resetForm();
        fetchFaqs();
      }
    } else {
      // Get the highest list_order for the specific type from global faqs
      const maxOrder = faqs
        .filter(faq => faq.is_brand === isBrand)
        .reduce((max, faq) => Math.max(max, faq.list_order), 0);

      let nextOrder: number;
      if (isBrand) {
        nextOrder = maxOrder > 0 ? maxOrder + 1 : 1;
      } else {
        nextOrder = maxOrder > 0 ? maxOrder + 1 : 100;
      }

      const { data, error } = await supabase
        .from("faq")
        .insert([{ 
          question: question.trim(), 
          answer: answer.trim(), 
          is_brand: isBrand,
          list_order: nextOrder
        }])
        .select()
        .single();
      
      if (error) {
        console.error(error);
        toast.error("Failed to add FAQ");
      } else {
        toast.success("FAQ added successfully");
        resetForm();
        // Update faqs and sort for consistency
        const updatedFaqs = [...faqs, data].sort((a, b) => a.list_order - b.list_order);
        setFaqs(updatedFaqs);
        // Update localFilteredFaqs if it matches the filter
        if (data.is_brand === showBrands) {
          setLocalFilteredFaqs(prev => [...prev, data]);
        }
      }
    }
    setLoading(false);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setIsBrand(true); // Reset to default (brand FAQ)
    setIsFormModalOpen(false);
  };

  // Delete FAQ with immediate local update
  const handleDelete = async () => {
    if (!faqToDelete) return;
    
    // Remove from localFilteredFaqs immediately
    setLocalFilteredFaqs(prev => prev.filter(faq => faq.id !== faqToDelete));
    setDeleteModalOpen(false);
    
    setLoading(true);
    const { error } = await supabase.from("faq").delete().eq("id", faqToDelete);
    
    if (error) {
      console.error(error);
      toast.error("Failed to delete FAQ");
      fetchFaqs();
    } else {
      toast.success("FAQ deleted successfully");
      setFaqs(prev => prev.filter(faq => faq.id !== faqToDelete));
    }
    setLoading(false);
    setFaqToDelete(null);
  };

  // Open delete modal
  const openDeleteModal = (id: number) => {
    setFaqToDelete(id);
    setDeleteModalOpen(true);
  };

  // Edit FAQ
  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsBrand(faq.is_brand);
    setIsFormModalOpen(true);
  };

  // Open add FAQ modal
  const openAddModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/20 via-indigo-100/20 to-purple-100/20 opacity-60"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl animate-pulse opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/30 to-pink-300/20 rounded-full blur-3xl animate-pulse opacity-30"></div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <HelpCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
                  <p className="text-gray-600 mt-1">Manage frequently asked questions for Brands and Opportunities</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => openAddModal()}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New FAQ
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Edit3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brand FAQs</p>
                <p className="text-2xl font-bold text-gray-900">{faqs.filter(faq => faq.is_brand === true).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opportunity FAQs</p>
                <p className="text-2xl font-bold text-gray-900">{faqs.filter(faq => faq.is_brand === false).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40 p-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowBrands(true)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  showBrands
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Brand FAQs ({faqs.filter(faq => faq.is_brand === true).length})
              </button>
              <button
                onClick={() => setShowBrands(false)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !showBrands
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Opportunity FAQs ({faqs.filter(faq => faq.is_brand === false).length})
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1001]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingId ? "Edit FAQ" : "Add New FAQ"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the frequently asked question..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer *
                    </label>
                    <textarea
                      placeholder="Provide a comprehensive answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FAQ Type *
                    </label>
                    <select
                      value={isBrand ? "brand" : "opportunity"}
                      onChange={(e) => setIsBrand(e.target.value === "brand")}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="brand">Brand</option>
                      <option value="opportunity">Opportunity</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {loading ? "Saving..." : editingId ? "Update FAQ" : "Add FAQ"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setFaqToDelete(null);
          }}
          onConfirm={handleDelete}
          title="Delete FAQ"
          message="Are you sure you want to delete this FAQ? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
          cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
        />

        {/* FAQ List */}
        <div className={`space-y-4 transition-all duration-200 ${isDragging ? 'select-none' : ''}`}>
          {loading && !isFormModalOpen ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : localFilteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/40">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No {showBrands ? 'Brand' : 'Opportunity'} FAQs yet
              </h3>
              <p className="text-gray-500">
                Start by adding your first {showBrands ? 'brand' : 'opportunity'} FAQ to help users find answers quickly
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={localFilteredFaqs.map((faq: FAQItem) => faq.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {localFilteredFaqs.map((faq: FAQItem, index: number) => (
                    <div key={faq.id} className="animate-fadeIn">
                      <SortableFAQItem
                        faq={faq}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={openDeleteModal}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Smooth drag overlay styles */
        .dndkit-drag-overlay {
          transform-origin: center;
          transition: transform 200ms ease;
        }
        
        /* Enhanced hover effects */
        .faq-item:hover {
          transform: translateY(-2px) scale(1.01);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Smooth drag handle animation */
        .drag-handle {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .drag-handle:hover {
          transform: scale(1.1);
        }
        
        .drag-handle:active {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ManageFaq;