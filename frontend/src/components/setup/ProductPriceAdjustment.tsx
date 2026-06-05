import { useEffect, useMemo, useRef, useState } from 'react';
import { IconMapPin, IconRefresh } from '@tabler/icons-react';
import type { Product } from '../../api';
import { fetchProducts } from '../../api';
import {
  newPriceFromSignedAdjustment,
  signedAdjustment,
  type AdjustmentDirection,
  type AdjustmentMode,
} from '../../utils/priceCalculation';

export type BasedOnField = 'price';

export interface PriceAdjustmentState {
  basedOn: BasedOnField;
  mode: AdjustmentMode;
  direction: AdjustmentDirection;
  value: number;
  rowAdjustments: Record<string, number>;
  includedIds: string[];
}

interface Props {
  selectedIds: Set<string>;
  profileName: string;
  onBack?: () => void;
  onNext?: () => void;
  onChange?: (state: PriceAdjustmentState) => void;
}

type RowState = {
  product: Product;
  signedAdjustment: number;
  included: boolean;
};

const DEFAULT_VALUE = 5;

function formatAdjustment(mode: AdjustmentMode, signed: number): string {
  const abs = Math.abs(signed);
  if (mode === 'fixed') {
    const prefix = signed >= 0 ? '+$' : '-$';
    return `${prefix} ${abs.toFixed(2)}`;
  }
  const prefix = signed >= 0 ? '+' : '-';
  return `${prefix}${abs}%`;
}

function parseAdjustment(raw: string, mode: AdjustmentMode): number | null {
  const trimmed = raw.trim().replace(/\$/g, '').replace(/%/g, '');
  if (!trimmed) return null;
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) return null;
  const isNegative = raw.includes('-') || trimmed.startsWith('-');
  const magnitude = Math.abs(num);
  return isNegative ? -magnitude : magnitude;
}

