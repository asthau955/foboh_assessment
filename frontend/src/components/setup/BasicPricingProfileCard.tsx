import { IconCircleCheck, IconPencil } from '@tabler/icons-react';

type BasicPricingProfileCardProps = {
  profileName: string;
  summary: string;
  onMakeChanges?: () => void;
};

export function BasicPricingProfileCard({
  profileName,
  summary,
  onMakeChanges,
}: BasicPricingProfileCardProps) {
  return (
    <section className="setup-section setup-section--compact" aria-labelledby="basic-profile-heading">
      <div className="setup-section__head">
        <h2 id="basic-profile-heading" className="setup-section__title">
          Basic Pricing Profile
        </h2>
        <span className="status-pill status-pill--completed">
          <IconCircleCheck size={16} stroke={2} aria-hidden />
          Completed
        </span>
      </div>
      <p className="setup-section__helper">
        Name your profile, choose who it applies to, and set how prices are adjusted.
      </p>
      <div className="summary-card">
        <div className="summary-card__body">
          <p className="summary-card__name">{profileName}</p>
          <p className="summary-card__detail">{summary}</p>
        </div>
        <button type="button" className="summary-card__action" onClick={onMakeChanges}>
          <IconPencil size={18} stroke={1.75} aria-hidden />
          Make Changes
        </button>
      </div>
    </section>
  );
}
