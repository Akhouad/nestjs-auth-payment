import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private _userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this._userRepository.find();
  }
  
  findOne(id: number): Promise<User> {
    return this._userRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this._userRepository.delete(id);
  }
}