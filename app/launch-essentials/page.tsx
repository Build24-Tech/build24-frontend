import { Metadata } from "next";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import { AccessibilityFloatingButton } from "./components/AccessibilitySettings";
import { LaunchEssentialsLayout } from "./components/LaunchEssentialsLayout";
import { VoiceNavigationButton } from "./components/VoiceNavigation";

export const metadata: Metadata = {
  title: "Product Launch Essentials | Build24",
  description: "Complete frameworks to validate, build and launch your product successfully",
};

export default function LaunchEssentialsPage() {
  return (
    <AccessibilityProvider>
      <LaunchEssentialsLayout>
        <main className="space-y-6 sm:space-y-8" id="main-content">
          {/* Header - Mobile optimized */}
          <header className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">
              Product Launch Essentials
            </h1>
            <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
              Complete frameworks to validate, build, and launch your product successfully.
              Select a framework below to get started.
            </p>
          </header>

          {/* Framework cards - Responsive grid */}
          <section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            aria-label="Available frameworks"
          >
            <article
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow touch-manipulation focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-label="Product Validation framework"
            >
              <h2 className="text-lg sm:text-xl font-medium mb-2">Product Validation</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                Validate your product idea with market research and user feedback.
              </p>
              <div className="flex items-center text-yellow-600 text-sm font-medium">
                <span>Get Started</span>
                <span aria-hidden="true" className="ml-1">→</span>
              </div>
            </article>

            <article
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow touch-manipulation focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-label="Product Definition framework"
            >
              <h2 className="text-lg sm:text-xl font-medium mb-2">Product Definition</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                Define your product vision, features, and success metrics.
              </p>
              <div className="flex items-center text-yellow-600 text-sm font-medium">
                <span>Get Started</span>
                <span aria-hidden="true" className="ml-1">→</span>
              </div>
            </article>

            <article
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow touch-manipulation sm:col-span-2 lg:col-span-1 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-label="Technical Architecture framework"
            >
              <h2 className="text-lg sm:text-xl font-medium mb-2">Technical Architecture</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                Plan your tech stack, infrastructure, and integrations.
              </p>
              <div className="flex items-center text-yellow-600 text-sm font-medium">
                <span>Get Started</span>
                <span aria-hidden="true" className="ml-1">→</span>
              </div>
            </article>
          </section>

          {/* Additional mobile-friendly features */}
          <section className="mt-8 sm:mt-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-medium text-yellow-900 mb-2">
                Mobile-Optimized Experience
              </h2>
              <p className="text-yellow-800 text-sm sm:text-base mb-4">
                Access your launch essentials on any device with our responsive design and offline capabilities.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <li className="flex items-center text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" aria-hidden="true"></span>
                  Touch-friendly interface
                </li>
                <li className="flex items-center text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" aria-hidden="true"></span>
                  Offline access
                </li>
                <li className="flex items-center text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" aria-hidden="true"></span>
                  Progressive web app
                </li>
              </ul>
            </div>
          </section>
        </main>

        {/* Accessibility floating buttons */}
        <AccessibilityFloatingButton />
        <VoiceNavigationButton />
      </LaunchEssentialsLayout>
    </AccessibilityProvider>
  );
}
