import { 
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from "firebase/storage";
import { storage } from "./firebase";

// Storage service functions
export const storageService = {
  // Upload a file
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void) {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error("Error uploading file:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Simple upload
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // Upload multiple files
  async uploadFiles(files: File[], basePath: string, onProgress?: (fileIndex: number, progress: number) => void) {
    const uploadPromises = files.map((file, index) => {
      const filePath = `${basePath}/${file.name}`;
      return this.uploadFile(file, filePath, onProgress ? (progress) => onProgress(index, progress) : undefined);
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  },

  // Get download URL
  async getDownloadURL(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  },

  // Delete a file
  async deleteFile(path: string) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  // List all files in a directory
  async listFiles(path: string) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );

      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },

  // Get file metadata
  async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw error;
    }
  },

  // Upload image with automatic resizing (you'll need to implement this on the backend)
  async uploadImage(file: File, path: string, maxWidth?: number, maxHeight?: number, onProgress?: (progress: number) => void) {
    // For now, this just uploads the image as-is
    // You can implement image resizing using a library like 'browser-image-compression'
    return this.uploadFile(file, path, onProgress);
  }
};
