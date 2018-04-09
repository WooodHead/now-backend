/* eslint-disable import/prefer-default-export */
import { setProfilePhoto as apiUpload } from '../../api';

const setProfilePhoto = (root, { input: { photo, main, syncPhoto } }, context) =>
  apiUpload(photo, main, syncPhoto, context);

export const mutations = { setProfilePhoto };
