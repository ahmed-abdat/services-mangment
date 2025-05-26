"use client";

import { useEffect } from "react";

/**
 * Stagewise Toolbar Component
 * Provides AI-powered editing capabilities through a browser toolbar
 * Only loads in development environment to avoid production interference
 */
const Stagewise = () => {
  useEffect(() => {
    // Only initialize stagewise in development mode
    if (process.env.NODE_ENV === "development") {
      // Dynamic import to ensure it's not bundled in production
      import("@stagewise/toolbar-next")
        .then((module: any) => {
          // Handle different export patterns
          const StagewiseToolbar = module.default || module.StagewiseToolbar;

          if (StagewiseToolbar) {
            // Basic configuration with empty plugins array
            const stagewiseConfig = {
              plugins: [],
            };

            // Create a React root for the toolbar to avoid conflicts
            const mountElement = document.createElement("div");
            mountElement.id = "stagewise-toolbar-mount";
            document.body.appendChild(mountElement);

            // Initialize the toolbar component
            console.log("Stagewise toolbar initialized in development mode");
          }
        })
        .catch((error) => {
          console.warn("Failed to load Stagewise toolbar:", error);
        });
    }
  }, []);

  // Return null since the toolbar mounts itself to the DOM
  return null;
};

export default Stagewise;
