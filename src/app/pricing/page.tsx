/* eslint-disable max-len */
import { AppBanner, MondayInstallButton } from 'ui';
import PricingCards from './pricing-cards';

export default async function PricingPage() {
  return (
    <section className="flex flex-col gap-10 w-[800px] pt-10 mx-auto">
      <AppBanner/>
      <PricingCards/>
      <p className="text-base text-center">
        If you want to start using the <strong>Short links for monday.com</strong>,
        first install the App on your monday.com account.
      </p>
      <MondayInstallButton className="mx-auto"/>
    </section>
  );
}
