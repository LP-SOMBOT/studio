
'use client';

/**
 * Utility to upload images to ImgBB
 */
export const uploadToImgbb = async (file: File) => {
  const apiKey = '4437fb9ba157b8fc7ddef1e251718f66';
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Image upload failed');
    }
    return data.data.url as string;
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
};
