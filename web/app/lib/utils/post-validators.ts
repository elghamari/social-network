import { FormState, PostErrors } from "../types/feed";

export function validatePostForm(data: FormState): PostErrors | null {
  const errors: PostErrors = {};

  const title = data.title.trim();
  if (!title || title.length > 100) {
    errors.title =
      "title is required and must be under 100 characters.";
  }

  const description = data.description.trim();
  if (!description || description.length > 500 || description.length < 10) {
    errors.description =
      "Description cannot be empty and must be between 10 and 500 letters.";
  }

  const privacy = data.privacy.trim();
  if (!privacy || (privacy !== "public" && privacy !== "private" && privacy !== "almost private" )) {
    errors.privacy =
      "privacy must be public, private, or almost private.";
  }

  if (privacy === "private") {
      const privateUsers = data.privateUsers;
      if (!privateUsers || privateUsers.length < 1) {
        errors.privateUsers =
          "you must select at least one user for a private post.";
      }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
