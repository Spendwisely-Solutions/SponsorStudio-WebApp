import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  Clock,
  RefreshCw,
  Building2,
  Globe,
  Phone,
  Mail,
  Tag,
  Target,
  Clock8,
  Footprints,
  Users2,
  CalendarRange,
  FileText as FileIcon,
  ExternalLink,
  Search,
  FileSpreadsheet,
  Pause,
  Trash2,
  Hash,
  Video,
  Upload,
  File,
  Sparkles,
  Eye
} from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Opportunity = Database['public']['Tables']['opportunities']['Row'] & {
  creator_profile: (Database['public']['Tables']['profiles']['Row'] & { email?: string }) | null;
  categories: Database['public']['Tables']['categories']['Row'] | null;
  type: 'opportunity';
  report: Database['public']['Tables']['reports']['Row'] | null;
  mou_id: string | null;
  mou_url: string | null;
  impression_count?: number;
};

type Post = Database['public']['Tables']['posts']['Row'] & {
  influencer_profile: (Database['public']['Tables']['profiles']['Row'] & { email?: string }) | null;
  categories: Database['public']['Tables']['categories']['Row'] | null;
  type: 'post';
  impression_count?: number;
};

type CombinedItem = Opportunity | Post;

interface OpportunitiesProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  setStats: (stats: Partial<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>) => void;
}

