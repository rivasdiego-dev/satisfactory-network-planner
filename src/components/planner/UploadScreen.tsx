import FileUpload from "@/components/ui/file-upload"

interface UploadScreenProps {
  onUpload: (files: File[]) => void
  error: string | null
}

export function UploadScreen({ onUpload, error }: UploadScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 md:px-18">
      <div className="w-full max-w-2xl gap-4">
        <FileUpload
          allowedExtensions={["png", "jpg", "jpeg", "webp"]}
          onChange={(files) => void onUpload(files)}
        />
        {error && (
          <p className="mt-3 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
