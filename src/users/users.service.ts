import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateUserDto from './dto/create-user.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private _userRepository: Repository<User>,
  ) {}
  
  /**
   * Returns user from database with the provided email, if it exists
   */
  async getByEmail(email: string): Promise<User> {
    const user = await this._userRepository.findOne({ email });
    if (user) {
      return user;
    }

    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }
  
  /**
   * Returns user from database with the provided ID, if it exists
   */
  async getById(userId: number): Promise<User> {
    const user = await this._userRepository.findOne(userId);
    if (user) {
      return user;
    }

    throw new HttpException('User with this ID does not exist', HttpStatus.NOT_FOUND);
  }

  /**
   * Creates a user with provided user data
   */
  async create(userData: CreateUserDto) {
    const newUser = await this._userRepository.create(userData);
    await this._userRepository.save(newUser);
    return newUser;
  }

  /**
   * Removes user by ID
   */
  async remove(id: number): Promise<void> {
    await this._userRepository.delete(id);
  }

  /**
   * Updates user's currentHashedRefreshToken field
   */
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this._userRepository.update(userId, {
      currentHashedRefreshToken
    });
  }

  /**
   * Returns user from database if provided refreshToken matches the currentHashedRefreshToken fields from DB
   */
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | undefined> {
    const user: User = await this.getById(userId);

    const isRefreshTokenMatching: boolean = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  /**
   * Clears currentHashedRefreshToken fields in database for the given user
   */
  async removeRefreshToken(userId: number) {
    return this._userRepository.update(userId, {
      currentHashedRefreshToken: null
    });
  }
}