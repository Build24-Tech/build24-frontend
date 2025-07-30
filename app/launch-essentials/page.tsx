import { Metadata } from "next";
import { LaunchEssentialsLayout } from "./components/LaunchEssentialsLayout";

export const metadata: Metadata = {
  title: "Product Launch Essentials | Build24",
  description: "Complete frameworks to validate, build and launch your product successfully",
};

export default function LaunchEssentialsPage() {
  return (
    <LaunchEssentialsLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Product Launch Essentials</h1>
        <p className="text-gray-700 mb-8">
          Complete frameworks to validate, build, and launch your product successfully.
          Select a framework below to get started.
        </p>

        {/* This will be replaced with actual framework selection and dashboard components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-medium mb-2">Product Validation</h3>
            <p className="text-gray-600 mb-4">Validate your product idea with market research and user feedback.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-medium mb-2">Product Definition</h3>
            <p className="text-gray-600 mb-4">Define your product vision, features, and success metrics.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-medium mb-2">Technical Architecture</h3>
            <p className="text-gray-600 mb-4">Plan your tech stack, infrastructure, and integrations.</p>
          </div>
        </div>
      </div>
    </LaunchEssentialsLayout>
  );
}
