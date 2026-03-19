import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { useStyles } from "./styles.js";
import MediaViewer from '../MediaViewer';

const DropZone = ({ onFileUploaded }) => {
  const classes = useStyles();
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);
    let type = "image";
    if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";
    else if (file.type === "application/pdf") type = "document";

    setSelectedFileUrl(fileUrl);
    setSelectedFileType(type);
    onFileUploaded(file);
  }, [onFileUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*,video/*,audio/*,application/pdf'
  });

  return (
    <div className={classes.dropzone} {...getRootProps()}>
      <input {...getInputProps()} accept='image/*,video/*,audio/*,application/pdf' />

      {selectedFileUrl
        ? <MediaViewer src={selectedFileUrl} alt="Thumbnail" type={selectedFileType} style={{ width: "100%", height: "100%", borderRadius: "14px", objectFit: "cover" }} />
        : (
          <p>
            <CloudUploadIcon />
            NFT Media
          </p>
        )
      }
    </div>
  );
}

export default DropZone;