import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any;
  } = {},
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Create upload options object, only including defined properties
    const uploadOptions: any = {
      resource_type: "auto",
      folder: options.folder || "pet-store",
      ...options,
    };

    // Only add public_id if it's defined
    if (options.public_id) {
      uploadOptions.public_id = options.public_id;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
