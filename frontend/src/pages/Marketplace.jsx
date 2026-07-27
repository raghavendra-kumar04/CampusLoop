import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CardSkeleton } from '../components/ui/Skeleton';
import ListingCard from '../components/ListingCard';
import './Marketplace.css';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar state synced with searchParams
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(searchParams.getAll('category'));
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedConditions, setSelectedConditions] = useState(searchParams.getAll('condition'));
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'Most Recent');

  const [displayLimit, setDisplayLimit] = useState(6);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategories(searchParams.getAll('category'));
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedConditions(searchParams.getAll('condition'));
    setSortBy(searchParams.get('sortBy') || 'Most Recent');
  }, [searchParams]);

  // Fetch listings from API when filters change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        const qSearch = searchParams.get('search');
        if (qSearch) params.append('search', qSearch);

        searchParams.getAll('category').forEach(cat => params.append('category', cat));
        
        const qMin = searchParams.get('minPrice');
        if (qMin) params.append('minPrice', qMin);
        
        const qMax = searchParams.get('maxPrice');
        if (qMax) params.append('maxPrice', qMax);

        searchParams.getAll('condition').forEach(cond => params.append('condition', cond));
        
        const qSort = searchParams.get('sortBy');
        if (qSort) {
          if (qSort === 'Price: Low to High') params.append('sortBy', 'price_asc');
          else if (qSort === 'Price: High to Low') params.append('sortBy', 'price_desc');
        }

        const res = await axios.get('/api/listings', { params });
        setListings(res.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    
    const searchVal = newFilters.search !== undefined ? newFilters.search : searchQuery;
    if (searchVal) params.append('search', searchVal);

    const categoriesVal = newFilters.categories !== undefined ? newFilters.categories : selectedCategories;
    categoriesVal.forEach(cat => params.append('category', cat));

    const minVal = newFilters.minPrice !== undefined ? newFilters.minPrice : minPrice;
    if (minVal) params.append('minPrice', minVal);

    const maxVal = newFilters.maxPrice !== undefined ? newFilters.maxPrice : maxPrice;
    if (maxVal) params.append('maxPrice', maxVal);

    const conditionsVal = newFilters.conditions !== undefined ? newFilters.conditions : selectedConditions;
    conditionsVal.forEach(cond => params.append('condition', cond));

    const sortVal = newFilters.sortBy !== undefined ? newFilters.sortBy : sortBy;
    if (sortVal && sortVal !== 'Most Recent') params.append('sortBy', sortVal);

    setSearchParams(params);
    setDisplayLimit(6); // Reset pagination
  };

  const handleCategoryCheckbox = (cat) => {
    let updated;
    if (selectedCategories.includes(cat)) {
      updated = selectedCategories.filter(c => c !== cat);
    } else {
      updated = [...selectedCategories, cat];
    }
    setSelectedCategories(updated);
    updateURL({ categories: updated });
  };

  const handleConditionChip = (cond) => {
    let updated;
    if (cond === 'Any') {
      updated = [];
    } else if (selectedConditions.includes(cond)) {
      updated = selectedConditions.filter(c => c !== cond);
    } else {
      updated = [...selectedConditions, cond];
    }
    setSelectedConditions(updated);
    updateURL({ conditions: updated });
  };

  const clearFilter = (type, value) => {
    if (type === 'category') {
      const updated = selectedCategories.filter(c => c !== value);
      setSelectedCategories(updated);
      updateURL({ categories: updated });
    } else if (type === 'maxPrice') {
      setMaxPrice('');
      updateURL({ maxPrice: '' });
    } else if (type === 'search') {
      setSearchQuery('');
      updateURL({ search: '' });
    }
  };

  const handleLoadMore = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      setDisplayLimit(prev => prev + 6);
      setLoadMoreLoading(false);
    }, 600);
  };

  const categoriesList = ['Electronics', 'Textbooks', 'Furniture', 'Dorm Gear', 'Clothing', 'Other'];
  const conditionsList = ['New', 'Mint', 'Used', 'Boxed', 'Good', 'Fair'];

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-lg py-md md:py-lg min-h-screen">
      <div className="flex flex-col md:flex-row gap-gutter">
        
        {/* Sticky Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-lg">
            
            {/* Categories */}
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Category</h3>
              <div className="space-y-sm">
                {categoriesList.map(cat => (
                  <label key={cat} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryCheckbox(cat)}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                    />
                    <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Price Range</h3>
              <div className="flex gap-xs items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => updateURL({ minPrice })}
                  onKeyDown={(e) => e.key === 'Enter' && updateURL({ minPrice })}
                  className="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary text-on-surface outline-none"
                />
                <span className="text-outline">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => updateURL({ maxPrice })}
                  onKeyDown={(e) => e.key === 'Enter' && updateURL({ maxPrice })}
                  className="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary text-on-surface outline-none"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Condition</h3>
              <div className="flex flex-wrap gap-xs">
                <button
                  onClick={() => handleConditionChip('Any')}
                  className={`px-sm py-xs rounded-full text-sm font-medium transition-all ${
                    selectedConditions.length === 0
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30'
                  }`}
                >
                  Any
                </button>
                {conditionsList.map(cond => (
                  <button
                    key={cond}
                    onClick={() => handleConditionChip(cond)}
                    className={`px-sm py-xs rounded-full text-sm font-medium transition-all ${
                      selectedConditions.includes(cond)
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant transition-colors'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateURL({ sortBy: e.target.value });
                }}
                className="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary text-on-surface outline-none"
              >
                <option>Most Recent</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-md">
          
          {/* Filter Chips & Mobile Controls */}
          <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-xs overflow-x-auto scrollbar-hide py-1">
              
              {/* Search text query chip */}
              {searchQuery && (
                <div className="flex-shrink-0 px-4 py-2 bg-primary text-on-primary rounded-full flex items-center gap-xs text-sm font-medium shadow-sm cursor-pointer">
                  <span>Search: "{searchQuery}"</span>
                  <span onClick={() => clearFilter('search')} className="material-symbols-outlined text-[16px]">close</span>
                </div>
              )}

              {/* Categories filter chips */}
              {selectedCategories.map(cat => (
                <div key={cat} className="flex-shrink-0 px-4 py-2 bg-primary text-on-primary rounded-full flex items-center gap-xs text-sm font-medium shadow-sm cursor-pointer">
                  <span>{cat}</span>
                  <span onClick={() => clearFilter('category', cat)} className="material-symbols-outlined text-[16px]">close</span>
                </div>
              ))}

              {/* Max Price chip */}
              {maxPrice && (
                <div className="flex-shrink-0 px-4 py-2 bg-primary text-on-primary rounded-full flex items-center gap-xs text-sm font-medium shadow-sm cursor-pointer">
                  <span>Under ${maxPrice}</span>
                  <span onClick={() => clearFilter('maxPrice')} className="material-symbols-outlined text-[16px]">close</span>
                </div>
              )}

              {/* Empty visual state option chips */}
              {selectedCategories.length === 0 && !searchQuery && !maxPrice && (
                <>
                  <div
                    onClick={() => updateURL({ categories: ['Textbooks'] })}
                    className="flex-shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-xs text-sm font-medium border border-outline-variant/30 cursor-pointer hover:bg-surface-container-highest transition-colors"
                  >
                    <span>Textbooks</span>
                  </div>
                  <div
                    onClick={() => updateURL({ maxPrice: '50' })}
                    className="flex-shrink-0 px-4 py-2 bg-surface-container-high text-on-surface rounded-full flex items-center gap-xs text-sm font-medium border border-outline-variant/30 cursor-pointer hover:bg-surface-container-highest transition-colors"
                  >
                    <span>Under $50</span>
                  </div>
                </>
              )}

            </div>

            {/* Mobile controls list */}
            <div className="md:hidden flex items-center justify-between border-t border-outline-variant/20 pt-sm">
              <span className="text-sm text-outline">{listings.length} items found</span>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-xs text-primary font-bold text-sm"
              >
                <span className="material-symbols-outlined">tune</span>
                Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-xl flex flex-col items-center justify-center text-center space-y-sm bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-md">
              <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
              <h3 className="font-headline-md text-on-surface">No Listings Found</h3>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                We couldn't find any items matching your criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md" id="product-grid">
                {listings.slice(0, displayLimit).map(listing => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Load More Button */}
              {listings.length > displayLimit && (
                <div className="flex justify-center pt-xl pb-lg">
                  <button
                    id="load-more"
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="px-lg py-3 bg-white border border-primary text-primary font-bold rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 flex items-center gap-sm shadow-md active:scale-95"
                  >
                    {loadMoreLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Items</span>
                        <span className="material-symbols-outlined">expand_more</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* Mobile Drawer filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="w-80 bg-surface-container-lowest h-full relative z-10 flex flex-col p-md shadow-2xl justify-between animate-slide-in">
            <div>
              <div className="flex justify-between items-center pb-sm border-b border-outline-variant/10 mb-md">
                <span className="font-extrabold text-sm uppercase tracking-wider">Filters</span>
                <button onClick={() => setShowMobileFilters(false)}>
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-md overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-1">
                {/* Categories */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface-variant mb-sm uppercase tracking-wider">Category</h3>
                  <div className="grid grid-cols-2 gap-sm">
                    {categoriesList.map(cat => (
                      <label key={cat} className="flex items-center gap-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryCheckbox(cat)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                        />
                        <span className="text-xs font-semibold text-on-surface truncate">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface-variant mb-sm uppercase tracking-wider">Price Range</h3>
                  <div className="flex gap-xs items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={() => updateURL({ minPrice })}
                      className="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs text-on-surface"
                    />
                    <span className="text-outline">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={() => updateURL({ maxPrice })}
                      className="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs text-on-surface"
                    />
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface-variant mb-sm uppercase tracking-wider">Condition</h3>
                  <div className="flex flex-wrap gap-xs">
                    {conditionsList.map(cond => (
                      <button
                        key={cond}
                        onClick={() => handleConditionChip(cond)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedConditions.includes(cond)
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sorting */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface-variant mb-sm uppercase tracking-wider">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateURL({ sortBy: e.target.value });
                    }}
                    className="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs text-on-surface"
                  >
                    <option>Most Recent</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </main>
  );
};

export default Marketplace;
