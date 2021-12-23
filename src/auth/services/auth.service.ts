import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import CreateUserDto from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
	constructor(
		private _userService: UsersService,
		private _jwtService: JwtService,
	) { }

	async register(registrationData: CreateUserDto): Promise<User> {
		const hashedPassword = await bcrypt.hash(registrationData.password, 10);
		try {
			const createdUser = await this._userService.create({
				...registrationData,
				password: hashedPassword
			});
			return createdUser;
		} catch(error) {
			if (error?.code === PostgresErrorCode.UniqueViolation) {
				throw new HttpException('A user with this email already exists', HttpStatus.BAD_REQUEST);
			}
			throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public async getAuthenticatedUser(email: string, hashedPassword: string): Promise<User> {
		try {
			const user = await this._userService.getByEmail(email);
			await this._verifyPassword(user.password, hashedPassword);
			return user;
		} catch(error) {
			throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
		}
	}

	private async _verifyPassword(plainTextPassword: string, hashedPassword: string) {
		const isPasswordMatching = await bcrypt.compare(
			hashedPassword,
			plainTextPassword
		);

		if (!isPasswordMatching) {
			throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
		}
	}

	getCookieWithJwtAccessToken(userId: number): string {
		const payload: TokenPayload = { userId };
		const token = this._jwtService.sign(payload, {
			secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`
		});
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}`;
	}

	getCookieWithJwtRefreshToken(userId: number) {
		const payload: TokenPayload = { userId };
		const token = this._jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`
    });
		const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`;
		return {
			cookie,
			token
		};
	}

	getCookieForLogOut() {
		return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
	}
}
