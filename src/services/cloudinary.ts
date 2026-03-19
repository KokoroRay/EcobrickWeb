export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Thiếu cấu hình Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let message = '';
    try {
      const data = await res.json();
      message = data?.error?.message || JSON.stringify(data);
    } catch {
      message = await res.text();
    }

    if (/unsigned|upload preset|not found|not allowed/i.test(message)) {
      message = `${message}. Kiểm tra Upload Preset ở chế độ Unsigned và đúng Cloud Name.`;
    }

    throw new Error(`Upload Cloudinary thất bại: ${message}`);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary không trả về secure_url.');
  }

  return data.secure_url as string;
}
