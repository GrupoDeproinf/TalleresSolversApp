// Búsqueda de servicios del inicio del conductor: texto, categoría y filtros
// (cerca, abierto ahora, valoración) con paginación y estados claros.
//
// El servidor ya ordena por distancia y pagina. Los filtros "abierto ahora" y
// "4★ o más" no existen en el API, así que cuando hay alguno activo se pide un
// bloque grande (100) y se filtra en el teléfono.
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import api from '../../../axiosInstance';
import {mensajeDeError} from '../../components/registro/validators';
import {openState, ratingValue, serviceDistanceKm} from '../../utils/taller';

export const PAGE_SIZE = 10;
const FILTERED_PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 500;
export const NEAR_KM = 5;
export const MIN_RATING = 4;

const toList = data => (Array.isArray(data) ? data : data?.data ?? []);

export default function useServiciosCercanos({location, ready}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState({near: false, open: false, rated: false});

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  const anyFilter = filters.near || filters.open || filters.rated;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(
    async (pageIndex, pageSize) => {
      const res = await api.post('/home/getServiciosPaginados', {
        pageIndex,
        pageSize,
        filter: debouncedQuery,
        uid_categoria: category || '',
        id: '',
        latitude: location?.latitude ?? '',
        longitude: location?.longitude ?? '',
      });
      return toList(res?.data);
    },
    [debouncedQuery, category, location],
  );

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError('');
    try {
      const size = anyFilter ? FILTERED_PAGE_SIZE : PAGE_SIZE;
      const list = await fetchPage(1, size);
      if (id !== requestId.current) return;
      setItems(list);
      setPage(1);
      setHasMore(!anyFilter && list.length >= PAGE_SIZE);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      setItems([]);
      setHasMore(false);
      setError(mensajeDeError(e, 'No pudimos cargar los servicios. Intenta de nuevo.'));
      setStatus('error');
    }
  }, [fetchPage, anyFilter]);

  useEffect(() => {
    if (ready) reload();
  }, [ready, reload]);

  const loadMore = useCallback(async () => {
    if (anyFilter || !hasMore || loadingMore || status !== 'ready') return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const list = await fetchPage(next, PAGE_SIZE);
      if (id !== requestId.current) return;
      setItems(prev => {
        const seen = new Set(prev.map(i => i.id));
        return [...prev, ...list.filter(i => !seen.has(i.id))];
      });
      setPage(next);
      setHasMore(list.length >= PAGE_SIZE);
    } catch (_) {
      // Se reintenta al volver a llegar al final; no se interrumpe la lista.
    } finally {
      setLoadingMore(false);
    }
  }, [anyFilter, hasMore, loadingMore, status, page, fetchPage]);

  const visible = useMemo(() => {
    if (!anyFilter) return items;
    return items.filter(item => {
      if (filters.near) {
        const d = serviceDistanceKm(item, location);
        if (d == null || d > NEAR_KM) return false;
      }
      if (filters.open && openState(item?.taller?.horarios_atencion) !== 'open') return false;
      if (filters.rated && !((ratingValue(item) ?? 0) >= MIN_RATING)) return false;
      return true;
    });
  }, [items, filters, anyFilter, location]);

  const toggleFilter = useCallback(key => setFilters(f => ({...f, [key]: !f[key]})), []);
  const clearAll = useCallback(() => {
    setFilters({near: false, open: false, rated: false});
    setQuery('');
    setCategory(null);
  }, []);

  return {
    query,
    setQuery,
    searching: query.trim() !== debouncedQuery,
    debouncedQuery,
    category,
    setCategory,
    filters,
    toggleFilter,
    anyFilter,
    clearAll,
    items: visible,
    status,
    error,
    reload,
    loadMore,
    loadingMore,
    hasMore,
  };
}
