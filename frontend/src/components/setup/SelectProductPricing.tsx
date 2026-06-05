import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconBottle, IconSearch, IconX } from '@tabler/icons-react';
import type { Product, ProductFilters } from '../../api';
import { fetchProducts } from '../../api';
import { packSizeFor, productInitials, thumbnailHue } from '../../utils/productDisplay';

export type PricingScopeMode = 'one' | 'multiple' | 'all';

interface Props {
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  scopeMode: PricingScopeMode;
  onScopeModeChange: (mode: PricingScopeMode) => void;
  profileName?: string;
}

const FILTER_LABELS: Record<keyof Required<ProductFilters>, string> = {
  title: 'Search',
  sku: 'SKU',
  subCategory: 'Category',
  segment: 'Segment',
  brand: 'Brand',
};

const emptyFilters: ProductFilters = {
  title: '',
  sku: '',
  subCategory: '',
  segment: '',
  brand: '',
};

export function SelectProductPricing({
  selectedIds,
  onSelectionChange,
  scopeMode,
  onScopeModeChange,
  profileName = 'your pricing profile',
}: Props) {
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiFilters = useMemo(
    () => ({ ...filters, title: search.trim() || filters.title }),
    [filters, search],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list =
        scopeMode === 'all' ? await fetchProducts() : await fetchProducts(apiFilters);
      setProducts(list);
      if (scopeMode === 'all') {
        onSelectionChange(new Set(list.map((p) => p.id)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [apiFilters, scopeMode, onSelectionChange]);

  useEffect(() => {
    const t = setTimeout(load, scopeMode === 'all' ? 0 : 250);
    return () => clearTimeout(t);
  }, [load, scopeMode]);

  const activeFilterEntries = useMemo(() => {
    const entries: { key: keyof ProductFilters; label: string; value: string }[] = [];
    if (search.trim()) {
      entries.push({ key: 'title', label: FILTER_LABELS.title, value: search.trim() });
    }
    (['sku', 'subCategory', 'segment', 'brand'] as const).forEach((key) => {
      const value = filters[key]?.trim();
      if (value) entries.push({ key, label: FILTER_LABELS[key], value });
    });
    return entries;
  }, [filters, search]);

  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const clearFilter = (key: keyof ProductFilters) => {
    if (key === 'title') {
      setSearch('');
      setFilters((f) => ({ ...f, title: '' }));
    } else {
      setFilters((f) => ({ ...f, [key]: '' }));
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilters(emptyFilters);
  };

  const toggle = (id: string) => {
    if (scopeMode === 'all') return;
    if (scopeMode === 'one') {
      onSelectionChange(selectedIds.has(id) ? new Set() : new Set([id]));
      return;
    }
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAllVisible = () => {
    if (scopeMode === 'one' || scopeMode === 'all') return;
    const next = new Set(selectedIds);
    if (allVisibleSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const handleScopeChange = (mode: PricingScopeMode) => {
    onScopeModeChange(mode);
    if (mode === 'one' && selectedIds.size > 1) {
      const first = [...selectedIds][0];
      onSelectionChange(first ? new Set([first]) : new Set());
    }
    if (mode === 'multiple' && selectedIds.size === 0) {
      /* keep empty */
    }
  };

  const count = selectedIds.size;

  return (
    <section className="setup-section" aria-labelledby="select-products-heading">
      <h2 id="select-products-heading" className="setup-section__title setup-section__title--primary">
        Select Product Pricing
      </h2>
      <p className="setup-section__helper">
        Choose which products this profile applies to. Filter the catalogue, then select rows below.
      </p>

      <fieldset className="scope-options">
        <legend className="visually-hidden">Pricing scope</legend>
        {(
          [
            { mode: 'one' as const, label: 'One Product', hint: 'Single SKU on this profile' },
            { mode: 'multiple' as const, label: 'Multiple Products', hint: 'Pick several from the list' },
            { mode: 'all' as const, label: 'All Products', hint: 'Entire catalogue' },
          ] as const
        ).map(({ mode, label, hint }) => (
          <label
            key={mode}
            className={`scope-option${scopeMode === mode ? ' scope-option--active' : ''}`}
          >
            <input
              type="radio"
              name="pricing-scope"
              value={mode}
              checked={scopeMode === mode}
              onChange={() => handleScopeChange(mode)}
            />
            <span className="scope-option__label">{label}</span>
            <span className="scope-option__hint">{hint}</span>
          </label>
        ))}
      </fieldset>

      <div className="product-filters">
        <label className="product-filters__search">
          <IconSearch size={18} stroke={1.75} className="product-filters__search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={scopeMode === 'all'}
          />
        </label>
        <div className="product-filters__grid">
          <label>
            SKU
            <input
              value={filters.sku ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, sku: e.target.value }))}
              placeholder="e.g. HGVPIN21"
              disabled={scopeMode === 'all'}
            />
          </label>
          <label>
            Category
            <input
              value={filters.subCategory ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, subCategory: e.target.value }))}
              placeholder="e.g. Wine Red"
              disabled={scopeMode === 'all'}
            />
          </label>
          <label>
            Segment
            <input
              value={filters.segment ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, segment: e.target.value }))}
              placeholder="e.g. Wine"
              disabled={scopeMode === 'all'}
            />
          </label>
          <label>
            Brand
            <input
              value={filters.brand ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
              placeholder="e.g. Koyama"
              disabled={scopeMode === 'all'}
            />
          </label>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="filter-results-bar">
        <div className="filter-results-bar__tags">
          {activeFilterEntries.length === 0 ? (
            <span className="filter-results-bar__empty">No filters applied</span>
          ) : (
            activeFilterEntries.map(({ key, label, value }) => (
              <button
                key={`${key}-${value}`}
                type="button"
                className="filter-tag"
                onClick={() => clearFilter(key)}
              >
                {label}: {value}
                <IconX size={14} stroke={2} aria-hidden />
              </button>
            ))
          )}
          {activeFilterEntries.length > 0 && (
            <button type="button" className="filter-tag filter-tag--clear" onClick={clearAllFilters}>
              Clear all
            </button>
          )}
        </div>
        <div className="filter-results-bar__actions">
          <span className="filter-results-bar__count">
            {loading ? 'Loading…' : `${products.length} result${products.length === 1 ? '' : 's'}`}
          </span>
          {scopeMode === 'multiple' && (
            <button
              type="button"
              className="btn-ghost"
              onClick={toggleAllVisible}
              disabled={!products.length}
            >
              {allVisibleSelected ? 'Deselect all shown' : 'Select all shown'}
            </button>
          )}
        </div>
      </div>

      <div className={`product-table-wrap${scopeMode === 'all' ? ' product-table-wrap--disabled' : ''}`}>
        <table className="product-table">
          <thead>
            <tr>
              <th className="product-table__check" />
              <th className="product-table__thumb" />
              <th>Product</th>
              <th>SKU</th>
              <th>Pack size</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="product-table__empty">
                  No products match your filters.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr
                key={p.id}
                className={selectedIds.has(p.id) ? 'product-table__row--selected' : undefined}
              >
                <td className="product-table__check">
                  <input
                    type={scopeMode === 'one' ? 'radio' : 'checkbox'}
                    name={scopeMode === 'one' ? 'product-single' : undefined}
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggle(p.id)}
                    disabled={scopeMode === 'all'}
                    aria-label={`Select ${p.title}`}
                  />
                </td>
                <td className="product-table__thumb">
                  <span
                    className="product-thumb"
                    style={{ backgroundColor: thumbnailHue(p) }}
                    aria-hidden
                  >
                    <IconBottle size={20} stroke={1.5} />
                    <span className="product-thumb__initials">{productInitials(p)}</span>
                  </span>
                </td>
                <td>
                  <span className="product-table__title">{p.title}</span>
                  <span className="product-table__meta">
                    {p.brand} · {p.subCategory}
                  </span>
                </td>
                <td className="mono">{p.sku}</td>
                <td>{packSizeFor(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="selection-summary" aria-live="polite">
        <strong>{count}</strong> {count === 1 ? 'product has' : 'products have'} been selected and
        will be added to <em>{profileName}</em>.
      </aside>
    </section>
  );
}
