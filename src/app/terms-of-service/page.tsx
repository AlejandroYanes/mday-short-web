import Link from 'next/link';

import { AppBanner } from 'ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-2">
      <h3 className="font-bold">{title}</h3>
      <p className="text-justify">
        {children}
      </p>
    </li>
  );
}

export default function TermsOfServicePage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-6 md:px-4 py-16 max-w-[700px]">
        <AppBanner/>
        <section className="flex flex-col gap-6">
          <h2 className="text-4xl text-center">Terms of Service</h2>
          <ul className="flex flex-col gap-6">
            <Section title="Acceptance of Terms:">
              By accessing or using the Short Link for monday.com {`("the Tool")`},
              you agree to be bound by these Terms of Service.
              If you do not agree to all the terms and conditions of this agreement, you may not access the Tool.
            </Section>
            <Section title="Use of the Tool:">
              The Tool is provided solely for your personal or internal business use.
              You may not use the Tool for any illegal or unauthorized purpose.
              You agree to comply with all applicable laws and regulations regarding your use of the Tool.
            </Section>
            <Section title="Data Security:">
              We take data security seriously.
              While using the Tool, we will collect your user email.
              We will handle your data in accordance with our{' '}
              <Link href="/privacy-policy" className="underline font-bold hover:text-pink-600">
                Privacy Policy
              </Link>,
              which is incorporated by reference into these Terms of Service.
            </Section>
            <Section title="Changes to the Platform:">
              We reserve the right to modify, suspend, or discontinue any aspect of the Tool at any time, with or without notice.
              By using the Tool, you agree that we may contact you regarding changes to the platform.
              However, we will not send you marketing content unless you explicitly opt-in to receive such communications.
            </Section>
            <Section title="Intellectual Property:">
              All content, features, and functionality provided by the Tool are the intellectual property
              of {`its`} developers.
              You may not reproduce, distribute, modify, or create derivative works of any content from the Tool
              without our prior written consent.
            </Section>
            <Section title="Limitation of Liability:">
              In no event shall the Tool be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, or goodwill, arising from your use of the Tool.
            </Section>
            <Section title="Indemnification:">
              You agree to indemnify and hold harmless the Tool and its affiliates, officers, directors, employees, and agents
              from any and all claims, liabilities, damages, losses, or expenses, including reasonable {`attorneys'`} fees
              , arising out of or in connection with your use of the Tool or any violation of these Terms of Service.
            </Section>
            <Section title="Governing Law:">
              These Terms of Service shall be governed by and construed in accordance with the laws of the United Kingdom,
              without regard to its conflict of law principles.
              Any disputes arising out of or in connection with these Terms of Service shall be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </Section>
            <Section title="Changes to Terms:">
              We reserve the right to update or change these Terms of Service at any time.
              Any changes will be effective immediately upon posting to this page.
              Your continued use of the Tool after the posting of any changes constitutes acceptance of those changes.
            </Section>
          </ul>
          <p className="mt-6">
            If you have any questions about these Terms of Service,
            please contact us at{' '}
            <a href="mailto:contact@mndy.link" className="underline font-bold hover:text-pink-600">
              contact@mndy.link
            </a>.
            Thank you for using the Short Links for monday.com!
          </p>
        </section>
      </main>
    </section>
  );
}
