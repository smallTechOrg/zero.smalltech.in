'use client';

import { useState } from 'react';

export default function useFetchByIds<T, InputType>(
  fetchIdsFn: (param: InputType) => Promise<number[]>,
  fetchDetailsFn: (ids: number[]) => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (inputParam: InputType) => {
    setLoading(true);
    setData([]);
    setError(null);

    try {
      const ids = await fetchIdsFn(inputParam);
      const details = await fetchDetailsFn(ids);
      setData(details);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
