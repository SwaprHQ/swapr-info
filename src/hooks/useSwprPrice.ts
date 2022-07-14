import { useState } from 'react';

import { GET_SWPR_DERIVED_NATIVE_PRICE } from '../apollo/queries';
import { useSwaprSubgraphClient } from '../contexts/Network';

export function useSwprPrice(): { loading: boolean; price: number } {
  const client = useSwaprSubgraphClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);

  if (!client) {
    return { loading: true, price: 0 };
  }

  client
    .query({
      query: GET_SWPR_DERIVED_NATIVE_PRICE,
    })
    .then((response) => {
      setPrice(response.data.tokens[0].derivedNativeCurrency);
    })
    .catch((error) => {
      console.error('Error fetching swpr price', error);
      setPrice(0);
    })
    .finally(() => setLoading(false));

  return { loading, price };
}
