import type { AppColors } from '../Styles/colors';
/** Props visuales compartidos por cada demostración del catálogo. */
export interface ExampleProps { colors: AppColors; }
/** Describe el encabezado de una sección de ejemplo. */
export interface SectionProps extends ExampleProps { title: string; description: string; children: React.ReactNode; }
