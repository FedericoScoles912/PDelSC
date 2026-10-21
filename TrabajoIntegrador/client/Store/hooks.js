/**
 * hooks.js
 * Hooks tipados de Redux para usar en toda la app.
 */
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default { useAppDispatch, useAppSelector };
