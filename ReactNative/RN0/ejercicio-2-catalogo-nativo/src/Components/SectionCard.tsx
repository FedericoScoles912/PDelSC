import { Text, View } from 'react-native';
import type { SectionProps } from '../Types/common';
import { makeStyles } from '../Styles/catalogStyles';
/** Contenedor visual reutilizable para cada ejemplo nativo. @param props Título, explicación, contenido y colores. */
export default function SectionCard({ title, description, children, colors }: SectionProps): React.JSX.Element { const s = makeStyles(colors, false); return <View style={s.card}><Text style={s.cardTitle}>{title}</Text><Text style={s.description}>{description}</Text>{children}</View>; }
