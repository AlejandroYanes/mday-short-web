'use client';
import { useState } from 'react';

import { Tabs, TabsList, TabsTrigger, } from 'ui';

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
    <span className="text-5xl font-bold mr-1">
      ${props.value}
    </span>
    <span>/{props.cycle}</span>
  </p>
);

export default function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

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
          <Price value={billingCycle === 'month' ? 8 : 80} cycle={billingCycle} />
          <ul className="list-disc mb-auto pl-5">
            <li>Create as many links as you want to.</li>
            <li>Access to Analytics</li>
          </ul>
        </Container>
        <div className="w-[1px] bg-border my-6" />
        <Container>
          <Header highlight>Premium Plan</Header>
          <Price value={billingCycle === 'month' ? 12 : 120} cycle={billingCycle} highlight />
          <ul className="list-disc pl-5">
            <li>Sames as the Base Plan.</li>
            <li>Use custom domains.</li>
            <li>Generate QR codes to share.</li>
          </ul>
          <p>
            We are offering discounts for the first 100 users.
          </p>
        </Container>
      </div>
    </>
  );
}
