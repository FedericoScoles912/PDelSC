import { classNames } from '../../Scripts/utils/helpers.js';

export default function Label({ htmlFor, required, children, className, muted }) {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        'block text-sm font-medium mb-1.5',
        muted ? 'text-[color:var(--text-muted)]' : 'text-[color:var(--text-primary)]',
        className
      )}
    >
      {children}
      {required && <span className="ml-1 text-[color:var(--accent-error)]">*</span>}
    </label>
  );
}
