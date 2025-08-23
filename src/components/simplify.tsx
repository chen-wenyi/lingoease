import { Button } from './ui/button';

export default function Simplify() {
  return (
    <Button className='h-12 w-full'>
      <span className='loading loading-dots loading-sm'></span>
    </Button>
  );
}
