'use client'

import { Button } from 'ui';
import { resolveToken } from '../actions';

export default function TokenButton() {
  const handleOnClick = async () => {
    const token = await resolveToken();
    console.log(token);
  };
  return (
    <Button variant="outline" onClick={handleOnClick}>
      get token
    </Button>
  );
}
