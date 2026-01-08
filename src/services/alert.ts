import { Dialog } from '@capacitor/dialog';
import { Toast } from "@capacitor/toast";

export const toast = async (text: string) => {
    await Toast.show({
        text,
    });
};

export const showAlert = async ({ title, message }: { title: string, message: string }) => {
  await Dialog.alert({
    title,
    message,
  });
};

export const showConfirm = async ({ title, message }: { title: string, message: string }) => {
  const { value } = await Dialog.confirm({
    title,
    message,
  });
  return value;
};

export const showPrompt = async ({ title, message }: { title: string, message: string }) => {
  const { value, cancelled } = await Dialog.prompt({
    title,
    message,
  });

  return { value, cancelled };
};