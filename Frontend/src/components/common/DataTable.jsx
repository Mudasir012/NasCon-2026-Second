import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filterOptions = [],
  onRowClick,
  expandableRowRender,
  pageSize = 10,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Handle Sort
  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Toggle Row Expansion
  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((k) => String(item[k] || '').toLowerCase().includes(term));
        }
        return Object.values(item).some((v) =>
          typeof v === 'string' || typeof v === 'number'
            ? String(v).toLowerCase().includes(term)
            : false
        );
      });
    }

    // Secondary Filter (if provided)
    if (activeFilter !== 'all' && filterOptions.length > 0) {
      const opt = filterOptions.find((f) => f.value === activeFilter);
      if (opt && opt.filterFn) {
        result = result.filter(opt.filterFn);
      }
    }

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(String(valB))
            : String(valB).localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, activeFilter, filterOptions, sortKey, sortOrder]);

  // Pagination calculation
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full bg-white border border-[#e8e5de] rounded-lg shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-[#e8e5de] bg-[#faf9f6]">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d3cfc7] rounded-md outline-none focus:border-[#1a1917]"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-[#79756d]" />
          </div>
        </div>

        {filterOptions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={13} className="text-[#79756d]" />
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-[#d3cfc7] rounded-md text-[#1a1917] outline-none"
            >
              <option value="all">All Records</option>
              {filterOptions.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Body */}
      {loading ? (
        <div className="p-4">
          <SkeletonLoader count={pageSize > 5 ? 5 : pageSize} />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            onAction={searchTerm ? () => setSearchTerm('') : undefined}
            actionLabel={searchTerm ? 'Clear Search' : undefined}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f4f2ee] border-b border-[#e8e5de] text-[#79756d] uppercase font-semibold text-[11px] tracking-wider select-none">
              <tr>
                {expandableRowRender && <th className="w-8 px-3 py-2.5 text-center"></th>}
                {columns.map((col) => (
                  <th
                    key={col.key || col.label}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{ width: col.width }}
                    className={`px-4 py-2.5 ${
                      col.sortable !== false ? 'cursor-pointer hover:text-[#1a1917]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span className="text-[#a8a49c]">
                          {sortKey === col.key ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp size={12} className="text-[#1a1917]" />
                            ) : (
                              <ChevronDown size={12} className="text-[#1a1917]" />
                            )
                          ) : (
                            <ChevronsUpDown size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e5de] bg-white">
              {paginatedData.map((row, idx) => {
                const rowId = row.id || idx;
                const isExpanded = expandedRows.has(rowId);
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-[#faf9f6]' : 'hover:bg-[#faf9f6]/60'
                      }`}
                    >
                      {expandableRowRender && (
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => toggleExpand(rowId, e)}
                            className="p-1 rounded hover:bg-[#e8e5de] text-[#79756d] transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key || col.label} className="px-4 py-3 text-[#3c3933]">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                    {expandableRowRender && isExpanded && (
                      <tr className="bg-[#faf9f6]">
                        <td
                          colSpan={columns.length + 1}
                          className="px-6 py-4 border-y border-[#e8e5de]"
                        >
                          {expandableRowRender(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[#e8e5de] bg-[#faf9f6] text-xs text-[#79756d]">
          <div>
            Showing <strong className="text-[#1a1917]">{startIndex + 1}</strong> to{' '}
            <strong className="text-[#1a1917]">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
            <strong className="text-[#1a1917]">{totalItems}</strong> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#d3cfc7] rounded hover:bg-white disabled:opacity-40 text-[#1a1917] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium text-[#1a1917]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[#d3cfc7] rounded hover:bg-white disabled:opacity-40 text-[#1a1917] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
