import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Build24',
  description: 'Terms and conditions for using Build24 services and platform.',
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

        <div className="prose prose-invert max-w-none">
          <p className="mb-6 text-gray-400">Last updated: July 24, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Build24 platform (&quot;Platform&quot;), you agree to be bound by these Terms and Conditions.
              If you do not agree to all of these terms, you may not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p>
              Build24 provides a platform for developers to document their journey of building
              products in 24 hours. Our services include but are not limited to sharing project documentation,
              code repositories, and community engagement features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p>
              As a user of our platform, you are responsible for:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring that your content does not violate any applicable laws or regulations</li>
              <li>Ensuring that your content does not infringe upon the intellectual property rights of others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p>
              Unless otherwise indicated, the Platform and all content and materials available on the Platform,
              including but not limited to text, graphics, website name, code, images, and logos are the property
              of Build24 and are protected by copyright and trademark laws.
            </p>
            <p className="mt-4">
              Users retain ownership of their own content but grant Build24 a non-exclusive license to use,
              reproduce, adapt, publish, and distribute such content on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p>
              Build24 shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, use, goodwill, or other intangible losses,
              resulting from your access to or use of or inability to access or use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Modifications to Terms</h2>
            <p>
              Build24 reserves the right to modify these terms at any time. We will provide notice of significant
              changes by posting the updated terms on our platform. Your continued use of the platform after such
              modifications constitutes your acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
            <p>
              If you have any questions regarding these Terms and Conditions, please contact us at:
            </p>
            <p className="mt-2">
              Email: contact@build24.tech
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
