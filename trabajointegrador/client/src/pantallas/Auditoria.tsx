/**
 * @file Bitácora de auditoría del sistema (exclusivo Administrador).
 * @module client/src/pantallas/Auditoria
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton } from '../componentes/ui/Boton';
import { Insignia } from '../componentes/ui/Insignia';
import { Tarjeta } from '../componentes/ui/Tarjeta';
import { peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

interface AuditoriaFila {
  id: number;
  usuario_id: number | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  detalle: unknown;
  ip: string | null;
  creado_en: string;
  usuario_nombre: string | null;
  usuario_email: string | null;
}

const ENTIDADES = ['', 'auth', 'producto', 'categoria', 'movimiento', 'usuario', 'import'];

function formatearFecha(fecha: string): string {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/** Pantalla de consulta de auditoría. */
export function Auditoria() {
  const { tokens } = useTema();
  const { avisar } = usePopUps();

  const [registros, setRegistros] = useState<AuditoriaFila[]>([]);
  const [entidad, setEntidad] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const { datos, meta } = await peticionConMeta<AuditoriaFila[]>('/auditoria', {
          consulta: {
            entidad: entidad || undefined,
            pagina,
            limite: 30
          }
        });
        setRegistros(datos);
        setTotalPaginas(Math.max(1, Number(meta.totalPaginas ?? 1)));
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudo cargar la bitácora de auditoría.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [entidad, pagina, avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <ScrollView
      className="flex-1 bg-fondo"
      contentContainerClassName="gap-4 p-5 pb-10"
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => void cargar(true)}
          tintColor={tokens.primario}
        />
      }
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
          <Ionicons name="shield-checkmark-outline" size={24} color={tokens.primario} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-texto">Bitácora de Auditoría</Text>
          <Text className="text-sm text-texto-suave">
            Trazabilidad de seguridad de todas las operaciones realizadas en Stocker
          </Text>
        </View>
      </View>

      {/* Filtro por entidad */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {ENTIDADES.map((ent) => {
          const activa = entidad === ent;
          return (
            <Pressable
              key={ent || 'todas'}
              onPress={() => {
                setEntidad(ent);
                setPagina(1);
              }}
              className={cn(
                'rounded-full border px-3 py-1.5',
                activa ? 'border-primario bg-primario' : 'border-borde bg-superficie'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold uppercase',
                  activa ? 'text-white' : 'text-texto'
                )}
              >
                {ent || 'Todas las entidades'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {cargando ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={tokens.primario} />
        </View>
      ) : registros.length === 0 ? (
        <Tarjeta clase="items-center py-10">
          <Ionicons name="shield-outline" size={32} color={tokens.textoSuave} />
          <Text className="mt-2 text-base font-bold text-texto">Sin eventos registrados</Text>
        </Tarjeta>
      ) : (
        <View className="gap-2.5">
          {registros.map((reg) => (
            <Tarjeta key={reg.id} compacta clase="gap-1.5">
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <View className="flex-row items-center gap-2">
                  <Insignia texto={reg.entidad.toUpperCase()} tono="primario" />
                  <Insignia texto={reg.accion.toUpperCase()} tono="info" />
                  {reg.entidad_id ? (
                    <Text className="text-xs font-bold text-texto">ID #{reg.entidad_id}</Text>
                  ) : null}
                </View>
                <Text className="text-xs text-texto-suave">{formatearFecha(reg.creado_en)}</Text>
              </View>
              <Text className="text-xs text-texto">
                Operador:{' '}
                <Text className="font-semibold">
                  {reg.usuario_nombre?.trim() || reg.usuario_email || 'Sistema'}
                </Text>
                {reg.ip ? ` · IP: ${reg.ip}` : ''}
              </Text>
              {reg.detalle ? (
                <Text numberOfLines={2} className="text-[11px] text-texto-suave">
                  {typeof reg.detalle === 'string'
                    ? reg.detalle
                    : JSON.stringify(reg.detalle)}
                </Text>
              ) : null}
            </Tarjeta>
          ))}
        </View>
      )}

      {totalPaginas > 1 && (
        <View className="flex-row items-center justify-between pt-2">
          <Boton
            titulo="Anterior"
            variante="secundario"
            tamano="sm"
            deshabilitado={pagina <= 1}
            onPress={() => setPagina((p) => Math.max(1, p - 1))}
          />
          <Text className="text-sm font-semibold text-texto">
            Página {pagina} de {totalPaginas}
          </Text>
          <Boton
            titulo="Siguiente"
            variante="secundario"
            tamano="sm"
            deshabilitado={pagina >= totalPaginas}
            onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          />
        </View>
      )}
    </ScrollView>
  );
}
