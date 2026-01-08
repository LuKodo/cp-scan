import { Toast } from "@capacitor/toast";

export const toast = async (text: string) => {
    await Toast.show({
        text,
    });
};