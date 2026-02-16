import fs from 'fs/promises';
import path from 'path';

type UploadableFile = File | Buffer | { name?: string; buffer: Buffer };

function isBufferedFile(value: UploadableFile): value is { name?: string; buffer: Buffer } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'buffer' in value &&
        Buffer.isBuffer((value as { buffer?: unknown }).buffer)
    );
}

export async function uploadFile(file: UploadableFile, folder: string = 'uploads'): Promise<string> {
    try {
        // Convert file data to Buffer
        let buffer: Buffer;
        if (Buffer.isBuffer(file)) {
            buffer = file;
        } else if (isBufferedFile(file)) {
            buffer = file.buffer;
        } else {
            buffer = Buffer.from(await file.arrayBuffer());
        }

        // Store locally
        const uploadDir = path.join(process.cwd(), 'public', folder);
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = 'name' in file && typeof file.name === 'string' ? file.name : 'file';
        const extension = path.extname(originalName) || '.pdf';
        const baseName = path.basename(originalName, extension);
        const uniqueName = `${baseName}-${timestamp}${extension}`;
        
        const filePath = path.join(uploadDir, uniqueName);
        const relativePath = `/${folder}/${uniqueName}`;

        // Write file
        await fs.writeFile(filePath, buffer);

        return relativePath;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
}

export async function deleteFile(filePath: string): Promise<void> {
    try {
        // Local file deletion
        if (filePath.startsWith('/')) {
            const fullPath = path.join(process.cwd(), 'public', filePath.substring(1));
            await fs.unlink(fullPath).catch(() => {
                // Ignore errors if file doesn't exist
            });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
}
