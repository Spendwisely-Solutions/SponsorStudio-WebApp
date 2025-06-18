import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { FileText } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ReportsTabProps {
  opportunityIds: string[];
}

type Report = Database['public']['Tables']['reports']['Row'] & {
  opportunities: { title: string | null };
};

function ReportsTab({ opportunityIds }: ReportsTabProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (opportunityIds.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            opportunities:opportunity_id (
              title
            )
          `)
          .in('opportunity_id', opportunityIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        alert('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [opportunityIds]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton height={24} width="50%" className="mb-4" />
            <Skeleton count={3} height={16} className="mb-2" />
            <Skeleton height={12} width="30%" className="mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          No reports available for your matched opportunities.
        </p>
      </div>
    );
  }

  return (
    <></>
  );
}

export default ReportsTab;