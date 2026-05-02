"use client";

import type {
  EventFormErrors,
  EventFormInput,
  GroupFormErrors,
  GroupFormInput,
} from "../types/group";

export function validateGroup(data: GroupFormInput): GroupFormErrors | null {
  const errors: GroupFormErrors = {
    title: [],
    description: [],
    coverImage: [],
  };

  const title = data.title;
  if (!title || !(title.length >= 3 && title.length <= 100)) {
    errors.title?.push(
      "Title cannot be empty and must be between 3 and 100 letters.",
    );
  }

  const description = data.description;
  if (
    !description ||
    !(description.length >= 10 && description.length <= 500)
  ) {
    errors.description?.push(
      "Description cannot be empty and must be between 10 and 500 letters.",
    );
  }

  const file = data.coverImage;
  if (file && file.size > 0) {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.coverImage?.push("Image must be less than 2MB");
    }

    const allowedTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      errors.coverImage?.push(
        "Only JPG, JPEG, PNG, WEBP or GIF images are allowed",
      );
    }
  }

  const hasErrors = Object.values(errors).some((arr) => arr && arr.length > 0);
  return hasErrors ? errors : null;
}

export function validateEvent(data: EventFormInput): EventFormErrors | null {
  const errors: EventFormErrors = {};

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

  const date = data.date;
  if (!date) {
    errors.date = "Date and time is required.";
  } else {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

    if (!regex.test(date)) {
      errors.date = "Enter a valid date and time.";
    } else {
      const dateCheck = new Date(date);
      const inMs = dateCheck.getTime();

      if (isNaN(dateCheck.getTime())) {
        errors.date = "Enter a valid date and time.";
      }

      if (inMs <= Date.now()) {
        errors.date = "Nice try, time traveler. Pick a future date.";
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
