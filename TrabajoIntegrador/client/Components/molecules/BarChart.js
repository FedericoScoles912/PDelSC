/**
 * BarChart.js
 * Gráfico de barras horizontal, sin dependencias externas.
 * Usa la paleta categórica del tema (chartColors) para colorear cada barra.
 *
 * @param {{data:Array<{label:string, value:number, color?:string}>,
 *          formatValue?:(v:number)=>string, className?:string}} props
 */
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { useTheme } from '../../Styles/ThemeProvider';

export function BarChart({ data = [], formatValue = (v) => `${v}`, className }) {
  const { chartColors } = useTheme();
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  return (
    <View className={className}>
      {data.map((d, i) => {
        const value = Number(d.value) || 0;
        const pct = `${(value / max) * 100}%`;
        const color = d.color || chartColors[i % chartColors.length];
        return (
          <View key={d.label} className="mb-3">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-sm font-medium" numberOfLines={1}>{d.label}</Text>
              <Text className="text-sm font-semibold">{formatValue(value)}</Text>
            </View>
            <View className="h-2.5 w-full overflow-hidden rounded-full bg-warm-100 dark:bg-warm-800">
              <View style={{ width: pct, backgroundColor: color }} className="h-full rounded-full" />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default BarChart;
