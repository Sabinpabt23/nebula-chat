/**
 * Exceptions Barrel Export File
 * * The centralized distribution point for the application's entire error handling suite.
 * This index file implements the Barrel Pattern, gathering all independent custom 
 * HTTP exceptions and exporting them cleanly from a single directory namespace.
 * * Structural Purpose:
 * Consolidates imports across the rest of the application. Instead of cluttering your files with 
 * separate, multi-line relative paths for individual error classes, developers can import 
 * multiple exception types simultaneously using a unified object destructuring pattern.
 * * Usage Example:
 * `import { NotFoundException, BadRequestException } from '../exceptions';`
 * * Export Map:
 * - HttpException           — The core abstract parent exception blueprint.
 * - BadRequestException      — 400 Client payload or validation parameter validation failure.
 * - UnauthorizedException    — 401 Identity missing, expired session, or bad access credentials.
 * - ForbiddenException       — 403 User authenticated but lacks administrative or group role permissions.
 * - NotFoundException        — 404 Entity, route, or target lookup item could not be found.
 * - ConflictException        — 409 Server mutation collides with pre-existing database constraints.
 * - TooManyRequestsException — 429 Client hit rate-limiting barriers or traffic throttling rules.
 */

export { HttpException } from './HttpException';
export { BadRequestException } from './BadRequestException';
export { UnauthorizedException } from './UnauthorizedException';
export { ForbiddenException } from './ForbiddenException';
export { NotFoundException } from './NotFoundException';
export { ConflictException } from './ConflictException';
export { TooManyRequestsException } from './TooManyRequestsException';