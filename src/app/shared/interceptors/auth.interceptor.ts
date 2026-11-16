import { HttpInterceptorFn } from '@angular/common/http';
import { readStoredToken } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const token = readStoredToken();

    if (!token) {
        return next(request);
    }

    return next(
        request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        }),
    );
};