export function ProductPriceAdjustment({
  selectedIds,
  profileName,
  onBack,
  onNext,
  onChange,
}: Props) {
  const [basedOn, setBasedOn] = useState<BasedOnField>('price');
  const [mode, setMode] = useState<AdjustmentMode>('fixed');
  const [direction, setDirection] = useState<AdjustmentDirection>('decrease');
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [rows, setRows] = useState<RowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRaw, setEditRaw] = useState('');

  const selectedKey = useMemo(() => [...selectedIds].sort().join(','), [selectedIds]);
  const adjustmentRef = useRef({ mode, direction, value });
  adjustmentRef.current = { mode, direction, value };

  useEffect(() => {
    let cancelled = false;
    if (!selectedIds.size) {
      setRows([]);
      return;
    }
    setLoading(true);
    void fetchProducts()
      .then((all) => {
        if (cancelled) return;
        const selected = all.filter((p) => selectedIds.has(p.id));
        const { mode: m, direction: d, value: v } = adjustmentRef.current;
        const signed = signedAdjustment(m, d, v);
        setRows(
          selected.map((product) => ({
            product,
            signedAdjustment: signed,
            included: true,
          })),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  useEffect(() => {
    const signed = signedAdjustment(mode, direction, value);
    setRows((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((row) => ({ ...row, signedAdjustment: signed }));
    });
  }, [mode, direction, value]);

  useEffect(() => {
    if (!onChange) return;
    onChange({
      basedOn,
      mode,
      direction,
      value,
      rowAdjustments: Object.fromEntries(rows.map((r) => [r.product.id, r.signedAdjustment])),
      includedIds: rows.filter((r) => r.included).map((r) => r.product.id),
    });
  }, [basedOn, mode, direction, value, rows, onChange]);

  const refreshTable = () => {
    const signed = signedAdjustment(mode, direction, value);
    setRows((prev) =>
      prev.map((row) => (selectedIds.has(row.product.id) ? { ...row, signedAdjustment: signed } : row)),
    );
  };

  const toggleRow = (id: string) => {
    setRows((prev) =>
      prev.map((row) => (row.product.id === id ? { ...row, included: !row.included } : row)),
    );
  };

  const commitRowAdjustment = (id: string, raw: string) => {
    const parsed = parseAdjustment(raw, mode);
    if (parsed === null) return;
    setRows((prev) =>
      prev.map((row) => (row.product.id === id ? { ...row, signedAdjustment: parsed } : row)),
    );
  };

  const startEditing = (id: string, signed: number) => {
    setEditingId(id);
    setEditRaw(formatAdjustment(mode, signed));
  };

  const finishEditing = (id: string) => {
    commitRowAdjustment(id, editRaw);
    setEditingId(null);
    setEditRaw('');
  };

  const basedOnLabel = 'Price';
  const count = selectedIds.size;

  return (
    <section className="setup-section" aria-labelledby="price-adjustment-heading">
      <h2 id="price-adjustment-heading" className="setup-section__title setup-section__title--primary">
        Price Adjustment
      </h2>

      {count > 0 && (
        <aside className="selection-summary selection-summary--compact" aria-live="polite">
          You&apos;ve selected <strong>{count}</strong> {count === 1 ? 'Product' : 'Products'}, these
          will be added to <em>{profileName}</em>.
        </aside>
      )}

      <div className="adjustment-config">
        <label className="adjustment-config__field">
          <span className="adjustment-config__label">Based on</span>
          <select
            value={basedOn}
            onChange={(e) => setBasedOn(e.target.value as BasedOnField)}
            className="adjustment-config__select"
          >
            <option value="price">Based on Price</option>
          </select>
        </label>

        <fieldset className="adjustment-config__group">
          <legend className="adjustment-config__label">Set Price Adjustment Mode</legend>
          <div className="radio-pills">
            <label className={`radio-pill${mode === 'fixed' ? ' radio-pill--active' : ''}`}>
              <input
                type="radio"
                name="adjustment-mode"
                value="fixed"
                checked={mode === 'fixed'}
                onChange={() => setMode('fixed')}
              />
              Fixed ($)
            </label>
            <label className={`radio-pill${mode === 'dynamic' ? ' radio-pill--active' : ''}`}>
              <input
                type="radio"
                name="adjustment-mode"
                value="dynamic"
                checked={mode === 'dynamic'}
                onChange={() => setMode('dynamic')}
              />
              Dynamic (%)
            </label>
          </div>
        </fieldset>

        <fieldset className="adjustment-config__group">
          <legend className="adjustment-config__label">Set Price Adjustment Increment Mode</legend>
          <div className="radio-pills">
            <label className={`radio-pill${direction === 'increase' ? ' radio-pill--active' : ''}`}>
              <input
                type="radio"
                name="adjustment-direction"
                value="increase"
                checked={direction === 'increase'}
                onChange={() => setDirection('increase')}
              />
              Increase +
            </label>
            <label className={`radio-pill${direction === 'decrease' ? ' radio-pill--active' : ''}`}>
              <input
                type="radio"
                name="adjustment-direction"
                value="decrease"
                checked={direction === 'decrease'}
                onChange={() => setDirection('decrease')}
              />
              Decrease −
            </label>
          </div>
        </fieldset>

        <div className="adjustment-config__value">
          <label className="adjustment-config__field">
            <span className="adjustment-config__label">
              {mode === 'dynamic' ? 'Adjustment (%)' : 'Adjustment ($)'}
            </span>
            <input
              type="number"
              min={0}
              step={mode === 'dynamic' ? 0.1 : 0.01}
              value={value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
              className="adjustment-config__input"
            />
          </label>
        </div>
      </div>

      <p className="adjustment-note">
        <IconMapPin size={16} stroke={1.75} aria-hidden />
        The adjusted price will be calculated from <strong>Based on {basedOnLabel}</strong> selected
        above.
      </p>

      <div className="price-table-toolbar">
        <button type="button" className="price-table-toolbar__refresh" onClick={refreshTable}>
          <IconRefresh size={16} stroke={1.75} aria-hidden />
          Refresh New Price Table
        </button>
      </div>

      <div className="product-table-wrap">
        <table className="product-table price-table">
          <thead>
            <tr>
              <th className="product-table__check" />
              <th>Product Title</th>
              <th>SKU Code</th>
              <th>Category</th>
              <th>Based on Price</th>
              <th>Adjustment</th>
              <th>New Price</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="product-table__empty">
                  Loading selected products…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="product-table__empty">
                  Select products above to configure price adjustments.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => {
                const base = row.product.basePrice;
                const newPrice = newPriceFromSignedAdjustment(base, mode, row.signedAdjustment);
                const displayNew = row.included ? newPrice : base;
                const isEditing = editingId === row.product.id;

                return (
                  <tr
                    key={row.product.id}
                    className={row.included ? 'product-table__row--selected' : undefined}
                  >
                    <td className="product-table__check">
                      <input
                        type="checkbox"
                        checked={row.included}
                        onChange={() => toggleRow(row.product.id)}
                        aria-label={`Include ${row.product.title} in adjustment`}
                      />
                    </td>
                    <td>
                      <span className="product-table__title">{row.product.title}</span>
                    </td>
                    <td className="mono">{row.product.sku}</td>
                    <td>{row.product.segment}</td>
                    <td className="mono">${base.toFixed(2)}</td>
                    <td>
                      <input
                        type="text"
                        className="price-table__adjustment"
                        value={isEditing ? editRaw : formatAdjustment(mode, row.signedAdjustment)}
                        onFocus={() => startEditing(row.product.id, row.signedAdjustment)}
                        onChange={(e) => setEditRaw(e.target.value)}
                        onBlur={() => finishEditing(row.product.id)}
                        disabled={!row.included}
                        aria-label={`Adjustment for ${row.product.title}`}
                      />
                    </td>
                    <td className="mono price-table__new">${displayNew.toFixed(2)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <p className="price-table__autosave">Your entries are saved automatically.</p>

      <div className="setup-section__footer">
        <button type="button" className="btn-ghost setup-section__back" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext} disabled={!rows.some((r) => r.included)}>
          Next
        </button>
      </div>
    </section>
  );
}
