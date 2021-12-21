import { Body, Controller, Get, HttpCode, Post, Req, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import RegisterDto from "src/users/dto/register";
import RequestWithUser from "./interfaces/requestWithUser.interface";
import { User } from "src/users/user.entity";
import { Response } from "express";

@Controller('auth')
export class AuthController {
	constructor(
		private _authService: AuthService,
	) {}

	@Post('register')
	async register(@Body() registrationData: RegisterDto): Promise<User> {
		return this._authService.register(registrationData);
	}

	@HttpCode(200)
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Req() request: RequestWithUser, @Res() response: Response) {
		const { user } = request;
		response.setHeader('Set-Cookie', this._authService.getCookieWithJwtAccessToken(user.id));
		user.password = undefined;
		return response.send(user);
	}

	@Post('logout')
	async logout(@Req() request: RequestWithUser, @Res() response: Response) {
		response.setHeader('Set-Cookie', this._authService.getCookieForLogOut());
		return response.sendStatus(200);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}