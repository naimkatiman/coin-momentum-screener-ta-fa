import React from 'react';
import { Cuboid } from 'lucide-react';

const sceneUrl = process.env.REACT_APP_SPLINE_SCENE_URL;

export const SplineShowcase: React.FC = () => {
  if (!sceneUrl) {
    return (
      <div className="spline-fallback">
        <div className="spline-fallback-icon">
          <Cuboid size={20} />
        </div>
        <h3>Spline Stage Ready</h3>
        <p>
          Add <code>REACT_APP_SPLINE_SCENE_URL</code> to your environment to render your custom 3D hero scene.
        </p>
      </div>
    );
  }

  return (
    <iframe
      title="Spline Showcase"
      src={sceneUrl}
      className="spline-embed"
      loading="lazy"
      allow="fullscreen"
    />
  );
};
