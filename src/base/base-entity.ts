import { instanceToPlain } from "class-transformer";

export class BaseEntity {
  /**
   * Applies instanceToPlain to JSON format of the entity
   * and makes the changes requested in the entity class
   * such as excluding fields (passwords, keys...), transforming fields...
   */
  toJSON() {
    return instanceToPlain(this);
  }
}