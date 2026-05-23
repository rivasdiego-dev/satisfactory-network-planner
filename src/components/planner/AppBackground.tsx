import LightPillar from "@/components/LightPillar"

export function AppBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <LightPillar
        topColor="#A855F7"
        bottomColor="#7C3AED"
        intensity={1}
        rotationSpeed={0.5}
        interactive={false}
        glowAmount={0.003}
        pillarWidth={2.5}
        pillarHeight={0.2}
        noiseIntensity={0.1}
        pillarRotation={90}
      />
    </div>
  )
}
