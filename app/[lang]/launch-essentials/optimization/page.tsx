import { Metadata } from "next";
import { LaunchEssentialsLayout } from "../components/LaunchEssentialsLayout";
import PostLaunchOptimization from "../components/PostLaunchOptimization";

export const metadata: Metadata = {
  title: "Post-Launch Optimization | Launch Essentials | Build24",
  description: "Continuously improve your product based on real-world data and user feedback",
};

export default function PostLaunchOptimizationPage() {
  const handleSave = (data: any) => {
    // This would typically save to a backend service
    console.log('Saving optimization data:', data);
  };

  return (
    <LaunchEssentialsLayout>
      <PostLaunchOptimization
        projectId="default-project"
        onSave={handleSave}
      />
    </LaunchEssentialsLayout>
  );
}
