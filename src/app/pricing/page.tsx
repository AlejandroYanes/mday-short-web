/* eslint-disable max-len */
import { AppBanner, MondayInstallButton } from 'ui';
import { openJWT } from 'utils/auth';
import PricingCards from './pricing-cards';

interface Props {
  searchParams: {
    token?: string;
  };
}

export default async function PricingPage(props: Props) {
  const { searchParams: { token } } = props;

  const data = !!token ? await openJWT(token) : null;

  if (!data) {
    return (
      <section className="flex flex-col gap-10 w-[800px] pt-10 mx-auto">
        <AppBanner/>
        <PricingCards name="a" email="a@a.com"/>
        <p className="text-base text-center">
          If you want to start using the this tool, first install the App on your monday.com account.
        </p>
        <MondayInstallButton className="mx-auto" />
      </section>
    );
  }

  const { name, email } = data;

  return (
    <section className="flex flex-col gap-10 w-[800px] pt-10 mx-auto">
      <AppBanner/>
      <PricingCards name={name} email={email} active/>
    </section>
  );
}
