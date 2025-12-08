import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    // Calculate page numbers to display
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            {/* Items info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold text-gray-900 dark:text-white">{startItem}</span> a{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{endItem}</span> de{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> resultados
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Items per page selector */}
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:text-white"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>

                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Primera página"
                >
                    <ChevronsLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                    {startPage > 1 && (
                        <span className="px-3 py-2 text-gray-400">...</span>
                    )}

                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => onPageChange(number)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === number
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <span className="px-3 py-2 text-gray-400">...</span>
                    )}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Última página"
                >
                    <ChevronsRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