export default function Opportunities({ searchTerm, setSearchTerm, stats, setStats }: OpportunitiesProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const [sheetLinkInput, setSheetLinkInput] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'opportunity' | 'post' } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportOpportunityId, setReportOpportunityId] = useState<string | null>(null);
  const [isUpdateReport, setIsUpdateReport] = useState(false);
  const [isMouModalOpen, setIsMouModalOpen] = useState(false);
  const [mouFile, setMouFile] = useState<File | null>(null);
  const [mouOpportunityId, setMouOpportunityId] = useState<string | null>(null);
  const [isUpdateMou, setIsUpdateMou] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      // Fetch opportunities with reports and mou_url
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select(`
          *,
          creator_profile:creator_id (*),
          categories:category_id (*),
          report:reports!reports_opportunity_id_fkey (id, pdf_path, filename, created_at)
        `);

      if (opportunitiesError) {
        throw new Error(`Failed to fetch opportunities: ${opportunitiesError.message}`);
      }

      // Fetch impression counts for opportunities
      const opportunityIds = opportunitiesData?.map(opp => opp.id) ?? [];
      let opportunityImpressions: Record<string, number> = {};
      if (opportunityIds.length > 0) {
        const { data: impressionsData, error: impressionsError } = await supabase
          .from('impressions')
          .select('entity_id') // Updated from target_id to entity_id
          .eq('target_type', 'opportunity')
          .in('entity_id', opportunityIds);

        if (impressionsError) {
          console.warn(`Error fetching opportunity impressions: ${impressionsError.message}`);
          // Fallback to zero impressions
          opportunityImpressions = opportunityIds.reduce((acc, id) => {
            acc[id] = 0;
            return acc;
          }, {} as Record<string, number>);
        } else {
          opportunityImpressions = impressionsData?.reduce((acc, curr) => {
            acc[curr.entity_id] = (acc[curr.entity_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
        }
      }

      const normalizedOpportunities = (opportunitiesData ?? []).map(opp => ({
        ...opp,
        verification_status: opp.verification_status?.trim().toLowerCase() ?? 'pending',
        type: 'opportunity' as const,
        report: opp.report || null,
        mou_id: opp.mou_id || null,
        mou_url: opp.mou_url || null,
        impression_count: opportunityImpressions[opp.id] || 0
      }));

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          influencer_profile:influencer_id (*),
          categories:category_id (*)
        `);

      if (postsError) {
        throw new Error(`Failed to fetch posts: ${postsError.message}`);
      }

      // Fetch impression counts for posts
      const postIds = postsData?.map(post => post.id) ?? [];
      let postImpressions: Record<string, number> = {};
      if (postIds.length > 0) {
        const { data: impressionsData, error: impressionsError } = await supabase
          .from('impressions')
          .select('entity_id') // Updated from target_id to entity_id
          .eq('target_type', 'post')
          .in('entity_id', postIds);

        if (impressionsError) {
          console.warn(`Error fetching post impressions: ${impressionsError.message}`);
          // Fallback to zero impressions
          postImpressions = postIds.reduce((acc, id) => {
            acc[id] = 0;
            return acc;
          }, {} as Record<string, number>);
        } else {
          postImpressions = impressionsData?.reduce((acc, curr) => {
            acc[curr.entity_id] = (acc[curr.entity_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
        }
      }

      const normalizedPosts = (postsData ?? []).map(post => ({
        ...post,
        verification_status: post.verification_status?.trim().toLowerCase() ?? 'pending',
        type: 'post' as const,
        impression_count: postImpressions[post.id] || 0
      }));

      // Combine and filter data
      const combinedData: CombinedItem[] = [...normalizedOpportunities, ...normalizedPosts];

      if (!combinedData.length) {
        setItems([]);
        return;
      }

      const filteredData = filter === 'all' 
        ? combinedData 
        : combinedData.filter(item => item.verification_status === filter);

      // Fetch emails for creators and influencers
      const itemsWithEmails = await Promise.all(
        filteredData.map(async (item: CombinedItem) => {
          const userId = item.type === 'opportunity' ? item.creator_id : item.influencer_id;
          if (!userId) {
            return {
              ...item,
              [item.type === 'opportunity' ? 'creator_profile' : 'influencer_profile']: {
                ...(item.type === 'opportunity' ? item.creator_profile : item.influencer_profile),
                email: 'Not set'
              }
            };
          }

          try {
            const { data: emailData, error: emailError } = await supabase.functions.invoke('get-user-email', {
              body: { userId }
            });

            if (emailError) {
              console.warn(`Error fetching email for user ${userId}: ${emailError.message}`);
              return {
                ...item,
                [item.type === 'opportunity' ? 'creator_profile' : 'influencer_profile']: {
                  ...(item.type === 'opportunity' ? item.creator_profile : item.influencer_profile),
                  email: 'Not set'
                }
              };
            }

            return {
              ...item,
              [item.type === 'opportunity' ? 'creator_profile' : 'influencer_profile']: {
                ...(item.type === 'opportunity' ? item.creator_profile : item.influencer_profile),
                email: emailData?.email || 'Not set'
              }
            };
          } catch (error) {
            console.warn(`Failed to fetch email for user ${userId}: ${String(error)}`);
            return item;
          }
        })
      );

      setItems(itemsWithEmails);

      // Update stats
      const { data: opportunitiesStats, error: opportunitiesStatsError } = await supabase
        .from('opportunities')
        .select('verification_status');

      const { data: postsStats, error: postsStatsError } = await supabase
        .from('posts')
        .select('verification_status');

      if (opportunitiesStatsError || postsStatsError) {
        throw new Error(`Failed to fetch stats: ${opportunitiesStatsError?.message || postsStatsError?.message}`);
      }

      const totalStats = [...(opportunitiesStats ?? []), ...(postsStats ?? [])].map(item => ({
        verification_status: item.verification_status?.trim().toLowerCase() ?? 'pending'
      }));

      setStats({
        total: totalStats.length,
        pending: totalStats.filter(o => o.verification_status === 'pending').length,
        approved: totalStats.filter(o => o.verification_status === 'approved').length,
        rejected: totalStats.filter(o => o.verification_status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching items:', String(error));
      toast.error('Failed to load items. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: 'opportunity' | 'post') => {
    try {
      setProcessingAction(id);

      const table = type === 'opportunity' ? 'opportunities' : 'posts';
      const rpcFunction = type === 'opportunity' ? 'approve_opportunity' : 'approve_post';

      const { data: currentItem, error: checkError } = await supabase
        .from(table)
        .select('verification_status')
        .eq('id', id)
        .single();

      if (checkError || !currentItem) {
        throw new Error(`${type} not found`);
      }
      if (currentItem.verification_status?.trim().toLowerCase() !== 'pending') {
        throw new Error(`${type} is not pending`);
      }

      const { error: updateError } = await supabase.rpc(rpcFunction, {
        [`${type}_id`]: id
      });

      if (updateError) throw new Error(`Failed to approve ${type}: ${updateError.message}`);

      const { data: verifyData, error: verifyError } = await supabase
        .from(table)
        .select('verification_status, is_verified')
        .eq('id', id)
        .single();

      if (verifyError || !verifyData || verifyData.verification_status?.trim().toLowerCase() !== 'approved' || !verifyData.is_verified) {
        throw new Error(`Failed to verify ${type} approval`);
      }

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, verification_status: 'approved', is_verified: true, rejection_reason: null }
            : item
        )
      );

      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }));

      toast.success(`${type} approved successfully`);
      await fetchItems();
    } catch (error) {
      console.error(`Error approving ${type}:`, String(error));
      toast.error(`Failed to approve ${type}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setExpandedItem(null);
    }
  };

  const handleReject = async (id: string, type: 'opportunity' | 'post') => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessingAction(id);

      const table = type === 'opportunity' ? 'opportunities' : 'posts';
      const rpcFunction = type === 'opportunity' ? 'reject_opportunity' : 'reject_post';

      const { data: currentItem, error: checkError } = await supabase
        .from(table)
        .select('verification_status')
        .eq('id', id)
        .single();

      if (checkError || !currentItem) {
        throw new Error(`${type} not found`);
      }
      if (currentItem.verification_status?.trim().toLowerCase() !== 'pending') {
        throw new Error(`${type} is not pending`);
      }

      const { error: updateError } = await supabase.rpc(rpcFunction, {
        [`${type}_id`]: id,
        reason: rejectionReason
      });

      if (updateError) throw new Error(`Failed to reject ${type}: ${updateError.message}`);

      const { data: verifyData, error: verifyError } = await supabase
        .from(table)
        .select('verification_status, is_verified, rejection_reason')
        .eq('id', id)
        .single();

      if (verifyError || !verifyData || verifyData.verification_status?.trim().toLowerCase() !== 'rejected') {
        throw new Error(`Failed to verify ${type} rejection`);
      }

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, verification_status: 'rejected', is_verified: false, rejection_reason: rejectionReason }
            : item
        )
      );

      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1
      }));

      toast.success(`${type} rejected successfully`);
      await fetchItems();
    } catch (error) {
      console.error(`Error rejecting ${type}:`, String(error));
      toast.error(`Failed to reject ${type}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setRejectionReason('');
      setExpandedItem(null);
    }
  };

  const handleUpdateSheetLink = async (id: string, type: 'opportunity' | 'post') => {
    const sheetLink = sheetLinkInput[id]?.trim();
    
    if (sheetLink && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(sheetLink)) {
      toast.error('Invalid URL format');
      return;
    }

    try {
      setProcessingAction(id);

      const table = type === 'opportunity' ? 'opportunities' : 'posts';

      const { error } = await supabase
        .from(table)
        .update({ sheetlink: sheetLink || null })
        .eq('id', id)
        .eq('verification_status', 'approved');

      if (error) throw new Error(`Failed to update sheet link: ${error.message}`);

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, sheetlink: sheetLink || null } : item
        )
      );

      toast.success('Spreadsheet link updated successfully');
      setSheetLinkInput(prev => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error(`Error updating sheet link for ${type}:`, String(error));
      toast.error('Failed to update sheet link. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTogglePause = async (id: string, type: 'opportunity' | 'post', currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      setProcessingAction(id);

      const table = type === 'opportunity' ? 'opportunities' : 'posts';

      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id)
        .eq('verification_status', 'approved');

      if (error) throw new Error(`Failed to update ${type} status: ${error.message}`);

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      toast.success(`${type} ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`);
    } catch (error) {
      console.error(`Error toggling ${type} status:`, String(error));
      toast.error(`Failed to update ${type} status. Please try again.`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDelete = async (id: string, type: 'opportunity' | 'post') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setProcessingAction(itemToDelete.id);

      const table = itemToDelete.type === 'opportunity' ? 'opportunities' : 'posts';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id)
        .eq('verification_status', 'approved');

      if (error) throw new Error(`Failed to delete ${itemToDelete.type}: ${error.message}`);

      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));

      setStats(prev => ({
        ...prev,
        approved: Math.max(0, prev.approved - 1),
        total: Math.max(0, prev.total - 1)
      }));

      toast.success(`${itemToDelete.type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, String(error));
      toast.error(`Failed to delete ${itemToDelete.type}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setExpandedItem(null);
    }
  };

  const handleCreateReport = async () => {
    if (!reportFile || !reportOpportunityId) {
      toast.error('Please select a PDF file');
      return;
    }

    if (reportFile.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return;
    }

    if (reportFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setProcessingAction(reportOpportunityId);

      const { data: existingReport, error: fetchError } = await supabase
        .from('reports')
        .select('id, pdf_path')
        .eq('opportunity_id', reportOpportunityId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing report: ${fetchError.message}`);
      }

      if (existingReport?.id) {
        const { error: storageError } = await supabase.storage
          .from('reports')
          .remove([existingReport.pdf_path]);

        if (storageError) {
          throw new Error(`Failed to delete existing report file: ${storageError.message}`);
        }

        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .eq('id', existingReport.id);

        if (deleteError) {
          throw new Error(`Failed to delete existing report record: ${deleteError.message}`);
        }
      }

      const fileName = `${reportOpportunityId}_${Date.now()}.pdf`;
      const filePath = `${reportOpportunityId}/${fileName}`;
      const arrayBuffer = await reportFile.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (uploadError) {
        throw new Error(`Failed to upload report: ${uploadError.message}`);
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          opportunity_id: reportOpportunityId,
          pdf_path: filePath,
          filename: reportFile.name,
        });

      if (insertError) {
        // Rollback: Delete uploaded file if database insert fails
        await supabase.storage.from('reports').remove([filePath]);
        throw new Error(`Failed to insert report record: ${insertError.message}`);
      }

      toast.success(`Report ${isUpdateReport ? 'updated' : 'created'} successfully`);
      await fetchItems();
    } catch (error) {
      console.error('Error handling report:', String(error));
      toast.error(`Failed to ${isUpdateReport ? 'update' : 'create'} report. Please try again.`);
    } finally {
      setProcessingAction(null);
      setIsReportModalOpen(false);
      setReportFile(null);
      setReportOpportunityId(null);
      setIsUpdateReport(false);
    }
  };

  const handleCreateMou = async () => {
    if (!mouFile || !mouOpportunityId) {
      toast.error('Please select a PDF file');
      return;
    }

    if (mouFile.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return;
    }

    if (mouFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setProcessingAction(mouOpportunityId);

      const { data: existingMou, error: fetchError } = await supabase
        .from('opportunities')
        .select('mou_url')
        .eq('id', mouOpportunityId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to check existing MOU: ${fetchError.message}`);
      }

      if (existingMou?.mou_url) {
        const { error: storageError } = await supabase.storage
          .from('mou-documents')
          .remove([existingMou.mou_url]);

        if (storageError) {
          throw new Error(`Failed to delete existing MOU file: ${storageError.message}`);
        }
      }

      const fileName = `${mouOpportunityId}_${Date.now()}.pdf`;
      const filePath = `${mouOpportunityId}/${fileName}`;
      const arrayBuffer = await mouFile.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('mou-documents')
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (uploadError) {
        throw new Error(`Failed to upload MOU: ${uploadError.message}`);
      }

      const { error: updateError } = await supabase
        .from('opportunities')
        .update({
          mou_url: filePath
        })
        .eq('id', mouOpportunityId);

      if (updateError) {
        // Rollback: Delete uploaded file if database update fails
        await supabase.storage.from('mou-documents').remove([filePath]);
        throw new Error(`Failed to update MOU URL: ${updateError.message}`);
      }

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === mouOpportunityId && item.type === 'opportunity'
            ? { ...item, mou_url: filePath }
            : item
        )
      );

      toast.success(`MOU ${isUpdateMou ? 'updated' : 'uploaded'} successfully`);
      await fetchItems();
    } catch (error) {
      console.error('Error handling MOU:', String(error));
      toast.error(`Failed to ${isUpdateMou ? 'update' : 'upload'} MOU. Please try again.`);
    } finally {
      setProcessingAction(null);
      setIsMouModalOpen(false);
      setMouFile(null);
      setMouOpportunityId(null);
      setIsUpdateMou(false);
    }
  };

  const openReportModal = async (opportunityId: string) => {
    try {
      setReportOpportunityId(opportunityId);
      setReportFile(null);

      const { data: existingReport, error } = await supabase
        .from('reports')
        .select('id, filename, created_at')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to check report: ${error.message}`);
      }

      setIsUpdateReport(!!existingReport);
      setIsReportModalOpen(true);
    } catch (error) {
      console.error('Error opening report modal:', String(error));
      toast.error('Failed to open report modal. Please try again.');
    }
  };

  const openMouModal = async (opportunityId: string) => {
    try {
      setMouOpportunityId(opportunityId);
      setMouFile(null);

      const { data: existingMou, error } = await supabase
        .from('opportunities')
        .select('mou_url')
        .eq('id', opportunityId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to check existing MOU: ${error.message}`);
      }

      setIsUpdateMou(!!existingMou?.mou_url);
      setIsMouModalOpen(true);
    } catch (error) {
      console.error('Error opening MOU modal:', String(error));
      toast.error('Failed to open MOU modal. Please try again.');
    }
  };

  const handleViewMou = (mouId: string) => {
    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(mouId)) {
      toast.error('Invalid MOU ID format');
      return;
    }
    navigate('/view-mou', { state: { mouId } });
  };

  const getReportUrl = (pdfPath: string): string => {
    const { data } = supabase.storage.from('reports').getPublicUrl(pdfPath);
    return data.publicUrl;
  };

  const getMouUrl = (pdfPath: string): string => {
    const { data } = supabase.storage.from('mou-documents').getPublicUrl(pdfPath);
    return data.publicUrl;
  };

  const handleRefresh = () => {
    fetchItems();
  };

  const handleVideoError = (mediaUrl: string) => {
    setVideoErrors(prev => ({ ...prev, [mediaUrl]: true }));
  };

  const formatPrice = (priceRange: any): string => {
    if (!priceRange || typeof priceRange !== 'object') return 'Price not set';
    const min = Number(priceRange.min) || 0;
    const max = Number(priceRange.max) || 0;
    if (min === 0 && max === 0) return 'Price not set';
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const formatPeakHours = (peakHours: any): string => {
    if (!peakHours || typeof peakHours !== 'object') return 'Not specified';
    const { start, end } = peakHours;
    if (!start || !end) return 'Not specified';
    return `${start} - ${end}`;
  };

  const formatDemographics = (demographics: any): string => {
    if (!demographics || typeof demographics !== 'object') return 'Not specified';
    const details: string[] = [];
    if (demographics.age_range) {
      details.push(`Age: ${demographics.age_range.min}-${demographics.age_range.max}`);
    }
    if (demographics.gender) {
      details.push(`Gender: ${demographics.gender}`);
    }
    if (demographics.income_level) {
      details.push(`Income: ${demographics.income_level}`);
    }
    return details.length ? details.join(', ') : 'Not specified';
  };

  const filteredItems = items.filter(item => {
    const title = item.title?.toLowerCase() ?? '';
    const profileName = item.type === 'opportunity' 
      ? item.creator_profile?.company_name?.toLowerCase() ?? ''
      : item.influencer_profile?.company_name?.toLowerCase() ?? '';
    const location = (item as Opportunity).location?.toLowerCase() ?? '';
    const hashtags = (item as Post).hashtags?.toLowerCase() ?? '';
    const term = searchTerm.toLowerCase();
    return title.includes(term) || profileName.includes(term) || location.includes(term) || hashtags.includes(term);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities & Posts</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search opportunities or posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto text-yellow-500" size={48} />
            <p className="mt-4 text-gray-600">No items found</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const isOpportunity = item.type === 'opportunity';
              const profile = isOpportunity ? (item as Opportunity).creator_profile : (item as Post).influencer_profile;
              return (
                <div key={item.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title || 'Untitled'}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' : 
                          item.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status ? `${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}` : 'Unknown'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.verification_status ? `${item.verification_status.charAt(0).toUpperCase()}${item.verification_status.slice(1)}` : 'Pending'}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {isOpportunity ? 'Opportunity' : 'Post'}
                        </span>
                        {isOpportunity && (item as Opportunity).is_vip && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            VIP
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                          {isOpportunity ? (
                            <>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={16} className="mr-2 flex-shrink-0" />
                                {(item as Opportunity).location || 'N/A'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarRange size={16} className="mr-2 flex-shrink-0" />
                                {(item as Opportunity).start_date && (item as Opportunity).end_date 
                                  ? `${new Date((item as Opportunity).start_date).toLocaleDateString()} - ${new Date((item as Opportunity).end_date).toLocaleDateString()}`
                                  : 'Dates not set'}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Hash size={16} className="mr-2 flex-shrink-0" />
                              {(item as Post).hashtags || 'No hashtags'}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign size={16} className="mr-2 flex-shrink-0" />
                            {formatPrice(item.price_range)}
                          </div>
                          {item.reach && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Users size={16} className="mr-2 flex-shrink-0" />
                              {item.reach.toLocaleString()} reach
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).footfall && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Footprints size={16} className="mr-2 flex-shrink-0" />
                              {(item as Opportunity).footfall.toLocaleString()} footfall
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye size={16} className="mr-2 flex-shrink-0" />
                            {item.impression_count !== undefined ? `${item.impression_count.toLocaleString()} impressions` : 'Loading...'}
                          </div>
                          {isOpportunity && (item as Opportunity).is_vip && (
                            <div className="flex items-center text-sm font-medium text-amber-700">
                              <Sparkles size={16} className="mr-2 flex-shrink-0 text-amber-500" />
                              VIP Privileged Opportunity
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {isOpportunity && (item as Opportunity).ad_type && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag size={16} className="mr-2 flex-shrink-0" />
                              Ad Type: {(item as Opportunity).ad_type}
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).ad_duration && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock8 size={16} className="mr-2 flex-shrink-0" />
                              Duration: {(item as Opportunity).ad_duration}
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).ad_dimensions && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Target size={16} className="mr-2 flex-shrink-0" />
                              Dimensions: {(item as Opportunity).ad_dimensions}
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).peak_hours && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock size={16} className="mr-2 flex-shrink-0" />
                              Peak Hours: {formatPeakHours((item as Opportunity).peak_hours)}
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).target_demographics && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Users2 size={16} className="mr-2 flex-shrink-0" />
                              Demographics: {formatDemographics((item as Opportunity).target_demographics)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {isOpportunity && (item as Opportunity).calendly_link && (
                            <div className="flex items-center text-sm text-blue-600">
                              <Calendar size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                href={(item as Opportunity).calendly_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center"
                              >
                                Calendly Link
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).sponsorship_brochure_url && (
                            <div className="flex items-center text-sm text-blue-600">
                              <FileIcon size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                href={(item as Opportunity).sponsorship_brochure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center"
                              >
                                Sponsorship Brochure
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </div>
                          )}
                          {item.sheetlink && (
                            <div className="flex items-center text-sm text-blue-600">
                              <FileSpreadsheet size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                href={item.sheetlink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center"
                              >
                                Spreadsheet Link
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).media_urls?.length && (
                            <div className="flex items-center text-sm text-blue-600">
                              <LinkIcon size={16} className="mr-2 flex-shrink-0" />
                              <span>{(item as Opportunity).media_urls.length} Media Files</span>
                            </div>
                          )}
                          {!isOpportunity && (item as Post).video_url && (
                            <div className="flex items-center text-sm text-blue-600">
                              <Video size={16} className="mr-2 flex-shrink-0" />
                              <span>Video Content</span>
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).report?.pdf_path && (
                            <div className="flex items-center text-sm text-blue-600">
                              <File size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                href={getReportUrl((item as Opportunity).report!.pdf_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                type="application/pdf"
                                className="hover:underline flex items-center"
                              >
                                View Report
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                              <span className="ml-2 text-xs text-gray-500">
                                (Added: {(item as Opportunity).report!.created_at 
                                  ? new Date((item as Opportunity).report!.created_at).toLocaleDateString() 
                                  : 'Unknown date'})
                              </span>
                            </div>
                          )}
                          {isOpportunity && (item as Opportunity).is_vip && (item as Opportunity).mou_url && (
                            <div className="flex items-center text-sm text-blue-600">
                              <FileText size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                href={getMouUrl((item as Opportunity).mou_url!)}
                                target="_blank"
                                rel="noopener noreferrer"
                                type="application/pdf"
                                className="hover:underline flex items-center"
                              >
                                View MOU (PDF)
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </div>
                          )}
                          {isOpportunity && !(item as Opportunity).is_vip && (item as Opportunity).mou_id && (
                            <div className="flex items-center text-sm text-blue-600">
                              <FileText size={16} className="mr-2 flex-shrink-0" />
                              <a 
                                onClick={() => handleViewMou((item as Opportunity).mou_id!)}
                                className="hover:underline flex items-center cursor-pointer"
                              >
                                View MOU
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(item.id, item.type)}
                            disabled={processingAction === item.id}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            {processingAction === item.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setExpandedItem(item.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setExpandedItem(item.id === expandedItem ? null : item.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {item.id === expandedItem ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                  {item.id === expandedItem && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Description & Details</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                              <p className="text-gray-600">{item.description || 'N/A'}</p>
                            </div>
                            {isOpportunity && (item as Opportunity).requirements && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements</h5>
                                <p className="text-gray-600">{(item as Opportunity).requirements}</p>
                              </div>
                            )}
                            {isOpportunity && (item as Opportunity).benefits && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits</h5>
                                <p className="text-gray-600">{(item as Opportunity).benefits}</p>
                              </div>
                            )}
                            {isOpportunity && (item as Opportunity).is_vip && (
                              <div className="mt-4">
                                <div className="flex items-center">
                                  <Sparkles size={18} className="text-amber-500 mr-2" />
                                  <h5 className="text-sm font-medium text-amber-800">VIP Privilege Information</h5>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                                  <p className="text-gray-700 mb-2">This opportunity has VIP privileges, which include:</p>
                                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                                    <li>24/7 dedicated support</li>
                                    <li>Premium sponsor access</li>
                                    <li>Priority placement in search results</li>
                                    <li>Upfront fee of ₹10,000</li>
                                    <li>25% commission on sponsorships over ₹2 lakhs</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">{isOpportunity ? 'Creator' : 'Influencer'} Details</h4>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Building2 size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-medium text-gray-900">{profile?.company_name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{profile?.industry || 'N/A'}</p>
                              </div>
                            </div>
                            {profile?.email && profile.email !== 'Not set' && (
                              <div className="flex items-center space-x-3">
                                <Mail size={20} className="text-gray-400" />
                                <p className="text-gray-900">{profile.email}</p>
                              </div>
                            )}
                            {profile?.website && (
                              <div className="flex items-center space-x-3">
                                <Globe size={20} className="text-gray-400" />
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {profile.website}
                                </a>
                              </div>
                            )}
                            {profile?.contact_person_name && (
                              <div className="flex items-center space-x-3">
                                <Users size={20} className="text-gray-400" />
                                <div>
                                  <p className="text-gray-900">{profile.contact_person_name}</p>
                                  <p className="text-sm text-gray-500">{profile.contact_person_position || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                            {profile?.contact_person_phone && (
                              <div className="flex items-center space-x-3">
                                <Phone size={20} className="text-gray-400" />
                                <p className="text-gray-900">{profile.contact_person_phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {isOpportunity && (item as Opportunity).media_urls?.length && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Media</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(item as Opportunity).media_urls.map((mediaUrl, index) => {
                              const isImage = /\.(jpg|jpeg|png|gif)$/i.test(mediaUrl);
                              const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
                              const hasVideoError = videoErrors[mediaUrl];
                              return (
                                <div key={index} className="border rounded-lg p-2">
                                  {isImage ? (
                                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                                      <img src={mediaUrl} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded" />
                                    </a>
                                  ) : isVideo && !hasVideoError ? (
                                    <video
                                      controls
                                      className="w-full h-32 object-cover rounded"
                                      onError={() => handleVideoError(mediaUrl)}
                                    >
                                      <source src={mediaUrl} type={`video/${mediaUrl.split('.').pop()?.toLowerCase()}`} />
                                      Video not supported
                                    </video>
                                  ) : (
                                    <a
                                      href={mediaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center"
                                    >
                                      {hasVideoError ? 'Video failed to load' : `Media ${index + 1}`}
                                      <ExternalLink size={12} className="ml-1" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {!isOpportunity && (item as Post).video_url && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Video</h4>
                          <div className="border rounded-lg p-2">
                            {videoErrors[(item as Post).video_url] ? (
                              <a
                                href={(item as Post).video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                Video failed to load
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            ) : (
                              <video
                                controls
                                className="w-full h-32 object-cover rounded"
                                onError={() => handleVideoError((item as Post).video_url)}
                              >
                                <source src={(item as Post).video_url} type="video/mp4" />
                                Video not supported
                              </video>
                            )}
                          </div>
                        </div>
                      )}
                      {item.verification_status === 'pending' && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Rejection Reason</h4>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                          />
                          <div className="mt-4 flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setExpandedItem(null);
                                setRejectionReason('');
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReject(item.id, item.type)}
                              disabled={!rejectionReason.trim() || processingAction === item.id}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                              {processingAction === item.id ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                          </div>
                        </div>
                      )}
                      {item.verification_status === 'approved' && (
                        <>
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Spreadsheet Link</h4>
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={sheetLinkInput[item.id] || item.sheetlink || ''}
                                onChange={(e) => setSheetLinkInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Enter spreadsheet link..."
                              />
                              <button
                                onClick={() => handleUpdateSheetLink(item.id, item.type)}
                                disabled={processingAction === item.id}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                              >
                                {processingAction === item.id ? 'Processing...' : item.sheetlink ? 'Update' : 'Add'}
                              </button>
                            </div>
                          </div>
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-4">{isOpportunity ? 'Opportunity' : 'Post'} Management</h4>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => handleTogglePause(item.id, item.type, item.status)}
                                disabled={processingAction === item.id}
                                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                              >
                                <Pause size={16} className="mr-2" />
                                {processingAction === item.id ? 'Processing...' : 
                                  item.status === 'active' ? `Pause ${isOpportunity ? 'Opportunity' : 'Post'}` : `Resume ${isOpportunity ? 'Opportunity' : 'Post'}`}
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.type)}
                                disabled={processingAction === item.id}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                              >
                                <Trash2 size={16} className="mr-2" />
                                {processingAction === item.id ? 'Processing...' : `Delete ${isOpportunity ? 'Opportunity' : 'Post'}`}
                              </button>
                              {isOpportunity && (
                                <button
                                  onClick={() => openReportModal(item.id)}
                                  disabled={processingAction === item.id}
                                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                  <Upload size={16} className="mr-2" />
                                  {(item as Opportunity).report ? 'Update Report' : 'Create Report'}
                                </button>
                              )}
                              {isOpportunity && (item as Opportunity).is_vip && (
                                <button
                                  onClick={() => openMouModal(item.id)}
                                  disabled={processingAction === item.id}
                                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                  <Upload size={16} className="mr-2" />
                                  {(item as Opportunity).mou_url ? 'Update MOU' : 'Upload MOU'}
                                </button>
                              )}
                              {isOpportunity && !(item as Opportunity).is_vip && (item as Opportunity).mou_id && (
                                <button
                                  onClick={() => handleViewMou((item as Opportunity).mou_id!)}
                                  disabled={processingAction === item.id}
                                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                  <FileText size={16} className="mr-2" />
                                  View MOU
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${itemToDelete?.type ?? 'item'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportFile(null);
          setReportOpportunityId(null);
          setIsUpdateReport(false);
        }}
        onConfirm={handleCreateReport}
        title={isUpdateReport ? 'Update Report' : 'Create Report'}
        message={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 cursor-pointer bg-gray-100 border border-gray-300 rounded-lg p-3 hover:bg-gray-200">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => e.target.files && setReportFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex items-center text-gray-600">
                    <Upload size={20} className="mr-2" />
                    <span>{reportFile ? reportFile.name : 'Choose PDF'}</span>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a PDF (max 10MB). {isUpdateReport ? 'This will replace the existing report.' : 'Each opportunity can have only one report.'}
              </p>
            </div>
          </div>
        }
        confirmText={processingAction ? 'Uploading...' : isUpdateReport ? 'Update' : 'Create'}
        cancelText="Cancel"
        confirmDisabled={processingAction !== null || !reportFile}
      />

      <Modal
        isOpen={isMouModalOpen}
        onClose={() => {
          setIsMouModalOpen(false);
          setMouFile(null);
          setMouOpportunityId(null);
          setIsUpdateMou(false);
        }}
        onConfirm={handleCreateMou}
        title={isUpdateMou ? 'Update MOU' : 'Upload MOU'}
        message={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 cursor-pointer bg-gray-100 border border-gray-300 rounded-lg p-3 hover:bg-gray-200">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => e.target.files && setMouFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex items-center text-gray-600">
                    <Upload size={20} className="mr-2" />
                    <span>{mouFile ? mouFile.name : 'Choose PDF'}</span>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a PDF (max 10MB). {isUpdateMou ? 'This will replace the existing MOU.' : 'Each VIP opportunity can have only one MOU.'}
              </p>
            </div>
          </div>
        }
        confirmText={processingAction ? 'Uploading...' : isUpdateMou ? 'Update' : 'Upload'}
        cancelText="Cancel"
        confirmDisabled={processingAction !== null || !mouFile}
      />
    </div>
  );
}