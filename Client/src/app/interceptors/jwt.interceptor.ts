import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  req = req.clone({
    withCredentials: true, // jwt cookie which was set on the backend will be passed on all requests using withCredentials
  });
  return next(req);
};
