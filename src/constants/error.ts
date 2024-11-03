import { HttpStatus, ValidationPipe } from '@nestjs/common';
const UNPROCESSABLE_ENTITY_EXCEPTION = new ValidationPipe({
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
});
export const ERROR = {
  UNPROCESSABLE_ENTITY_EXCEPTION,
};
