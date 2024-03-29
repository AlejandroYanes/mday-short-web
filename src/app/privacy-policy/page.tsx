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

export default function PrivacyPolicyPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-6 md:px-4 py-16 max-w-[700px]">
        <AppBanner/>
        <section className="flex flex-col gap-6">
          <h2 className="text-4xl text-center">Privacy Policy</h2>
          <p>
            This Privacy Policy describes how Short Links for monday.com {`("the Tool")`} collects, uses,
            and protects the personal information you provide while using the Tool.
            By using the Tool, you agree to the collection and use of information in accordance with this policy.
          </p>
          <ul className="flex flex-col gap-6">
            <Section title="Information We Collect:">
              When you register for the Tool, we collect your email address to create and manage your account.
              We may also use your email address to communicate with you about updates, changes, or issues related to the Tool.
            </Section>
            <Section title="Use of Cookies:">
              The Tool may use cookies to track visitors who access shared links created through the Tool.
              These cookies are used solely for tracking purposes and do not collect any personal information about the visitor.
              The information collected may include IP addresses, browser type, referring pages, and other standard log information.
            </Section>
            <Section title="How We Use Your Information:">
              We use your email address to provide you with access to the Tool and to communicate with you
              about updates or changes to the platform.
              We do not share your email address with third parties unless required by law or necessary to provide you
              with the services requested.
            </Section>
            <Section title="Changes to the Platform:">
              We reserve the right to modify, suspend, or discontinue any aspect of the Tool at any time, with or without notice.
              By using the Tool, you agree that we may contact you regarding changes to the platform.
              However, we will not send you marketing content unless you explicitly opt-in to receive such communications.
            </Section>
            <Section title="Data Security:">
              We take data security seriously and implement appropriate technical and organizational measures
              to protect your personal information.
              However, no method of transmission over the internet or electronic storage is 100% secure.
              Therefore, while we strive to use commercially acceptable means to protect your personal information,
              we cannot guarantee its absolute security.
            </Section>
            <Section title="Changes to this Privacy Policy:">
              We reserve the right to update or change this Privacy Policy at any time.
              Any changes will be effective immediately upon posting to this page.
              We encourage you to review this Privacy Policy periodically for any updates or changes.
            </Section>
          </ul>
          <p className="mt-6">
            If you have any questions about these Privacy Policy,
            please contact us at{' '}
            <a href="mailto:contact@mndy.link" className="underline font-bold hover:text-pink-600">
              contact@mndy.link
            </a>.
            Thank you for using Short Links for monday.com!
          </p>
        </section>
      </main>
    </section>
  );
}
