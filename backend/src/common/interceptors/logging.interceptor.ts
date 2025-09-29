import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const { method, url, body, ip } = request;
    const userAgent = request.get('User-Agent');

    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Determinar a ação baseada no método HTTP e URL
          const action = this.getActionFromRequest(method, url);
          const entity = this.getEntityFromUrl(url);

          // COMENTAR OU REMOVER ESTE BLOCO:
          /*
          await this.logsService.logUserAction(
            action,
            entity,
            this.extractEntityId(url, body, data),
            {
              method,
              url,
              statusCode: response.statusCode,
              requestBody: this.sanitizeBody(body),
              responseData: this.sanitizeResponse(data),
            },
            user.tenantId,
            user.id,
            ip,
            userAgent,
          );
          */
          
          // Substituir por console.log temporariamente:
          console.log('Action logged:', {
            action,
            entity,
            userId: user.id,
            tenantId: user.tenantId,
            method,
            url,
          });
        } catch (error) {
          // Não falhar a requisição se o log falhar
          console.error('Erro ao registrar log:', error);
        }
      }),
    );
  }

  private getActionFromRequest(method: string, url: string): string {
    const actionMap = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
      GET: 'READ',
    };

    return actionMap[method] || 'UNKNOWN';
  }

  private getEntityFromUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    
    const entity = segments.find(segment => 
      ['tenants', 'users', 'clients', 'appointments', 'themes', 'logs'].includes(segment)
    );

    return entity || 'UNKNOWN';
  }

  private extractEntityId(url: string, body: any, responseData: any): string | undefined {
    const urlMatch = url.match(/\/([a-f0-9-]{36})/);
    if (urlMatch) {
      return urlMatch[1];
    }

    if (body && body.id) {
      return body.id;
    }

    if (responseData && responseData.id) {
      return responseData.id;
    }

    return undefined;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;

    return sanitized;
  }

  private sanitizeResponse(responseData: any): any {
    if (!responseData) return responseData;

    if (Array.isArray(responseData)) {
      return responseData.slice(0, 10);
    }

    if (typeof responseData === 'object') {
      const sanitized = { ...responseData };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      return sanitized;
    }

    return responseData;
  }
}