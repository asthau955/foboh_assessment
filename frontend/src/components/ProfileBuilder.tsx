import { useState } from 'react';
import type { Customer, CustomerGroup, PreviewLine, Product } from '../api';
import { createProfile, fetchProducts, previewPrices } from '../api';

interface Props {
  selectedIds: Set<string>;
  groups: CustomerGroup[];
  customers: Customer[];
  onSaved: () => void;
}

export function ProfileBuilder({ selectedIds, groups, customers, onSaved }: Props) {
  const [name, setName] = useState('');
  const [customerType, setCustomerType] = useState<'group' | 'customer'>('group');
  const [customerTarget, setCustomerTarget] = useState('');
  const [productScopeType, setProductScopeType] = useState<'sku' | 'segment' | 'subCategory' | 'all'>('sku');
  const [scopeValue, setScopeValue] = useState('');
  const [adjustmentKind, setAdjustmentKind] = useState<'calculated' | 'override'>('calculated');
  const [mode, setMode] = useState<'fixed' | 'dynamic'>('dynamic');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('decrease');
  const [value, setValue] = useState(10);
  const [priority, setPriority] = useState(0);
  const [preview, setPreview] = useState<PreviewLine[] | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const productIds = [...selectedIds];

  const buildProductScope = () => {
    if (productScopeType === 'all') return { type: 'all' as const };
    if (productScopeType === 'sku') return { type: 'sku' as const, productIds };
    return { type: productScopeType, value: scopeValue };
  };

  const adjustmentPayload = () => ({
    adjustmentKind,
    mode: adjustmentKind === 'override' ? 'fixed' as const : mode,
    direction: adjustmentKind === 'override' ? 'decrease' as const : direction,
    value: adjustmentKind === 'override' ? value : value,
  });

  const handlePreview = async () => {
    if (!productIds.length) {
      setMessage({ type: 'error', text: 'Select at least one product.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      setPreview(await previewPrices({ productIds, ...adjustmentPayload() }));
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Preview failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Profile name is required.' });
      return;
    }
    if (!customerTarget) {
      setMessage({ type: 'error', text: 'Choose a customer or group.' });
      return;
    }
    if (productScopeType === 'sku' && !productIds.length) {
      setMessage({ type: 'error', text: 'Select products for SKU scope, or change product scope.' });
      return;
    }
    if (productScopeType !== 'sku' && productScopeType !== 'all' && !scopeValue.trim()) {
      setMessage({ type: 'error', text: 'Enter a segment or sub-category value.' });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await createProfile({
        name: name.trim(),
        customerScope: { type: customerType, targetId: customerTarget },
        productScope: buildProductScope(),
        ...adjustmentPayload(),
        priority,
      });
      setMessage({ type: 'success', text: 'Profile saved.' });
      setPreview(null);
      onSaved();
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setBusy(false);
    }
  };

  const applyScopeFromSelection = async () => {
    if (!productIds.length) return;
    const products = await fetchProducts();
    const selected = products.filter((p: Product) => productIds.includes(p.id));
    if (selected.length === 1) {
      setScopeValue(selected[0].subCategory);
    }
  };

  return (
    <section className="panel">
      <h2>Build pricing profile</h2>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="form-row">
        <label>
          Profile name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer VIP sparkling" />
        </label>
        <label>
          Priority (tie-break)
          <input
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Customer scope
          <select value={customerType} onChange={(e) => setCustomerType(e.target.value as 'group' | 'customer')}>
            <option value="group">Group</option>
            <option value="customer">Single customer</option>
          </select>
        </label>
        <label>
          Target
          <select value={customerTarget} onChange={(e) => setCustomerTarget(e.target.value)}>
            <option value="">— Select —</option>
            {customerType === 'group'
              ? groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))
              : customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Product scope
          <select
            value={productScopeType}
            onChange={(e) => setProductScopeType(e.target.value as typeof productScopeType)}
          >
            <option value="sku">Selected SKUs ({productIds.length})</option>
            <option value="segment">Segment</option>
            <option value="subCategory">Sub-category</option>
            <option value="all">All products</option>
          </select>
        </label>
        {productScopeType !== 'sku' && productScopeType !== 'all' && (
          <label>
            Scope value
            <input value={scopeValue} onChange={(e) => setScopeValue(e.target.value)} />
            <button type="button" className="secondary" onClick={applyScopeFromSelection}>
              From selection
            </button>
          </label>
        )}
      </div>

      <div className="form-row">
        <label>
          Adjustment type
          <select
            value={adjustmentKind}
            onChange={(e) => setAdjustmentKind(e.target.value as 'calculated' | 'override')}
          >
            <option value="calculated">Calculated (+/- fixed or %)</option>
            <option value="override">Override (target price $)</option>
          </select>
        </label>
        {adjustmentKind === 'calculated' && (
          <>
            <label>
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value as 'fixed' | 'dynamic')}>
                <option value="fixed">Fixed ($)</option>
                <option value="dynamic">Dynamic (%)</option>
              </select>
            </label>
            <label>
              Direction
              <select value={direction} onChange={(e) => setDirection(e.target.value as 'increase' | 'decrease')}>
                <option value="decrease">Decrease</option>
                <option value="increase">Increase</option>
              </select>
            </label>
          </>
        )}
        <label>
          {adjustmentKind === 'override' ? 'Target price ($)' : mode === 'dynamic' ? 'Percent' : 'Amount ($)'}
          <input
            type="number"
            min={0}
            step={mode === 'dynamic' ? 0.1 : 0.01}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="toolbar">
        <button type="button" className="secondary" onClick={handlePreview} disabled={busy}>
          Preview prices
        </button>
        <button type="button" onClick={handleSave} disabled={busy}>
          Save profile
        </button>
      </div>

      {preview && (
        <div className="table-wrap">
          <h3>Preview</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Title</th>
                <th>Base</th>
                <th>New</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((line) => {
                const delta = line.newPrice - line.basePrice;
                return (
                  <tr key={line.productId}>
                    <td className="mono">{line.sku}</td>
                    <td>{line.title}</td>
                    <td className="mono">${line.basePrice.toFixed(2)}</td>
                    <td className="mono">${line.newPrice.toFixed(2)}</td>
                    <td className={delta >= 0 ? 'price-up' : 'price-down'}>
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
