import { useState } from "react";
import { appMessage as message } from "../../../utils/ui/messageService";
import { authAxios } from "../../../api/axiosConfig";

export const useQuestionImageUpload = ({ form, setPreviewImgUrl }) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      const response = await authAxios.post(
        "admin/questions/upload-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const returnedUrl = response.data.data.imageUrl;
      form.setFieldsValue({ imageUrl: returnedUrl });
      setPreviewImgUrl(returnedUrl);
      onSuccess("OK");
      message.success("Tải ảnh lên thành công!");
    } catch (error) {
      onError(error);
      message.error("Lỗi khi tải ảnh lên!");
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    uploadingImage,
    handleUploadImage,
  };
};
