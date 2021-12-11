import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private _userService: UsersService,
		private _jwtService: JwtService,
	) { }

	async validateUser(username: string, password: string): Promise<any> {
		const user = await this._userService.findOne(parseInt(username));
		if (user && user.password === password) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: any) {
		const payload = { username: user.username, sub: user.userId };
		return {
			access_token: this._jwtService.sign(payload),
		}
	}
}
