// import "dotenv/config"; // Import dotenv
// import { UploadThing } from "uploadthing"; // Use ESM import

// const ut = new UploadThing({
//   apiKey: process.env.UPLOADTHING_TOKEN,
// });

// export const uploadImage = async (fileBuffer, fileName) => {
//   try {
//     const uploadedFile = await ut.uploadFile({
//       file: fileBuffer,
//       fileName: fileName,
//     });

//     return uploadedFile.url; // Return the uploaded image URL
//   } catch (error) {
//     console.error("UploadThing Error:", error);
//     throw new Error("Upload failed");
//   }
// };
