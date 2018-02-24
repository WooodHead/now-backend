// const userQuery = (root, { id }) => ({ id });

const currentUser = (root, variables, context) => {
  const { user: { id, email, name, photo } } = context;
  const [first, last] = name.split(' ');
  return {
    id,
    meetupId: id,
    email,
    first,
    last,
    photo: {
      highresLink: photo.highres_link,
      photoLink: photo.photo_link,
      thumbLink: photo.thumb_link,
    },
  };
};
export const queries = { currentUser };

export const resolvers = {};
