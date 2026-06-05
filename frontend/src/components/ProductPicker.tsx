import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product, ProductFilters } from '../api';
import { fetchProducts } from '../api';

interface Props {
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const emptyFilters: ProductFilters = {
  title: '',
  sku: '',
  subCategory: '',
  segment: '',
  brand: '',
};

export function ProductPicker({ selectedIds, onSelectionChange }: Props) {
  const [filters, setFilters] = useState(emptyFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts(filters));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleAllVisible = () => {
    const next = new Set(selectedIds);
    if (allVisibleSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  return (
    <section className="panel">
      <h2>Catalogue</h2>
      <div className="filters">
        {(['title', 'sku', 'subCategory', 'segment', 'brand'] as const).map((key) => (
          <label key={key}>
            {key === 'subCategory' ? 'Sub-category' : key.charAt(0).toUpperCase() + key.slice(1)}
            <input
              value={filters[key] ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
              placeholder="Filter…"
            />
          </label>
        ))}
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="toolbar">
        <button type="button" className="secondary" onClick={toggleAllVisible} disabled={!products.length}>
          {allVisibleSelected ? 'Deselect all (filtered)' : 'Select all (filtered)'}
        </button>
        <span className="badge">
          {selectedIds.size} selected · {products.length} shown
          {loading ? ' · loading…' : ''}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              <th>Title</th>
              <th>SKU</th>
              <th>Brand</th>
              <th>Sub-cat</th>
              <th>Segment</th>
              <th>Base</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                </td>
                <td>{p.title}</td>
                <td className="mono">{p.sku}</td>
                <td>{p.brand}</td>
                <td>{p.subCategory}</td>
                <td>{p.segment}</td>
                <td className="mono">${p.basePrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
