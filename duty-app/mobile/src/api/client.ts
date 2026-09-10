// Using localhost assuming dev environment or network IP. You can change this to production URL later.
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export const fetchTodayDuty = async (cityId?: string, categorySlug?: string) => {
  let url = `${BASE_URL}/today?`;
  if (cityId) url += `cityId=${cityId}&`;
  if (categorySlug) url += `categorySlug=${categorySlug}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.data;
};

export const fetchCities = async () => {
  const res = await fetch(`${BASE_URL}/cities`);
  const data = await res.json();
  return data.data;
};

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`);
  const data = await res.json();
  return data.data;
};
