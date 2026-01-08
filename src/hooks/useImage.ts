import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface ImageSizeInfo {
    bytes: number;
    kb: number;
    mb: number;
}

export const useImageSize = () => {
    const [imageSize, setImageSize] = useState<ImageSizeInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const takePhotoAndMeasure = async () => {
        setLoading(true);

        try {
            const image = await Camera.getPhoto({
                quality: 100, // 🔒 sin pérdida
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
            });

            if (!image.base64String) {
                throw new Error('No se pudo obtener la imagen');
            }

            // 📏 cálculo exacto del tamaño binario
            const base64Length = image.base64String.length;
            const padding =
                image.base64String.endsWith('==') ? 2 :
                image.base64String.endsWith('=') ? 1 : 0;

            const bytes = (base64Length * 3) / 4 - padding;

            setImageSize({
                bytes,
                kb: Number((bytes / 1024).toFixed(2)),
                mb: Number((bytes / (1024 * 1024)).toFixed(2)),
            });

        } finally {
            setLoading(false);
        }
    };

    return {
        takePhotoAndMeasure,
        imageSize,
        loading,
    };
};
