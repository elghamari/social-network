import { GroupData, GroupErrors } from "../types/groups";

export function validateGroup(data: GroupData): GroupErrors | null {
  const errors: GroupErrors = {};

  const title = data.title;
  if (!title || !(title.length >= 3 && title.length <= 100)) {
    errors.title =
      "Title cannot be empty and must be between 3 and 100 letters.";
  }

  const description = data.description;
  if (
    !description ||
    !(description.length >= 10 && description.length <= 500)
  ) {
    errors.description =
      "Description cannot be empty and must be between 10 and 500 letters.";
  }

  const file = data.coverImage;
  if (file && file.size > 0) {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.coverImage = "Image must be less than 2MB";
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      errors.coverImage = "Only JPG, PNG or WEBP images are allowed";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
