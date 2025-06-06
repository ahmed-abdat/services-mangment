"use client";

import { useEffect, useRef } from "react";

/**
 * Stagewise Toolbar Component
 * Provides AI-powered editing capabilities through a browser toolbar
 * Only loads in development environment to avoid production interference
 */
const Stagewise = () => {
  const initializationRef = useRef(false);
  const rootRef = useRef<any>(null);
  const mountElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only initialize stagewise in development mode and prevent double initialization
    if (process.env.NODE_ENV === "development" && !initializationRef.current) {
      initializationRef.current = true;

      // Check if a stagewise element already exists
      const existingElement = document.getElementById(
        "stagewise-toolbar-mount"
      );
      if (existingElement) {
        console.log(
          "Stagewise toolbar already exists, skipping initialization"
        );
        return;
      }

      // Dynamic import to ensure it's not bundled in production
      import("@stagewise/toolbar-next")
        .then(async (module: any) => {
          // Handle different export patterns
          const StagewiseToolbar = module.default || module.StagewiseToolbar;

          if (StagewiseToolbar) {
            // Basic configuration with empty plugins array
            const stagewiseConfig = {
              plugins: [],
            };

            try {
              // Import React and ReactDOM for rendering
              const React = await import("react");
              const ReactDOM = await import("react-dom/client");

              // Create a React root for the toolbar to avoid conflicts
              const mountElement = document.createElement("div");
              mountElement.id = "stagewise-toolbar-mount";
              mountElementRef.current = mountElement;
              document.body.appendChild(mountElement);

              // Create root and render the toolbar
              const root = ReactDOM.createRoot(mountElement);
              rootRef.current = root;

              root.render(
                React.createElement(StagewiseToolbar, {
                  config: stagewiseConfig,
                })
              );

              console.log("Stagewise toolbar initialized in development mode");
            } catch (renderError) {
              console.error("Error rendering Stagewise toolbar:", renderError);
              initializationRef.current = false; // Reset flag on error
            }
          }
        })
        .catch((error) => {
          console.warn("Failed to load Stagewise toolbar:", error);
          initializationRef.current = false; // Reset flag on error
        });
    }

    // Cleanup function
    return () => {
      if (rootRef.current && mountElementRef.current) {
        try {
          rootRef.current.unmount();
          if (mountElementRef.current.parentNode) {
            mountElementRef.current.parentNode.removeChild(
              mountElementRef.current
            );
          }
        } catch (error) {
          console.warn("Error cleaning up Stagewise toolbar:", error);
        }
        rootRef.current = null;
        mountElementRef.current = null;
        initializationRef.current = false;
      }
    };
  }, []);

  // Return null since the toolbar mounts itself to the DOM
  return null;
};

export default Stagewise;
