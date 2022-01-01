import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import User from "src/users/user.entity";
import { Response } from "express";
import CreateUserDto from "src/users/dto/create-user.dto";
import RequestWithUser from "./interfaces/request-with-user.interface";
import { UsersService } from "src/users/users.service";
import JwtRefreshGuard from "./guards/jwt-refresh.guard";

@Controller('auth')
export class AuthController {
	constructor(
		private _authService: AuthService,
		private _userService: UsersService,
	) {}

	@Post('register')
	async register(@Body() registrationData: CreateUserDto): Promise<User> {
		return this._authService.register(registrationData);
	}

	@HttpCode(200) // Because LocalAuthGuard normally returns 201 status code
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Req() request: RequestWithUser, @Res() response: Response) {
		const { user } = request;
		const accessTokenCookie = this._authService.getCookieWithJwtAccessToken(user.id);
		const refreshTokenCookie = this._authService.getCookieWithJwtRefreshToken(user.id);
		await this._userService.setCurrentRefreshToken(refreshTokenCookie.token, user.id);
		response.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie.cookie]);
		return response.send(user);
	}

	@Post('logout')
	async logout(@Req() request: RequestWithUser, @Res() response: Response) {
		this._userService.removeRefreshToken(request.user.id);
		response.setHeader('Set-Cookie', this._authService.getCookiesForLogOut());
		return response.sendStatus(200);
	}

	@UseGuards(JwtRefreshGuard)
	@Get('refresh')
	refresh(@Req() request: RequestWithUser, @Res() response: Response) {
		const accessTokenCookie = this._authService.getCookieWithJwtAccessToken(request.user.id);
		response.setHeader('Set-Cookie', accessTokenCookie);
		return request.user;
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() request) {
		return request.user;
	}
}