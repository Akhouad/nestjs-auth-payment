import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { User } from "src/users/user.entity";
import { Response } from "express";
import CreateUserDto from "src/users/dto/create-user.dto";
import RequestWithUser from "./interfaces/request-with-user.interface";

@Controller('auth')
export class AuthController {
	constructor(
		private _authService: AuthService,
	) {}

	@Post('register')
	async register(@Body() registrationData: CreateUserDto): Promise<User> {
		return this._authService.register(registrationData);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Req() request: RequestWithUser, @Res() response: Response) {
		const { user } = request;
		response.setHeader('Set-Cookie', this._authService.getCookieWithJwtAccessToken(user.id));
		return response.send(user);
	}

	@Post('logout')
	async logout(@Res() response: Response) {
		response.setHeader('Set-Cookie', this._authService.getCookieForLogOut());
		return response.sendStatus(200);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() request) {
		return request.user;
	}
}