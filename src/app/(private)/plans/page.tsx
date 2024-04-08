import { Button } from 'ui';

const Container = (props: { children: any }) => (
  <div data-el="plan-card" className="flex flex-col items-stretch p-6 gap-6 w-1/2">
    {props.children}
  </div>
);

const Header = ({ highlight, children }: { highlight?: boolean; children: any }) => (
  <h2 data-active={highlight} className="text-xl data-[active=true]:text-pink-600 dark:data-[active=true]:text-pink-500">
    {children}
  </h2>
);

const Price = (props: { value: number; cycle: string; highlight?: boolean }) => (
  <p data-active={props.highlight} className="text-xl data-[active=true]:text-pink-600 dark:data-[active=true]:text-pink-500">
    <span className="text-5xl font-bold">
      £{props.value}
    </span>
    <span>/{props.cycle}</span>
  </p>
);

export default function PricingPage() {
  return (
    <section className="flex flex-col gap-10 w-[800px] pt-10 mx-auto">
      <div className="border rounded-lg flex items-stretch">
        <Container>
          <Header>Base Plan</Header>
          <Price value={5} cycle="month" />
          <p className="mb-auto">You will be able to create as many links as you want to.</p>
          <Button variant="outline" size="sm" className="mt-4">Buy Plan</Button>
        </Container>
        <div className="w-[1px] bg-border my-6" />
        <Container>
          <Header highlight>Premium Plan</Header>
          <Price value={10} cycle="month" highlight />
          <p>
            Sames as the Base Plan.
            <br />
            Additionally, you will be able to use custom domains, QR codes and all the features we have.
          </p>
          <Button size="sm" className="mt-4">Buy Plan</Button>
        </Container>
      </div>
    </section>
  );
}
