import Image from 'next/image';

import { AppBanner } from 'ui';

export default function HowToUsePage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-6 md:px-4 py-16 max-w-[900px]">
        <AppBanner/>
        <section className="flex flex-col gap-6">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-4xl text-center">How to Use</h2>
              <p className="text-gray-500 dark:text-gray-300 text-xl/relaxed">
                Welcome to Short Links for monday.com!
                This short guide will help you get started with the tool and show you
                how to create and manage short links.
              </p>
            </div>

            <div data-el="feature" className="mx-auto max-w-5xl flex flex-col items-start gap-6 py-12">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-2xl font-bold">Setup your Workspace</h2>
                <p className="text-gray-700 dark:text-gray-300 text-justify">
                  To start creating short links, you first need to setup your Workspace.
                  You need to provide your workspace name and a unique short name that will be part of your short links.
                  The short name will be used as a prefix for all your short links so make sure {`it's`} easy to remember.
                  Try to hit a nice balance between short and descriptive.
                </p>
              </div>
              <div className="bg-neutral-100 p-4 rounded">
                <Image
                  alt="Workspace Registration"
                  className="mx-auto overflow-hidden object-cover object-center sm:w-full"
                  height="800"
                  src="/screenshots/screenshot_setup_short.png"
                  width="800"
                />
              </div>
            </div>

            <div data-el="feature" className="mx-auto flex flex-col items-start gap-6 py-12">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-2xl font-bold">Managing your links</h2>
                <p className="text-gray-700 dark:text-gray-300 text-justify">
                  Once the setup is complete, you will be taken to the dashboard where you can manage your links.
                  From here, you can create new links or customize existing links, add passwords, set expiration dates...
                  At any point oyu can copy the short link to your clipboard with just a button.
                </p>
              </div>
              <div className="bg-neutral-100 p-4 rounded">
                <Image
                  alt="Links list"
                  className="mx-auto overflow-hidden rounded object-cover object-center sm:w-full"
                  height="800"
                  src="/screenshots/screenshot_links_list_short.png"
                  width="800"
                />
              </div>
            </div>

            <div data-el="feature" className="mx-auto flex flex-col items-start gap-6 py-12">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-2xl font-bold">Create a new link</h2>
                <p className="text-gray-700 dark:text-gray-300 text-justify">
                  When you want to create a new short link, you can do so by clicking the {`"Add new Link"`} button.
                  A modal will appear where you can enter the destination URL, a short name, set a password, and expiration date.
                  Once you save the link, it will appear in the list of your links.
                  And {`that's`} it! You have created a new short link.
                </p>
              </div>
              <div className="bg-neutral-100 p-4 rounded">
                <Image
                  alt="Links list"
                  className="mx-auto overflow-hidden rounded object-cover object-center sm:w-full"
                  height="800"
                  src="/screenshots/screenshot_links_form_short.png"
                  width="800"
                />
              </div>
            </div>
          </div>
          <p className="mt-6">
            If you have any other questions, please contact us at{' '}
            <a href="mailto:contact@mndy.link" className="underline font-bold hover:text-pink-600">
              contact@mndy.link
            </a>.
            <br />
            Thank you for using the Short Links for monday.com!
          </p>
        </section>
      </main>
    </section>
  );
}
