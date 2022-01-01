import { instanceToPlain } from "class-transformer";

export class BaseEntity {
  /**
   * Applies instanceToPlain to JSON format of the entity
   * which makes the changes requested in the entity class
   * such as excluding fields (@Exclude()), transforming fields (@Transform())...
   */
  toJSON() {
    return instanceToPlain(this);
  }
}