import { Capacitor } from '@capacitor/core';

export async function fileFromPath(
    path: string,
    filename: string
): Promise<File> {
    const fileUrl = Capacitor.convertFileSrc(path);
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error('No se pudo leer el archivo escaneado');
    }

    const blob = await response.blob();

    return new File([blob], filename, {
        type: blob.type || 'image/jpeg',
    });
}
