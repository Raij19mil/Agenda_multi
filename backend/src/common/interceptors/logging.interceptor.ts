import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '../../logs/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logsService: LogsService) {}

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
    
    // Remover parâmetros de query e IDs
    const entity = segments.find(segment => 
      ['tenants', 'users', 'clients', 'appointments', 'themes', 'logs'].includes(segment)
    );

    return entity || 'UNKNOWN';
  }

  private extractEntityId(url: string, body: any, responseData: any): string | undefined {
    // Tentar extrair ID da URL
    const urlMatch = url.match(/\/([a-f0-9-]{36})/);
    if (urlMatch) {
      return urlMatch[1];
    }

    // Tentar extrair ID do body
    if (body && body.id) {
      return body.id;
    }

    // Tentar extrair ID da resposta
    if (responseData && responseData.id) {
      return responseData.id;
    }

    return undefined;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    
    // Remover campos sensíveis
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;

    return sanitized;
  }

  private sanitizeResponse(responseData: any): any {
    if (!responseData) return responseData;

    // Se for um array, limitar a 10 itens
    if (Array.isArray(responseData)) {
      return responseData.slice(0, 10);
    }

    // Se for um objeto, remover campos sensíveis
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
