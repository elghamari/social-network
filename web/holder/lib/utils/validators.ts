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
  const MAX_SIZE = 2 * 1024 * 1024;

  console.log(file);

  if (file && file.size > MAX_SIZE) {
    errors.coverImage = "Image size must not exceed 2MB";
  }

  if (
    file &&
    file.size !== 0 &&
    !["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(file.type)
  ) {
    errors.coverImage = "Invalid image type";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
