import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { GlassCard, Avatar, Skeleton } from '../components/GlassUI';
import { useLanguage } from '../i18n';
import { useUserRole } from '../UserRoleContext';
import { useNavigate } from '@tanstack/react-router';
import { useOffices } from '../features/auth/hooks/useOffices';
import { useToggleLike } from '../features/auth/hooks/useToggleLike';

export const OfficesList: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { userRole } = useUserRole();
  const isSeeker = userRole === 'SEEKER';
  const Icon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const { mutate: toggleLike, isPending, variables } = useToggleLike();

  const [page, setPage] = useState(1);
  const { data: officesResponse, isLoading } = useOffices(page);

  const offices = officesResponse?.data || [];
  const pagination = officesResponse?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = (id: number) => {
    toggleLike({ type: 'office', id });
  };

  return (
    <div className="pb-10 pt-6 px-5">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">{t('offices_title')}</h1>
        <p className="text-xs text-secondary">{t('browse_offices')}</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-20 rounded-[18px]" />
          ))
        ) : offices.length > 0 ? (
          <>
            {offices.map(office => {
              const isThisPending = isPending && variables?.id === office.id;
              const favorite = isThisPending ? !office.is_favourite : office.is_favourite;

              return (
                <GlassCard
                  key={office.id}
                  onClick={() => navigate({ to: '/office/$officeId', params: { officeId: office.id.toString() } } as any)}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={office.image || 'https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png'} alt={office.name} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-primary group-hover:text-brand-500 transition-colors">{office.name}</h3>
                      <p className="text-[10px] text-secondary">{office.state_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isSeeker && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLike(office.id);
                        }}
                        disabled={isThisPending}
                        className={`p-2 rounded-full transition-all ${isThisPending ? 'opacity-50 scale-90' : 'hover:scale-110'} ${favorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:bg-glassHigh'}`}
                      >
                        <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    <div className="w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-primary group-hover:bg-brand-500 group-hover:text-white transition-all">
                      <Icon size={16} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="w-10 h-10 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                >
                  {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
                    let pageNum = page;
                    if (page <= 3) pageNum = i + 1;
                    else if (page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                    else pageNum = page - 2 + i;

                    if (pageNum <= 0 || pageNum > pagination.last_page) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === pageNum
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-glass border border-border text-secondary hover:bg-glassHigh'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === pagination.last_page}
                  onClick={() => handlePageChange(page + 1)}
                  className="w-10 h-10 rounded-xl bg-glass border border-border flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:bg-glassHigh"
                >
                  {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-secondary">
            <p>{t('no_offices_found') || 'No offices found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};