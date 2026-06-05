import { useCallback, useEffect, useState } from 'react';
import type { PricingProfile } from '../api';
import { fetchProfiles } from '../api';

export function ProfileList({ refreshKey }: { refreshKey: number }) {
  const [profiles, setProfiles] = useState<PricingProfile[]>([]);

  const load = useCallback(async () => {
    setProfiles(await fetchProfiles());
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <section className="panel">
      <h2>Saved profiles</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Rule</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <span className="badge">{p.customerScope.type}</span>{' '}
                  <span className="mono">{p.customerScope.targetId}</span>
                </td>
                <td>
                  <span className="badge">{p.productScope.type}</span>
                  {'value' in p.productScope && p.productScope.value && (
                    <> {p.productScope.value}</>
                  )}
                  {'productIds' in p.productScope && p.productScope.productIds && (
                    <> ({p.productScope.productIds.length} SKU)</>
                  )}
                </td>
                <td className="mono">
                  {p.adjustmentKind === 'override'
                    ? `=$${p.value}`
                    : `${p.direction} ${p.value}${p.mode === 'dynamic' ? '%' : '$'}`}
                </td>
                <td>{p.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
