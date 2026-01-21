import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: any = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        statusCode: 500,
      },
    };

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaHandled = this.handlePrismaError(exception);
      status = prismaHandled.statusCode;
      errorResponse.error = prismaHandled;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      errorResponse.error = {
        code: 'HTTP_EXCEPTION',
        message:
          typeof response === 'string' ? response : (response as any).message,
        statusCode: status,
      };
    }

    const logData = {
      statusCode: status,
      timestamp,
      path: url,
      method,
      ip,
      userAgent,
      exception:
        exception instanceof Error ? exception.message : 'Unknown exception',
    };

    if (status >= 500) {
      this.logger.error(
        `${method} ${url} ${status} - Error: ${logData.exception}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `${method} ${url} ${status} - Client Error: ${logData.exception}`,
      );
    }

    return res.status(status).json({
      ...errorResponse,
    });
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002': {
        const field = (exception.meta?.target as string[])?.[0];
        return {
          code: 'UNIQUE_CONSTRAINT_FAILED',
          message: `${field} đã tồn tại`,
          statusCode: HttpStatus.CONFLICT,
        };
      }
      default:
        return {
          code: 'PRISMA_ERROR',
          message: 'Database error occurred',
          statusCode: HttpStatus.BAD_REQUEST,
        };
    }
  }
}
