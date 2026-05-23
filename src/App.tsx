import { BrushCleaning, CircuitBoard, FileUp, InfoIcon, Ruler, Save, Share2 } from "lucide-react"
import { useState } from "react"
import LightPillar from "./components/LightPillar"
import FileUpload from "./components/ui/file-upload"
import { FloatingDock } from "./components/ui/floating-dock"

export function App() {

  const [files, setFiles] = useState<File[]>([])

  const handleFileUpload = (files: File[]) => {
    console.log(files)
    setFiles(files)
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 gap-3 bg-accent p-4">
          <p className="text-3xl tracking-tight text-primary uppercase">Ficsit Network Planner</p>
          <div className="flex items-center gap-2 border-l px-4">
            <InfoIcon size={16} className="text-blue-200" />
            <p>Status: Online</p>
          </div>
        </header>

        {files.length > 0 ? (

          <div className="flex min-h-0 flex-1 flex-col items-center px-18 pb-4">
            <div className="flex min-h-0 flex-1 flex-col items-center gap-4 pt-4">
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                <img
                  src={URL.createObjectURL(files[0])}
                  alt={files[0].name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div className="pt-4 w-max">
              <FloatingDock
                items={[
                  {
                    title: "Ruler",
                    icon: <Ruler className="text-amber-300" />,
                    onClick: () => {
                      console.log("Ruler")
                    }
                  },
                  {
                    title: "Node",
                    icon: <Share2 className="text-lime-300" />,
                    onClick: () => {
                      console.log("Node")
                    }
                  },
                  {
                    title: "Steiner",
                    icon: <CircuitBoard className="text-green-300" />,
                    onClick: () => {
                      console.log("Steiner")
                    }
                  },
                  {
                    title: "Clear Canvas",
                    icon: <BrushCleaning className="text-red-300" />,
                    onClick: () => {
                      console.log("Clear Canvas")
                    }
                  },
                  { divider: true },
                  {
                    title: "Upload a new file",
                    icon: <FileUp className="text-bg-foreground" />,
                    onClick: () => {
                      console.log("Save")
                    }
                  },
                  {
                    title: "Save",
                    icon: <Save className="text-bg-foreground" />,
                    onClick: () => {
                      console.log("Save")
                    }
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-18 py-12">
            <div className="w-full max-w-2xl gap-4">
              <FileUpload
                allowedExtensions={["png", "jpg", "jpeg", "webp"]}
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
