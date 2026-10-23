(window.MINDMAP = window.MINDMAP || {})['spring-3'] = {
  name: 'Spring MVC',
  groups: [
    { name: '프론트 컨트롤러', items: [
      { t: 'DispatcherServlet', deep: true,
        d: '모든 HTTP 요청을 가장 먼저 받아 알맞은 컨트롤러에 넘기는 스프링 MVC의 프론트 컨트롤러다.',
        why: '서블릿을 URL마다 따로 만들면 인코딩, 예외 처리, 뷰 렌더링 같은 공통 코드가 서블릿마다 반복된다. 요청 입구를 하나로 모아 공통 처리는 한 곳에서 하고, 컨트롤러는 비즈니스 처리에만 집중하게 하려는 것이다.',
        how: [
          '`HttpServlet`을 상속한 서블릿이며 상속 구조는 HttpServlet → HttpServletBean → FrameworkServlet → DispatcherServlet이다. 요청이 오면 `service()` → `processRequest()` → `doService()` → `doDispatch()` 순서로 들어가고, 핵심 로직은 `doDispatch()`에 있다.',
          '- 등록: 스프링 부트는 DispatcherServletAutoConfiguration으로 `/` 경로에 자동 등록한다. 모든 요청이 이 서블릿 하나로 들어온다.',
          '- 초기화: 처음 기동될 때 HandlerMapping, HandlerAdapter, ViewResolver, HandlerExceptionResolver 같은 전략 객체들을 스프링 컨테이너에서 찾아 목록으로 들고 있다.',
          '- 위임: 직접 요청을 처리하지 않고, 이 전략 객체들에게 "누가 처리할지 찾기", "실행하기", "뷰 찾기", "예외 바꾸기"를 차례로 맡긴다.',
          '- 확장성: 전략이 모두 인터페이스라 새 HandlerMapping이나 ArgumentResolver를 빈으로 등록하기만 하면 DispatcherServlet 코드를 고치지 않고 기능을 늘릴 수 있다.'
        ],
        code: `// doDispatch의 핵심 흐름을 단순화한 코드
protected void doDispatch(HttpServletRequest req, HttpServletResponse res) {
    HandlerExecutionChain chain = getHandler(req);       // HandlerMapping
    HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
    if (!chain.applyPreHandle(req, res)) return;          // Interceptor
    ModelAndView mv = ha.handle(req, res, chain.getHandler());
    chain.applyPostHandle(req, res, mv);
    processDispatchResult(req, res, chain, mv, exception); // 뷰 렌더링·예외 처리
}`,
        warn: [
          '스프링 MVC 바깥(Filter)에서 난 예외는 DispatcherServlet의 예외 처리 전략을 거치지 않는다.',
          'DispatcherServlet도 서블릿이라 싱글톤 하나가 모든 요청 스레드에서 동시에 실행된다.'
        ],
        qa: ['DispatcherServlet은 어떤 역할을 하나요?', '모든 요청을 받는 프론트 컨트롤러로, 요청을 직접 처리하지 않고 HandlerMapping으로 컨트롤러를 찾고 HandlerAdapter로 실행한 뒤 ViewResolver나 MessageConverter로 응답을 만듭니다. 공통 처리를 한곳에 모으고, 각 단계를 인터페이스 전략으로 위임해서 확장하기 쉬운 구조입니다.'],
        rel: ['요청 처리 흐름', 'HandlerMapping', 'HandlerAdapter', 'Filter'] },
      { t: '요청 처리 흐름', deep: true,
        d: 'HTTP 요청이 들어와 응답이 나갈 때까지 스프링 MVC 안에서 거치는 단계들이다.',
        why: '면접 단골 질문이며, 필터·인터셉터·예외 처리가 어디서 동작하는지 알아야 문제가 생겼을 때 원인을 찾을 수 있다.',
        how: [
          '1) 요청이 톰캣의 Filter 체인을 지나 DispatcherServlet에 도착한다.',
          '2) HandlerMapping이 URL과 HTTP 메서드로 처리할 핸들러(컨트롤러 메서드)와 적용할 Interceptor를 묶은 HandlerExecutionChain을 찾는다.',
          '3) 그 핸들러를 실행할 수 있는 HandlerAdapter를 찾는다. `@RequestMapping` 메서드는 RequestMappingHandlerAdapter가 담당한다.',
          '4) Interceptor의 `preHandle`이 실행된다. false를 반환하면 여기서 멈춘다.',
          '5) HandlerAdapter가 ArgumentResolver로 파라미터를 만들고 컨트롤러 메서드를 호출한다.',
          '6) ReturnValueHandler가 반환값을 처리한다. `@ResponseBody`면 HttpMessageConverter가 JSON으로 바꿔 응답 본문에 바로 쓰고, 뷰 이름이면 ModelAndView를 만든다.',
          '7) Interceptor의 `postHandle`이 실행된다.',
          '8) 뷰가 있으면 ViewResolver가 뷰 객체를 찾아 렌더링한다. 중간에 예외가 났다면 HandlerExceptionResolver가 응답으로 바꾼다.',
          '9) `afterCompletion`이 실행되고 응답이 Filter 체인을 거꾸로 지나 클라이언트로 나간다.'
        ],
        code: `요청
 → Filter 체인 (인코딩, 시큐리티, CORS)
 → DispatcherServlet
   → HandlerMapping      : GET /orders/1 → OrderController#get
   → HandlerAdapter      : 파라미터 바인딩 후 호출
   → Interceptor.preHandle
   → Controller          : OrderResponse 반환
   → HttpMessageConverter: 객체 → JSON
   → Interceptor.postHandle / afterCompletion
 → 응답`,
        warn: [
          '`@ResponseBody` 응답은 컨트롤러가 반환하는 시점에 이미 응답 본문이 쓰이므로 `postHandle`에서 응답을 바꿀 수 없다. 응답 공통 처리는 `ResponseBodyAdvice`를 쓴다.',
          '`afterCompletion`은 예외가 나도 실행되지만, `preHandle`이 true를 반환한 Interceptor에 대해서만 실행된다.'
        ],
        qa: ['Spring MVC의 요청 처리 흐름을 설명해 주세요.', '요청은 Filter를 지나 DispatcherServlet에 도착하고, HandlerMapping이 처리할 컨트롤러를 찾습니다. HandlerAdapter가 ArgumentResolver로 파라미터를 준비해 컨트롤러를 실행하고, 반환값은 @ResponseBody라면 MessageConverter가 JSON으로, 아니면 ViewResolver가 뷰를 찾아 렌더링합니다. 그 사이 Interceptor의 preHandle, postHandle, afterCompletion이 실행되고 예외는 HandlerExceptionResolver가 처리합니다.'],
        rel: ['DispatcherServlet', 'HandlerMapping', 'Interceptor', 'HttpMessageConverter'] }
    ]},
    { name: '핵심 컴포넌트', items: [
      { t: 'HandlerMapping', deep: false,
        d: '요청 URL과 HTTP 메서드를 보고 어떤 핸들러(컨트롤러 메서드)가 처리할지 찾아 주는 전략이다.',
        how: [
          '애플리케이션이 시작될 때 `@RequestMapping` 계열 애너테이션을 모두 읽어 "조건 → 메서드" 표를 만들어 둔다. 요청이 오면 경로, 메서드, 헤더, `consumes`/`produces` 조건을 비교해 가장 구체적인 핸들러를 고른다.',
          '- RequestMappingHandlerMapping: `@Controller`의 `@RequestMapping` 메서드를 찾는다. 가장 많이 쓴다.',
          '- BeanNameUrlHandlerMapping: 빈 이름을 URL로 쓰는 옛 방식.',
          '- 찾은 핸들러와 그 경로에 적용될 Interceptor를 HandlerExecutionChain으로 묶어 돌려준다.',
          '- 맞는 핸들러가 없으면 정적 리소스 핸들러로 넘어가고, 그것도 없으면 404가 된다.'
        ],
        rel: ['HandlerAdapter', 'DispatcherServlet', '요청 처리 흐름'] },
      { t: 'HandlerAdapter', deep: false,
        d: '찾은 핸들러를 실제로 호출하는 어댑터로, 핸들러 종류가 달라도 DispatcherServlet이 같은 방식으로 실행하게 해 준다.',
        how: [
          '핸들러는 `@RequestMapping` 메서드, `HttpRequestHandler`, 옛 `Controller` 인터페이스 등 형태가 제각각이다. 어댑터 패턴으로 각 형태를 `handle()`이라는 하나의 인터페이스로 맞춘다.',
          '- RequestMappingHandlerAdapter: `@RequestMapping` 메서드를 실행한다. 파라미터는 ArgumentResolver로 만들고, 반환값은 ReturnValueHandler로 처리한다.',
          '- 그래서 컨트롤러 메서드가 `@RequestBody`, `HttpServletRequest`, `Pageable` 등 원하는 파라미터를 자유롭게 선언할 수 있다.',
          '- 새 핸들러 형태를 지원하려면 어댑터만 추가하면 되고 DispatcherServlet은 바뀌지 않는다(OCP).'
        ],
        rel: ['HandlerMapping', 'ArgumentResolver'] },
      { t: 'ViewResolver', deep: false,
        d: '컨트롤러가 반환한 뷰 이름을 실제 뷰 객체(템플릿)로 바꿔 주는 전략이다.',
        how: [
          '`@Controller`가 `"order/detail"`을 반환하면 ViewResolver가 이를 `templates/order/detail.html` 같은 실제 템플릿으로 찾아 View 객체를 만들고, View가 모델 데이터를 넣어 HTML을 렌더링한다.',
          '- 스프링 부트는 Thymeleaf 의존성이 있으면 ThymeleafViewResolver를 자동 등록하고, 접두사 `classpath:/templates/`, 접미사 `.html`을 기본으로 쓴다.',
          '- `redirect:/orders`처럼 접두사를 붙이면 리다이렉트 뷰가 만들어진다.',
          '- `@ResponseBody`나 `@RestController` 응답은 ViewResolver를 거치지 않는다.'
        ],
        rel: ['@Controller', '@RestController', '요청 처리 흐름'] }
    ]},
    { name: '요청 가로채기', items: [
      { t: 'Filter', deep: true,
        d: '서블릿 컨테이너가 DispatcherServlet보다 앞에서 실행하는 서블릿 표준 기능으로, 요청과 응답 자체를 감싸거나 바꿀 수 있다.',
        why: '스프링 MVC에 들어오기 전에 모든 요청에 공통으로 해야 할 일(인코딩, 보안, 로깅, 요청 본문 캐싱)이 있다. 스프링과 무관하게 서블릿 단계에서 처리해야 하는 일을 맡는다.',
        how: [
          '`jakarta.servlet.Filter` 인터페이스의 `doFilter(request, response, chain)`을 구현한다. `chain.doFilter()`를 호출해야 다음 필터나 서블릿으로 넘어가며, 호출하지 않으면 요청이 거기서 끝난다.',
          '1) 톰캣이 요청을 받아 등록된 필터들을 순서대로 실행한다.',
          '2) 각 필터는 `chain.doFilter()` 전에 요청 전처리를, 후에 응답 후처리를 한다.',
          '3) 마지막 필터 다음에 DispatcherServlet이 실행된다.',
          '- 요청·응답 객체를 래퍼로 바꿔 다음 단계에 넘길 수 있다(예: `ContentCachingRequestWrapper`로 본문을 여러 번 읽기).',
          '- 스프링에서는 `OncePerRequestFilter`를 상속하면 포워드·에러 디스패치에서도 요청당 한 번만 실행된다.',
          '- 등록은 `@Component`(모든 URL) 또는 `FilterRegistrationBean`(URL 패턴, 순서 지정)으로 한다.',
          '- 대표 사례: CharacterEncodingFilter, 스프링 시큐리티(DelegatingFilterProxy), CorsFilter, 요청 로깅'
        ],
        code: `@Component
public class TraceIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        MDC.put("traceId", UUID.randomUUID().toString());
        try {
            chain.doFilter(req, res);   // 다음 필터 → DispatcherServlet
        } finally {
            MDC.clear();
        }
    }
}`,
        warn: [
          'Filter에서 던진 예외는 DispatcherServlet 밖이라 `@ControllerAdvice`로 잡히지 않는다. 필터 안에서 직접 응답을 쓰거나 별도 처리가 필요하다.',
          '`chain.doFilter()` 호출을 빠뜨리면 요청이 컨트롤러까지 가지 않는다.',
          '어떤 컨트롤러로 갈지 모르므로 핸들러 정보(애너테이션 등)가 필요한 처리는 Interceptor가 맞다.'
        ],
        qa: ['Filter와 Interceptor의 차이는 무엇인가요?', 'Filter는 서블릿 스펙이라 톰캣이 DispatcherServlet 앞에서 실행하고, 요청과 응답 객체 자체를 바꿀 수 있어 인코딩이나 보안, 로깅에 씁니다. Interceptor는 스프링 MVC 기능이라 DispatcherServlet 안에서 컨트롤러 전후에 실행되고 어떤 핸들러가 실행되는지 알 수 있어 인증 체크나 권한 처리에 씁니다. Filter 예외는 ControllerAdvice로 처리되지 않는다는 차이도 있습니다.'],
        rel: ['Interceptor', 'DispatcherServlet', 'DelegatingFilterProxy'] },
      { t: 'Interceptor', deep: true,
        d: '스프링 MVC 안에서 컨트롤러 실행 전후와 요청 완료 시점에 끼어드는 스프링의 기능이다.',
        why: '로그인 확인이나 권한 체크처럼 "어떤 컨트롤러가 실행되는지" 알아야 하는 공통 처리를 컨트롤러마다 반복하지 않고 한곳에서 하려는 것이다.',
        how: [
          '`HandlerInterceptor` 인터페이스의 세 메서드를 필요한 것만 구현하고, `WebMvcConfigurer.addInterceptors()`로 경로 패턴과 함께 등록한다.',
          '1) `preHandle(request, response, handler)`: 컨트롤러 호출 전. false를 반환하면 컨트롤러를 실행하지 않고 끝낸다. 로그인 체크에 쓴다.',
          '2) `postHandle(request, response, handler, modelAndView)`: 컨트롤러가 정상 반환한 뒤, 뷰 렌더링 전. 예외가 나면 호출되지 않는다.',
          '3) `afterCompletion(request, response, handler, ex)`: 뷰 렌더링까지 끝난 뒤 항상 호출된다. 예외 정보를 받을 수 있어 정리 작업과 로그에 쓴다.',
          '- `handler` 파라미터가 보통 `HandlerMethod`라서, 실행될 메서드의 애너테이션(`@LoginRequired` 등)을 읽어 조건부로 처리할 수 있다.',
          '- 스프링 빈이므로 다른 빈을 주입받아 쓸 수 있다.',
          '- 여러 Interceptor는 등록 순서대로 `preHandle`이 실행되고, `postHandle`과 `afterCompletion`은 역순으로 실행된다.'
        ],
        code: `public class LoginCheckInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (handler instanceof HandlerMethod hm && hm.hasMethodAnnotation(LoginRequired.class)
                && req.getSession(false) == null) {
            res.setStatus(401);
            return false;               // 컨트롤러 실행 안 함
        }
        return true;
    }
}

@Configuration
class WebConfig implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(new LoginCheckInterceptor()).addPathPatterns("/api/**");
    }
}`,
        warn: [
          '`@ResponseBody` 응답은 컨트롤러 반환 시점에 이미 본문이 쓰여 `postHandle`에서 바꿀 수 없다.',
          '요청·응답 객체 자체를 다른 객체로 바꿔 넘길 수는 없다. 그런 처리는 Filter에서 한다.',
          'Interceptor에서 난 예외는 DispatcherServlet 안이므로 `@ControllerAdvice`로 처리된다.'
        ],
        qa: ['로그인 체크는 Filter와 Interceptor 중 어디서 하나요?', '스프링 시큐리티처럼 전체 요청을 보안 정책으로 다룰 때는 Filter에서 처리합니다. 반면 특정 애너테이션이 붙은 컨트롤러만 확인하는 등 핸들러 정보가 필요하거나 스프링 빈을 활용하는 간단한 인증 체크라면 Interceptor의 preHandle에서 false를 반환해 막는 방식이 편합니다.'],
        rel: ['Filter', '요청 처리 흐름', 'HandlerMapping'] }
    ]},
    { name: '파라미터 바인딩', items: [
      { t: '@RequestParam', deep: false,
        d: '쿼리 스트링이나 폼 데이터의 값 하나를 메서드 파라미터로 받는 애너테이션이다.',
        how: [
          '`GET /orders?status=PAID&page=2`에서 `@RequestParam String status`처럼 받는다. 문자열은 ConversionService가 `int`, `LocalDate`, enum 등으로 변환한다.',
          '- `required`(기본 true): 값이 없으면 400 오류. `required = false`나 `defaultValue`로 바꾼다.',
          '- 파라미터 이름이 같으면 이름을 생략할 수 있다. 단, 컴파일 시 `-parameters` 옵션이 필요하다(스프링 부트 Gradle 설정은 기본 포함).',
          '- 단순 타입은 애너테이션을 생략해도 `@RequestParam`으로 처리되지만, 의도를 드러내려면 붙이는 편이 좋다.',
          '- `List<String>`으로 같은 이름의 여러 값을, `Map<String, String>`으로 전체 파라미터를 받을 수 있다.'
        ],
        code: `@GetMapping("/orders")
public List<OrderDto> list(@RequestParam(defaultValue = "PAID") OrderStatus status,
                           @RequestParam(required = false) LocalDate from) { ... }`,
        rel: ['@PathVariable', '@ModelAttribute'] },
      { t: '@PathVariable', deep: false,
        d: 'URL 경로 안의 변수 값을 메서드 파라미터로 받는 애너테이션이다.',
        how: [
          '`@GetMapping("/users/{userId}/orders/{orderId}")`에서 `{userId}` 부분을 `@PathVariable Long userId`로 받는다. 자원을 식별하는 값은 경로에, 필터·정렬 조건은 쿼리 스트링에 두는 것이 REST 관례다.',
          '- 타입 변환에 실패하면(`/users/abc`를 Long으로) `MethodArgumentTypeMismatchException`으로 400이 된다.',
          '- 정규식 제약을 걸 수 있다: `{id:\\d+}`',
          '- 값이 없으면 핸들러 자체가 매칭되지 않으므로 보통 필수다.'
        ],
        rel: ['@RequestParam', 'HandlerMapping'] },
      { t: '@ModelAttribute', deep: false,
        d: '여러 요청 파라미터를 객체의 필드에 한꺼번에 바인딩하는 애너테이션이다.',
        how: [
          '쿼리 스트링이나 폼 데이터(`application/x-www-form-urlencoded`)의 이름과 객체의 프로퍼티 이름을 맞춰 값을 넣는다. 생성자 바인딩(record 포함)이나 setter를 사용한다.',
          '- JSON 본문은 읽지 않는다. JSON은 `@RequestBody`를 쓴다.',
          '- 단순 타입이 아닌 객체 파라미터는 애너테이션을 생략해도 `@ModelAttribute`로 처리된다.',
          '- 타입 변환 실패는 BindingResult에 담기며, BindingResult를 파라미터로 받지 않으면 400 오류가 된다.',
          '- 검색 조건 객체(`OrderSearch`)를 받을 때 많이 쓴다.'
        ],
        code: `public record OrderSearch(OrderStatus status, LocalDate from, LocalDate to) {}

@GetMapping("/orders")
public Page<OrderDto> search(@ModelAttribute OrderSearch cond, Pageable pageable) { ... }`,
        rel: ['@RequestBody', '@RequestParam', '@Valid 검증'] },
      { t: '@RequestBody', deep: false,
        d: 'HTTP 요청 본문(JSON 등)을 HttpMessageConverter로 읽어 객체로 바꾸는 애너테이션이다.',
        how: [
          '요청의 `Content-Type`을 보고 맞는 HttpMessageConverter를 고른다. JSON은 Jackson이 처리하며, 기본 생성자 + 필드 접근, 또는 생성자·record로 객체를 만든다.',
          '- 본문은 스트림이라 한 번만 읽을 수 있다. `@RequestBody`는 메서드당 하나만 쓴다.',
          '- JSON 형식이 잘못되면 `HttpMessageNotReadableException`으로 400이 된다.',
          '- `Content-Type`이 지원되지 않으면 415 Unsupported Media Type.',
          '- `@Valid`를 함께 붙이면 변환 후 검증까지 한다.'
        ],
        code: `@PostMapping("/orders")
public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) { ... }`,
        rel: ['HttpMessageConverter', '@ModelAttribute', '@Valid 검증'] },
      { t: 'ArgumentResolver', deep: false,
        d: '컨트롤러 메서드의 각 파라미터 값을 만들어 주는 전략 인터페이스다.',
        how: [
          'RequestMappingHandlerAdapter는 메서드를 호출하기 전에 파라미터마다 `supportsParameter()`가 true인 리졸버를 찾아 `resolveArgument()`로 값을 만든다. 스프링에는 30개가 넘는 리졸버가 기본 등록되어 있다.',
          '- `@RequestParam`, `@PathVariable`, `@ModelAttribute`, `@RequestBody`, `HttpServletRequest`, `Pageable`, `@AuthenticationPrincipal` 모두 리졸버가 처리한다.',
          '- 직접 구현해 `WebMvcConfigurer.addArgumentResolvers()`로 등록하면 `@LoginUser User user` 같은 커스텀 파라미터를 만들 수 있다.',
          '- 반환값 쪽은 짝이 되는 HandlerMethodReturnValueHandler가 처리한다.'
        ],
        code: `public class LoginUserResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(LoginUser.class);
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer mav,
                                  NativeWebRequest req, WebDataBinderFactory f) {
        return userRepository.findById(sessionUserId(req)).orElseThrow();
    }
}`,
        rel: ['HandlerAdapter', 'HttpMessageConverter', '@RequestParam'] },
      { t: 'HttpMessageConverter', deep: false,
        d: 'HTTP 본문과 자바 객체 사이를 변환하는 전략 인터페이스다.',
        how: [
          '요청은 `@RequestBody`, `HttpEntity`일 때, 응답은 `@ResponseBody`, `ResponseEntity`일 때 쓰인다. 요청은 `Content-Type`, 응답은 `Accept` 헤더와 반환 타입을 보고 `canRead()`/`canWrite()`가 true인 컨버터를 고른다.',
          '- ByteArrayHttpMessageConverter: `byte[]`',
          '- StringHttpMessageConverter: `String`을 텍스트 그대로',
          '- MappingJackson2HttpMessageConverter: 객체 ↔ JSON (Jackson ObjectMapper 사용)',
          '스프링 부트는 자동 설정된 ObjectMapper를 쓰므로 `spring.jackson.*` 설정이나 `Jackson2ObjectMapperBuilderCustomizer` 빈으로 날짜 형식, null 처리 등을 바꾼다.'
        ],
        warn: ['String을 반환하면 Jackson이 아니라 StringHttpMessageConverter가 선택되어 JSON 따옴표 없이 그대로 나간다.'],
        rel: ['@RequestBody', '@RestController', 'ArgumentResolver'] },
      { t: '@Valid 검증', deep: false,
        d: 'Bean Validation 애너테이션으로 요청 값을 선언적으로 검증하는 방법이다.',
        how: [
          'DTO 필드에 `@NotBlank`, `@Email`, `@Positive`, `@Size` 같은 제약을 붙이고 파라미터에 `@Valid`(또는 스프링의 `@Validated`)를 붙이면 바인딩 후 Hibernate Validator가 검증한다. `spring-boot-starter-validation` 의존성이 필요하다.',
          '- `@RequestBody` 검증 실패: `MethodArgumentNotValidException` → 기본 400',
          '- `@ModelAttribute` 검증 실패: `BindingResult`로 받거나, 받지 않으면 예외 → 400',
          '- `@Validated`는 그룹 검증을 지원하고, 클래스에 붙이면 `@RequestParam` 같은 단일 파라미터 제약도 검증한다.',
          '- 중첩 객체를 검증하려면 필드에도 `@Valid`를 붙인다.',
          '실패 응답은 보통 `@RestControllerAdvice`에서 필드별 오류 메시지로 바꿔 내려준다.'
        ],
        code: `public record CreateOrderRequest(
    @NotNull Long productId,
    @Positive int quantity,
    @NotBlank String address) {}`,
        rel: ['@RequestBody', '@RestControllerAdvice', '@ModelAttribute'] }
    ]},
    { name: '컨트롤러 종류', items: [
      { t: '@Controller', deep: false,
        d: '뷰(HTML 템플릿)를 반환하는 전통적인 MVC 컨트롤러를 표시하는 애너테이션이다.',
        how: [
          '`@Component`를 포함하므로 컴포넌트 스캔으로 빈이 되고, RequestMappingHandlerMapping이 이 클래스의 매핑 메서드를 등록한다.',
          '- 메서드가 String을 반환하면 뷰 이름으로 해석되어 ViewResolver가 템플릿을 찾는다.',
          '- `Model` 파라미터에 데이터를 담으면 뷰에서 사용할 수 있다.',
          '- 메서드에 `@ResponseBody`를 붙이면 그 메서드만 JSON 응답을 한다.'
        ],
        code: `@Controller
public class OrderPageController {
    @GetMapping("/orders/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("order", orderService.find(id));
        return "order/detail";        // templates/order/detail.html
    }
}`,
        rel: ['@RestController', 'ViewResolver'] },
      { t: '@RestController', deep: false,
        d: '`@Controller`와 `@ResponseBody`를 합친 애너테이션으로, 모든 메서드의 반환값을 응답 본문에 직접 쓴다.',
        how: [
          '반환값이 뷰를 거치지 않고 HttpMessageConverter로 직렬화되어 응답 본문이 된다. 객체는 JSON으로, String은 텍스트 그대로 나간다.',
          '- REST API 서버의 컨트롤러는 대부분 `@RestController`를 쓴다.',
          '- 상태 코드나 헤더까지 정하려면 `ResponseEntity`를 반환한다.',
          '- 엔티티를 그대로 반환하지 말고 응답 전용 DTO로 바꿔 반환한다(지연 로딩 예외, 순환 참조, 내부 구조 노출 방지).'
        ],
        rel: ['@Controller', 'ResponseEntity', 'HttpMessageConverter'] },
      { t: 'ResponseEntity', deep: false,
        d: '응답 본문뿐 아니라 HTTP 상태 코드와 헤더까지 함께 표현하는 반환 타입이다.',
        how: [
          '단순 객체를 반환하면 항상 200이지만, `ResponseEntity`를 쓰면 상황에 맞는 상태 코드를 줄 수 있다.',
          '- 생성: `ResponseEntity.created(uri).body(dto)` → 201과 Location 헤더',
          '- 본문 없음: `ResponseEntity.noContent().build()` → 204',
          '- 헤더 추가: `.header("Cache-Control", "no-store")`',
          '항상 같은 상태 코드라면 객체를 반환하고 `@ResponseStatus`를 붙이는 것도 방법이다.'
        ],
        code: `@PostMapping("/orders")
public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
    OrderResponse res = orderService.create(req);
    return ResponseEntity.created(URI.create("/orders/" + res.id())).body(res);
}`,
        rel: ['@RestController', 'ProblemDetail'] }
    ]},
    { name: '예외 처리', items: [
      { t: '@ExceptionHandler', deep: false,
        d: '특정 예외가 발생했을 때 실행할 처리 메서드를 지정하는 애너테이션이다.',
        how: [
          '컨트롤러 안에 두면 그 컨트롤러에서 난 예외만 처리하고, `@RestControllerAdvice` 클래스에 두면 전체에 적용된다. 컨트롤러 안의 핸들러가 Advice보다 우선한다.',
          '- 처리할 예외 타입은 애너테이션 속성이나 메서드 파라미터로 지정한다. 여러 핸들러가 맞으면 가장 구체적인(하위) 예외 타입의 핸들러가 선택된다.',
          '- 반환값은 일반 컨트롤러처럼 처리되므로 DTO, `ResponseEntity`, `ProblemDetail`을 반환할 수 있다.',
          '- `@ResponseStatus`를 함께 붙여 상태 코드를 정한다. 붙이지 않으면 200이 나가는 실수를 하기 쉽다.',
          'ExceptionHandlerExceptionResolver가 이 메서드를 찾아 실행한다.'
        ],
        code: `@ExceptionHandler(OrderNotFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public ErrorResponse notFound(OrderNotFoundException e) {
    return new ErrorResponse("ORDER_NOT_FOUND", e.getMessage());
}`,
        rel: ['@RestControllerAdvice', 'HandlerExceptionResolver'] },
      { t: '@RestControllerAdvice', deep: false,
        d: '여러 컨트롤러에 공통으로 적용할 예외 처리를 한 클래스에 모으는 애너테이션이다.',
        how: [
          '`@ControllerAdvice` + `@ResponseBody`다. 이 클래스 안의 `@ExceptionHandler` 메서드가 모든 컨트롤러에서 난 예외를 처리한다.',
          '- 적용 범위를 좁힐 수 있다: `basePackages`, `assignableTypes`, `annotations` 속성',
          '- 실무 패턴: 비즈니스 예외의 공통 부모(`BusinessException`)와 에러 코드 enum을 두고, Advice 하나에서 `{code, message}` 형식의 일관된 응답으로 바꾼다. 예상하지 못한 `Exception`은 500으로 처리하고 로그를 남긴다.',
          '- 검증 실패(`MethodArgumentNotValidException`)를 필드별 오류 목록으로 바꾸는 것도 여기서 한다.',
          '- `ResponseEntityExceptionHandler`를 상속하면 스프링 MVC 기본 예외들이 `ProblemDetail` 형식으로 처리된다.'
        ],
        code: `@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> business(BusinessException e) {
        return ResponseEntity.status(e.getCode().status()).body(ErrorResponse.of(e.getCode()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> unknown(Exception e) {
        log.error("unexpected", e);
        return ResponseEntity.internalServerError().body(ErrorResponse.of(ErrorCode.INTERNAL));
    }
}`,
        warn: ['Filter에서 난 예외는 DispatcherServlet 밖이라 여기서 잡히지 않는다.'],
        rel: ['@ExceptionHandler', 'ProblemDetail', '@Valid 검증', 'Filter'] },
      { t: 'HandlerExceptionResolver', deep: false,
        d: '컨트롤러 처리 중 발생한 예외를 응답으로 바꾸는 DispatcherServlet의 예외 처리 전략이다.',
        how: [
          '예외가 나면 DispatcherServlet이 등록된 리졸버들을 순서대로 호출하고, 처음으로 예외를 처리한 리졸버의 결과를 응답으로 쓴다.',
          '- ExceptionHandlerExceptionResolver: `@ExceptionHandler` 메서드를 실행한다. 가장 먼저 동작한다.',
          '- ResponseStatusExceptionResolver: `@ResponseStatus`가 붙은 예외나 `ResponseStatusException`의 상태 코드를 적용한다.',
          '- DefaultHandlerExceptionResolver: 스프링 내부 예외를 알맞은 4xx/5xx로 바꾼다(타입 변환 실패 → 400, 지원하지 않는 메서드 → 405).',
          '어떤 리졸버도 처리하지 못한 예외는 서블릿 컨테이너까지 올라가고, 스프링 부트는 `/error`로 다시 요청해 BasicErrorController가 기본 에러 응답을 만든다.'
        ],
        rel: ['@ExceptionHandler', 'DispatcherServlet'] },
      { t: 'ProblemDetail', deep: false,
        d: 'HTTP API 오류 응답의 표준 형식(RFC 9457, 이전 RFC 7807)을 표현하는 스프링 6의 클래스다.',
        how: [
          '`type`, `title`, `status`, `detail`, `instance` 필드와 임의의 확장 속성을 가지며 `application/problem+json`으로 응답한다. 팀마다 다른 에러 형식 대신 표준을 따를 수 있다.',
          '- `@ExceptionHandler`에서 `ProblemDetail`을 반환하면 된다.',
          '- `spring.mvc.problemdetails.enabled=true`로 스프링 MVC 기본 예외도 이 형식으로 응답한다.',
          '- `setProperty("code", "ORDER_NOT_FOUND")`로 서비스 고유 에러 코드를 추가할 수 있다.'
        ],
        code: `@ExceptionHandler(OrderNotFoundException.class)
public ProblemDetail notFound(OrderNotFoundException e) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    pd.setProperty("code", "ORDER_NOT_FOUND");
    return pd;
}`,
        rel: ['@RestControllerAdvice', 'ResponseEntity'] }
    ]}
  ],
  must: [
    '컨트롤러도 싱글톤이라 여러 요청 스레드가 동시에 같은 인스턴스를 실행한다.',
    '`@RequestBody`는 JSON 본문을 Jackson으로 변환하고, `@ModelAttribute`는 쿼리·폼 파라미터를 바인딩한다.',
    '`@Valid`로 검증하고, 실패하면 `MethodArgumentNotValidException`이 발생한다.',
    'Filter에서 던진 예외는 DispatcherServlet 밖이라 `@ControllerAdvice`로 잡히지 않는다.'
  ]
};
