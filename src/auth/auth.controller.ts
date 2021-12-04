import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller()
export class AuthController {
	constructor(
		private _authService: AuthService,
	) {}

	@UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Request() req) {
		return this._authService.login(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}