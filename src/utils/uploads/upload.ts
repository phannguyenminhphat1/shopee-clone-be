import { UnprocessableEntityException } from '@nestjs/common';
import * as multer from 'multer';
import { USERS_MESSAGES } from 'src/constants/messages';
import { UPLOAD_IMAGE_FOLDER } from './file';

export const uploadOptions = {
  storage: multer.diskStorage({
    destination: UPLOAD_IMAGE_FOLDER,
    filename: (req, file, callback) => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
      const extension = file.originalname.split('.').pop().toLowerCase();
      if (!imageExtensions.includes(extension)) {
        return callback(
          new UnprocessableEntityException({
            message: USERS_MESSAGES.IMAGE_URL_MUST_BE_VALID,
          }),
          '',
        );
      }
      let mSecond = new Date().getTime();
      callback(
        null,
        mSecond +
          '-' +
          Math.round(Math.random() * 189) +
          '_' +
          file.originalname,
      );
    },
  }),
};
