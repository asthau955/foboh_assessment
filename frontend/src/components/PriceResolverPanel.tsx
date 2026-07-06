import { useEffect, useState } from 'react';
import type { Customer, PriceResolution, Product } from '../api';
import { fetchCustomers, fetchProducts, resolvePrice } from '../api';
import { PrecedenceRuleGuide } from './PrecedenceRuleGuide';

export function PriceResolverPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('cust-bondi');
  const [productId, setProductId] = useState('prod-koybrun');
  const [result, setResult] = useState<PriceResolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchProducts()]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
    });
  }, []);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await resolvePrice(customerId, productId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId && productId) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, productId]);

  const product = products.find((p) => p.id === productId);
  const customer = customers.find((c) => c.id === customerId);

  return (
    <div className="price-resolver">
      <PrecedenceRuleGuide />

      <section className="panel">
      <h2>Price resolution (overlapping profiles)</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Try Bondi Cellars + Koyama Methode Brut Nature NV to see Profiles A, B, and C compete.
      </p>

      <div className="form-row">
        <label>
          Customer
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Product
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={run} disabled={loading}>
          Resolve
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {result && (
        <div className="resolution-card">
          <p>
            <strong>{customer?.name}</strong> · <span className="mono">{product?.sku}</span>
          </p>
          <p className="final">${result.finalPrice.toFixed(2)}</p>
          <p>
            Base <span className="mono">${result.basePrice.toFixed(2)}</span>
            {result.profileName && (
              <>
                {' '}
                via <strong>{result.profileName}</strong>
              </>
            )}
          </p>
          <p style={{ color: 'var(--muted)' }}>{result.reason}</p>

          {result.consideredProfiles.length > 0 && (
            <>
              <h3>All matching profiles (ranked)</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Profile</th>
                      <th>Price</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.consideredProfiles.map((row) => (
                      <tr key={row.profileId}>
                        <td>{row.rank}</td>
                        <td>{row.profileName}</td>
                        <td className="mono">${row.computedPrice.toFixed(2)}</td>
                        <td>
                          {row.rank === 1 ? (
                            <span className="badge" style={{ color: 'var(--success)' }}>Applied</span>
                          ) : (
                            row.eliminatedBecause
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </section>
    </div>
  );
}
