import { State } from "../types/groups";

export function validateGroup(data: State) {
  const state: State = {};

  const title = data.title;
  if (!title || !(title.length >= 3 && title.length <= 100)) {
    state.title =
      "Title cannot be empty and must be between 3 and 100 letters.";
  }

  const description = data.description;
  if (
    !description ||
    !(description.length >= 10 && description.length <= 500)
  ) {
    state.description =
      "Description cannot be empty and must be between 10 and 500 letters.";
  }

  if (Object.keys(state).length !== 0) return state;
}
