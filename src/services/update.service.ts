// src/services/update.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const APK_NAME = 'cp-scan.apk';

/* 1. Descarga vía fetch */
async function downloadApk(url: string): Promise<Blob> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    return res.blob();
}

/* 2. Blob → base64 (Capacitor Filesystem requiere base64) */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // quitar el prefijo data:application/vnd.android.package-archive;base64,
            const b64 = (reader.result as string).split(',')[1];
            resolve(b64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/* 3. Guardar APK en Downloads público */
async function saveApk(blob: Blob): Promise<string> {
    const base64 = await blobToBase64(blob);
    await Filesystem.writeFile({
        path: APK_NAME,
        data: base64,
        directory: Directory.External, // → /storage/emulated/0/Download
        recursive: true
    });
    // obtener URI nativa (content://...)
    const { uri } = await Filesystem.getUri({
        path: APK_NAME,
        directory: Directory.External
    });
    return uri;
}

/* 4. Abrir archivo → sistema lanza instalador */
async function openInstaller(uri: string) {
    // Browser puede abrir content:// si el MIME lo conoce
    await Browser.open({ url: uri });
}

/* 5. Flujo completo */
export async function updateApp(apkUrl: string) {
    if (Capacitor.getPlatform() !== 'android') {
        throw new Error('Only Android supported');
    }
    const blob = await downloadApk(apkUrl);
    const uri = await saveApk(blob);
    await openInstaller(uri);
}