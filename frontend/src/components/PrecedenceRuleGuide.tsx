export function PrecedenceRuleGuide() {
  return (
    <section className="panel precedence-guide" aria-labelledby="precedence-guide-heading">
      <h2 id="precedence-guide-heading">Precedence rule</h2>
      <p className="precedence-guide__lead">
        Profiles never stack. When several rules match the same customer and product, exactly one
        wins. Compare these keys <strong>in order</strong> — the first difference decides.
      </p>

      <ol className="precedence-guide__steps">
        <li className="precedence-guide__step">
          <h3>1. Targeting specificity</h3>
          <p>Higher combined score wins (customer scope + product scope).</p>
          <div className="precedence-guide__scores">
            <div>
              <span className="precedence-guide__score-label">Customer</span>
              <ul>
                <li>Named customer — <span className="mono">300</span></li>
                <li>Customer group — <span className="mono">200</span></li>
              </ul>
            </div>
            <div>
              <span className="precedence-guide__score-label">Product</span>
              <ul>
                <li>Explicit SKU / selected IDs — <span className="mono">400</span></li>
                <li>Sub-category — <span className="mono">300</span></li>
                <li>Segment (Wine / Wines match) — <span className="mono">200</span></li>
                <li>All products — <span className="mono">100</span></li>
              </ul>
            </div>
          </div>
        </li>

        <li className="precedence-guide__step">
          <h3>2. Adjustment kind</h3>
          <p>
            Override (contract price) — <span className="mono">50</span> · Calculated discount —
            <span className="mono"> 0</span>
          </p>
        </li>

        <li className="precedence-guide__step">
          <h3>3. Supplier priority</h3>
          <p>Higher <span className="mono">priority</span> on the profile wins deliberate ties.</p>
        </li>

        <li className="precedence-guide__step">
          <h3>4. Customer-favouring tie-break</h3>
          <p>If still tied, the customer pays the <strong>lowest</strong> computed price.</p>
        </li>
      </ol>
    </section>
  );
}
