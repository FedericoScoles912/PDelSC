/**
 * @file Módulo de exportación de reportes (CSV y Excel .xlsx) para Productos,
 *       Stock, Movimientos e Historial de Precios.
 * @module client/src/pantallas/Reportes
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { useSeleccionar } from '../estado/store';
import { URL_API, tokensEnMemoria } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';

type TipoReporte = 'productos' | 'stock' | 'movimientos' | 'precios';

interface DefinicionReporte {
  id: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: keyof typeof Ionicons.glyphMap;
  admiteFechas: boolean;
}

const REPORTES: DefinicionReporte[] = [
  {
    id: 'productos',
    titulo: 'Catálogo Completo de Productos',
    descripcion: 'Código, categoría, medidas (Eje, Aloj, Alt), giro, UxB, precio, stock y aplicación.',
    icono: 'pricetags-outline',
    admiteFechas: false
  },
  {
    id: 'stock',
    titulo: 'Estado Actual de Stock y Valorización',
    descripcion: 'Existencias actuales, stock mínimo, indicador bajo mínimo y valorización monetaria.',
    icono: 'cube-outline',
    admiteFechas: false
  },
  {
    id: 'movimientos',
    titulo: 'Historial de Movimientos de Depósito',
    descripcion: 'Detalle de ingresos, egresos y ajustes con usuario, motivo, referencia y fechas.',
    icono: 'swap-vertical-outline',
    admiteFechas: true
  },
  {
    id: 'precios',
    titulo: 'Historial de Variaciones de Precios',
    descripcion: 'Registro de cambios de precios (anteriores y nuevos), origen y fecha.',
    icono: 'cash-outline',
    admiteFechas: true
  }
];

/** Pantalla de generación y descarga de reportes. */
export function Reportes() {
  const { tokens } = useTema();
  const { avisar, alertar } = usePopUps();
  const rol = useSeleccionar((estado) => estado.sesion.usuario?.rol.codigo);
  const puedeDescargar = rol === 'admin' || rol === 'deposito';

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [descargando, setDescargando] = useState<string | null>(null);

  const exportar = async (tipo: TipoReporte, formato: 'csv' | 'xlsx') => {
    if (!puedeDescargar) {
      avisar('La descarga de reportes requiere rol Administrador o Depósito.', 'advertencia');
      return;
    }

    const clave = `${tipo}_${formato}`;
    setDescargando(clave);
    try {
      const params = new URLSearchParams({ formato });
      if (desde.trim()) params.set('desde', desde.trim());
      if (hasta.trim()) params.set('hasta', hasta.trim());

      const url = `${URL_API}/reportes/${tipo}?${params.toString()}`;
      const { acceso } = tokensEnMemoria();

      const respuesta = await fetch(url, {
        headers: acceso ? { Authorization: `Bearer ${acceso}` } : {}
      });

      if (!respuesta.ok) {
        throw new Error(`No se pudo generar el reporte (${respuesta.status}).`);
      }

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = await respuesta.blob();
        const urlBlob = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = urlBlob;
        enlace.download = `stocker_${tipo}.${formato}`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        URL.revokeObjectURL(urlBlob);
        avisar(`Reporte ${tipo.toUpperCase()} (${formato.toUpperCase()}) descargado.`, 'exito');
      } else {
        const texto = await respuesta.text();
        const lineas = Math.max(0, texto.split(/\r?\n/).filter(Boolean).length - 1);
        await alertar({
          titulo: `Reporte ${tipo.toUpperCase()} generado`,
          mensaje:
            formato === 'csv'
              ? `El servidor generó el archivo CSV correctamente (${lineas} registros exportados).\n\nPrimeras líneas:\n${texto.slice(0, 380)}…`
              : `El archivo Excel (.xlsx) de "${tipo}" se generó correctamente en el servidor (${texto.length} bytes).`,
          tipo: 'exito'
        });
      }
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'Error al generar el reporte.',
        'peligro'
      );
    } finally {
      setDescargando(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-fondo" contentContainerClassName="gap-4 p-5 pb-10">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
          <Ionicons name="document-text-outline" size={24} color={tokens.primario} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-texto">Reportes y Exportaciones</Text>
          <Text className="text-sm text-texto-suave">
            Generación de planillas Excel (.xlsx) y archivos CSV listos para análisis
          </Text>
        </View>
      </View>

      {/* Filtro opcional por fechas */}
      <Tarjeta compacta clase="gap-3">
        <Text className="text-xs font-bold uppercase text-texto-suave">
          Filtro opcional por fechas (aplica a Movimientos y Precios)
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Entrada
            etiqueta="Desde (AAAA-MM-DD)"
            placeholder="2025-01-01"
            value={desde}
            onChangeText={setDesde}
            clase="min-w-[140px] flex-1"
          />
          <Entrada
            etiqueta="Hasta (AAAA-MM-DD)"
            placeholder="2026-12-31"
            value={hasta}
            onChangeText={setHasta}
            clase="min-w-[140px] flex-1"
          />
        </View>
      </Tarjeta>

      {/* Tarjetas de reportes */}
      <View className="gap-3">
        {REPORTES.map((rep) => (
          <Tarjeta key={rep.id}>
            <EncabezadoTarjeta
              titulo={rep.titulo}
              descripcion={rep.descripcion}
              icono={rep.icono}
            />
            <View className="flex-row flex-wrap gap-2">
              <Boton
                titulo="Exportar CSV"
                icono="download-outline"
                variante="secundario"
                tamano="sm"
                cargando={descargando === `${rep.id}_csv`}
                onPress={() => void exportar(rep.id, 'csv')}
              />
              <Boton
                titulo="Exportar Excel (.xlsx)"
                icono="grid-outline"
                variante="primario"
                tamano="sm"
                cargando={descargando === `${rep.id}_xlsx`}
                onPress={() => void exportar(rep.id, 'xlsx')}
              />
            </View>
          </Tarjeta>
        ))}
      </View>
    </ScrollView>
  );
}
