export const allowedMediaFormats = {
  image: ['.png', '.jpeg', '.jpg', '.gif', '.webp'],
  video: ['.mp4', '.avi'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a'],
  document: ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.txt'],
};

export const fileSizeLimitInMegabytes = 50;

export function getFileExtension(file) {
  const getExtension = (name) => {
    const parts = name.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : null;
  };

  if (file && file.name) {
    return getExtension(file.name);
  }

  return null;
}

export function getFileType(src) {
  const isImage = () => {
    const extension = getFileExtension(src);
    return extension && allowedMediaFormats.image.includes(extension);
  };

  const isVideo = () => {
    const extension = getFileExtension(src);
    return extension && allowedMediaFormats.video.includes(extension);
  };

  const isAudio = () => {
    const extension = getFileExtension(src);
    return extension && allowedMediaFormats.audio.includes(extension);
  };

  const isGeolocation = () => {
    const geolocationRegex =
      /^([-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)),\s*([-+]?((1[0-7]\d(\.\d+)?)|([1-9]?\d(\.\d+)?|180(\.0+)?)))$/;

    return geolocationRegex.test(src);
  };

  const isDocument = () => {
    const extension = getFileExtension(src);
    return extension && allowedMediaFormats.document.includes(extension);
  };

  const typeMap = {
    image: isImage,
    video: isVideo,
    audio: isAudio,
    geolocation: isGeolocation,
    document: isDocument,
  };

  const fileType = Object.entries(typeMap).find(([_type, check]) =>
    check(),
  )?.[0];

  return fileType;
}

export function formatFileSize(size) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size)} ${units[unitIndex]}`;
}
