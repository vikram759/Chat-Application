import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase.js";
import { useAppStore } from "../store/index.js";

const upload = async (file, uploadTargetId) => {
  // Create the file metadata
  // /** @type {any} */
  // const metadata = {
  //   contentType: "image/jpeg",
  // };

  const { setUploadProgress, setUploadFileName, setUploadTargetId } =
    useAppStore.getState();

  const date = new Date();

  // const storageRef = ref(storage, `images/${date + file.name}`);
  const storageRef = ref(storage, `${date + file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  setUploadTargetId(uploadTargetId);
  setUploadFileName(file.name);

  return new Promise((resolve, reject) => {
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log("Upload is " + progress + "% done");
        setUploadProgress(progress);
      },
      (error) => {
        reject("Something went wrong!" + error.code);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadProgress(0);
          setUploadTargetId(undefined);
          setUploadFileName(undefined);
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
