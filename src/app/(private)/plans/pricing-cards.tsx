'use client'
import { useState } from 'react';

import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
} from 'ui';
import { startCheckout } from './actions';

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

export default function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  const handleBuyPlan = async (plan: 'basic' | 'premium') => {
    await startCheckout({ plan, cycle: billingCycle });
  }

  return (
    <>
      <Tabs
        value={billingCycle}
        onValueChange={setBillingCycle as any}
        className="mx-auto rounded-md border border-neutral-200 dark:border-slate-800"
      >
        <TabsList>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="border rounded-lg flex items-stretch">
        <Container>
          <Header>Base Plan</Header>
          <Price value={billingCycle === 'month' ? 5 : 50} cycle={billingCycle} />
          <p className="mb-auto">You will be able to create as many links as you want to.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleBuyPlan('basic')}>
            Buy Plan
          </Button>
        </Container>
        <div className="w-[1px] bg-border my-6" />
        <Container>
          <Header highlight>Premium Plan</Header>
          <Price value={billingCycle === 'month' ? 10 : 100} cycle={billingCycle} highlight />
          <p>
            Sames as the Base Plan.
            <br />
            Additionally, you will be able to use custom domains, QR codes and all the features we have.
            <br/>
            <br/>
            We are offering discounts for the first 100 users.
          </p>
          <Button size="sm" className="mt-4" onClick={() => handleBuyPlan('premium')}>
            Buy Plan
          </Button>
        </Container>
      </div>
    </>
  );
}
