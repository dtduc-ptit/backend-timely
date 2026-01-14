import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, res);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, res);
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        statusCode: 500,
      },
    });
  }

  private handleHttpException(exception: HttpException, res: Response) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    return res.status(status).json({
      success: false,
      error: {
        code: 'HTTP_EXCEPTION',
        message:
          typeof response === 'string' ? response : (response as any).message,
        statusCode: status,
      },
    });
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    res: Response,
  ) {
    if (exception.code === 'P2002') {
      const field = (exception.meta?.target as string[])?.[0];

      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_FAILED',
          message: `${field} đã tồn tại`,
          statusCode: 409,
        },
      });
    }

    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'PRISMA_ERROR',
        message: 'Database error',
        statusCode: 400,
      },
    });
  }
}
