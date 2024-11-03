const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const IMAGE_URL = /^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)$/i;

export const REGEX = {
  PASSWORD_RULE,
  IMAGE_URL,
};
