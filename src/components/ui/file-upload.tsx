import { IconFileUpload } from '@tabler/icons-react'
import React from 'react'

type Props = {
    onChange: (files: File[]) => void
    allowedExtensions: string[]
}

export default function FileUpload({ onChange, allowedExtensions }: Props) {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return
        const allowedFiles = Array.from(files).filter((file) => allowedExtensions.includes(file.name.split(".").pop()?.toLowerCase() || ""))
        onChange(allowedFiles)
    }

    return (
        <div className="flex flex-col justify-center items-center gap-4 rounded-md p-4 bg-background/50 backdrop-blur-sm">
            <IconFileUpload size={64} stroke={1} className="mr-2 text-primary-300" />
            <p className="font-heading text-xl">Drop your map screenshots here </p>
            <p> or </p>
            <span className="text-primary-300 font-heading tracking-wider cursor-pointer border border-primary-300 px-4 py-2 rounded-lg" onClick={() => document.querySelector("input")?.click()}>Select a file</span>
            <span className="text-sm text-muted-foreground">{allowedExtensions.join(", ")}</span>
            <input
                type="file"
                onChange={handleFileChange}
                accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
                className="hidden"
            />
        </div>
    )
}