(window.MINDMAP_X = window.MINDMAP_X || {})['spring-3'] = {
  groups: {
    '요청 가로채기': { cmp: {
      cols: ['기준', 'Filter', 'Interceptor'],
      rows: [
        ['소속', '서블릿 스펙(톰캣)', '스프링 MVC'],
        ['실행 위치', 'DispatcherServlet 앞', 'DispatcherServlet 안'],
        ['핸들러 정보 접근', '불가', '가능(HandlerMethod)'],
        ['요청·응답 객체 교체', '가능(래퍼)', '불가'],
        ['@ControllerAdvice 처리', '안 됨', '됨']
      ] } },
    '파라미터 바인딩': { cmp: {
      cols: ['기준', '@RequestParam', '@PathVariable', '@ModelAttribute', '@RequestBody'],
      rows: [
        ['값의 위치', '쿼리·폼 값 하나', 'URL 경로', '쿼리·폼 여러 값', 'HTTP 본문'],
        ['변환 주체', 'ConversionService', 'ConversionService', 'WebDataBinder', 'HttpMessageConverter'],
        ['대상 타입', '단순 타입', '단순 타입', '객체', '객체(JSON)'],
        ['실패 시 예외', 'MissingServletRequest…', 'TypeMismatch', 'BindException', 'NotReadable(400)']
      ] } },
    '컨트롤러 종류': { cmp: {
      cols: ['기준', '@Controller', '@RestController'],
      rows: [
        ['반환값 처리', '뷰 이름 → ViewResolver', '본문 → MessageConverter'],
        ['주요 용도', '서버 렌더링 HTML', 'REST API(JSON)'],
        ['@ResponseBody', '메서드마다 필요', '모든 메서드에 기본'],
        ['Model 사용', '자주 사용', '거의 안 씀']
      ] } },
    '프론트 컨트롤러': { cmp: {
      cols: ['기준', 'DispatcherServlet', '요청 처리 흐름'],
      rows: [
        ['무엇인가', '프론트 컨트롤러 서블릿', '요청부터 응답까지의 단계'],
        ['하는 일', '요청 수신, 처리 위임', '각 컴포넌트 호출 순서'],
        ['핵심 구성', 'HandlerMapping·Adapter 등', '매핑→인터셉터→컨트롤러→변환'],
        ['REST 응답', 'MessageConverter에 위임', '뷰 렌더링 단계 생략']
      ]
    } },
    '핵심 컴포넌트': { cmp: {
      cols: ['기준', 'HandlerMapping', 'HandlerAdapter', 'ViewResolver'],
      rows: [
        ['하는 일', '요청에 맞는 핸들러 찾기', '찾은 핸들러 실제 호출', '뷰 이름을 뷰 객체로 변환'],
        ['호출 순서', '첫 번째', '두 번째', '세 번째 (뷰 반환 시)'],
        ['입력 → 출력', '요청 → 핸들러+인터셉터', '핸들러 → ModelAndView', '뷰 이름 → View'],
        ['대표 구현', '`RequestMappingHandlerMapping`', '`RequestMappingHandlerAdapter`', '`ThymeleafViewResolver`']
      ]
    } },
    '예외 처리': { cmp: {
      cols: ['개념', '적용 범위', '역할', '예시'],
      rows: [
        ['@ExceptionHandler', '선언된 컨트롤러·Advice', '예외별 처리 메서드 지정', '`@ExceptionHandler(NotFound.class)`'],
        ['@RestControllerAdvice', '여러 컨트롤러 전역', '공통 예외 처리 모음', '`GlobalExceptionHandler`'],
        ['HandlerExceptionResolver', 'DispatcherServlet 수준', '예외를 응답으로 변환', '`ExceptionHandlerExceptionResolver`'],
        ['ProblemDetail', '오류 응답 본문', 'RFC 9457 표준 형식', '`type`, `title`, `status`, `detail`']
      ]
    } }
  },
  items: {
    'DispatcherServlet': {
      ans: 'DispatcherServlet은 모든 HTTP 요청을 가장 먼저 받는 스프링 MVC의 프론트 컨트롤러입니다. 요청을 직접 처리하지 않고 HandlerMapping으로 처리할 컨트롤러를 찾고, HandlerAdapter로 실행한 뒤, MessageConverter나 ViewResolver로 응답을 만듭니다. 공통 처리를 한곳에 모으고 각 단계를 교체 가능한 전략으로 위임하는 구조입니다.',
      ana: '호텔 프런트 데스크입니다. 모든 손님이 먼저 들르고, 프런트는 요청을 알맞은 부서(컨트롤러)로 연결해 줍니다.',
      flow: ['service() 진입', 'doDispatch() 호출', 'HandlerMapping 조회', 'HandlerAdapter 선택', '컨트롤러 실행', '응답 생성·예외 처리'],
      use: ['커스텀 ArgumentResolver나 Interceptor를 빈으로 등록하면 DispatcherServlet 수정 없이 기능이 추가된다.', '디버깅 시 doDispatch()에 중단점을 걸어 요청이 어떤 핸들러로 가는지 확인한다.'],
      myth: [['컨트롤러마다 DispatcherServlet이 하나씩 있다.', '스프링 부트에서는 / 경로에 DispatcherServlet 하나만 등록되어 모든 요청을 받는다.']],
      fq: [['프론트 컨트롤러 패턴의 장점은 무엇인가요?', '인코딩, 예외 처리, 뷰 렌더링 같은 공통 처리를 한곳에서 하므로 중복이 사라지고, 개별 컨트롤러는 서블릿 API에 의존하지 않고 비즈니스 처리에만 집중할 수 있습니다.'], ['DispatcherServlet은 스레드 안전한가요?', '서블릿은 싱글톤 하나가 모든 요청 스레드에서 동시에 실행됩니다. DispatcherServlet은 요청별 상태를 필드에 두지 않고 지역 변수와 요청 객체로 처리하므로 안전합니다.']]
    },
    '요청 처리 흐름': {
      ans: '요청은 Filter 체인을 지나 DispatcherServlet에 도착하고, HandlerMapping이 처리할 컨트롤러와 Interceptor를 찾습니다. HandlerAdapter가 ArgumentResolver로 파라미터를 준비해 컨트롤러를 실행하며, 그 전후로 Interceptor가 동작합니다. 반환값은 @ResponseBody면 MessageConverter가 JSON으로 바꾸고, 아니면 ViewResolver가 뷰를 찾아 렌더링합니다.',
      ana: '공항 출국 절차와 같습니다. 보안 검색(Filter), 탑승구 안내(HandlerMapping), 탑승 수속(Interceptor), 탑승(컨트롤러) 순서로 지나갑니다.',
      flow: ['Filter 체인 통과', 'HandlerMapping 조회', 'Interceptor preHandle', '파라미터 바인딩·실행', '반환값 변환(JSON/뷰)', 'postHandle, 완료 처리'],
      use: ['요청이 컨트롤러에 도달하지 않을 때 Filter와 Interceptor 중 어디서 막혔는지 흐름 순서로 원인을 좁힌다.', 'API 응답 공통 포맷은 postHandle이 아니라 ResponseBodyAdvice로 처리한다.'],
      myth: [['postHandle에서 @ResponseBody 응답 본문을 바꿀 수 있다.', '본문은 컨트롤러 반환 직후 MessageConverter가 이미 써 버린다. 본문을 바꾸려면 ResponseBodyAdvice를 써야 한다.']],
      fq: [['예외가 나면 흐름이 어떻게 바뀌나요?', '컨트롤러나 Interceptor에서 예외가 나면 postHandle은 건너뛰고 HandlerExceptionResolver가 예외를 응답으로 바꿉니다. afterCompletion은 예외 정보와 함께 호출됩니다.'], ['Interceptor가 여러 개면 순서는 어떻게 되나요?', 'preHandle은 등록 순서대로, postHandle과 afterCompletion은 역순으로 실행됩니다. preHandle이 false를 반환하면 이후 Interceptor와 컨트롤러는 실행되지 않습니다.']]
    },
    'HandlerMapping': {
      why: '들어온 요청을 어떤 컨트롤러 메서드가 처리할지 정하는 과정을 알아야 404나 매핑 충돌을 해결할 수 있기 때문이다.',
      ans: 'HandlerMapping은 요청 URL과 HTTP 메서드를 보고 처리할 핸들러, 즉 컨트롤러 메서드를 찾아 주는 전략입니다. 애플리케이션 시작 시 @RequestMapping 정보를 모두 읽어 매핑 표를 만들어 두고, 요청이 오면 가장 구체적인 핸들러와 적용할 Interceptor를 묶어 돌려줍니다.',
      ana: '건물 안내판입니다. 방문 목적(URL)을 보고 몇 층 몇 호(메서드)로 가야 하는지 알려 줍니다.',
      use: ['같은 URL을 HTTP 메서드나 produces 조건으로 나눠 서로 다른 메서드에 매핑한다.'],
      fq: [['매칭되는 핸들러가 둘 이상이면 어떻게 되나요?', '경로 패턴이 더 구체적인 쪽(와일드카드가 적은 쪽)이 선택됩니다. 우선순위가 같은 매핑이 겹치면 시작 시점에 모호한 매핑 오류로 기동이 실패합니다.']]
    },
    'HandlerAdapter': {
      why: '형태가 다른 여러 핸들러를 DispatcherServlet이 하나의 방식으로 실행해, 새 핸들러 종류가 생겨도 디스패처를 고치지 않기 위해서다.',
      ans: 'HandlerAdapter는 찾아낸 핸들러를 실제로 호출하는 어댑터입니다. 핸들러 형태가 제각각이어도 DispatcherServlet은 handle()이라는 하나의 방식으로 실행할 수 있습니다. @RequestMapping 메서드는 RequestMappingHandlerAdapter가 파라미터 바인딩과 반환값 처리까지 맡습니다.',
      ana: '여행용 멀티 어댑터입니다. 나라마다 콘센트(핸들러) 모양이 달라도 같은 충전기(DispatcherServlet)를 꽂을 수 있게 해 줍니다.',
      use: ['컨트롤러 메서드에 Pageable, @AuthenticationPrincipal 같은 다양한 파라미터를 선언할 수 있는 것은 RequestMappingHandlerAdapter 덕분이다.'],
      fq: [['HandlerMapping과 HandlerAdapter를 왜 나눴나요?', '찾는 일과 실행하는 일을 분리해 새로운 핸들러 형태를 지원할 때 어댑터만 추가하면 되도록 하기 위해서입니다. DispatcherServlet 코드를 고치지 않아도 되므로 OCP를 지키는 설계입니다.']]
    },
    'ViewResolver': {
      why: '컨트롤러가 템플릿 기술과 파일 위치를 몰라도 뷰 이름만으로 화면을 렌더링하게 하기 위해서다.',
      ans: 'ViewResolver는 컨트롤러가 반환한 뷰 이름을 실제 템플릿 뷰 객체로 바꿔 주는 전략입니다. 스프링 부트에서 Thymeleaf를 쓰면 templates 폴더와 .html 접미사를 기본으로 해석합니다. @ResponseBody 응답은 ViewResolver를 거치지 않습니다.',
      use: ['"order/detail"을 반환하면 templates/order/detail.html이 렌더링된다.', '"redirect:/orders"를 반환해 POST 처리 후 목록으로 리다이렉트한다(PRG 패턴).'],
      fq: [['REST API 서버에서도 ViewResolver가 쓰이나요?', '@RestController 응답은 MessageConverter가 본문에 바로 쓰므로 ViewResolver를 거치지 않습니다. 기본 에러 페이지처럼 뷰를 렌더링하는 경우에만 쓰입니다.']]
    },
    'Filter': {
      ans: 'Filter는 서블릿 스펙의 기능으로, 톰캣이 DispatcherServlet보다 앞에서 실행합니다. 요청과 응답 객체 자체를 래핑하거나 바꿀 수 있어 인코딩, 보안, CORS, 요청 로깅처럼 모든 요청에 공통으로 필요한 처리에 씁니다. 스프링 MVC 밖이라 Filter에서 난 예외는 @ControllerAdvice로 처리되지 않습니다.',
      ana: '건물 정문 보안 검색대입니다. 누가 어느 사무실로 가는지는 모르지만 들어오는 모든 사람을 먼저 검사합니다.',
      flow: ['톰캣이 요청 수신', '등록 순서대로 Filter 실행', 'chain.doFilter 전 전처리', 'DispatcherServlet 실행', 'chain.doFilter 후 후처리'],
      use: ['요청마다 traceId를 MDC에 넣어 로그로 요청 흐름을 추적한다.', 'ContentCachingRequestWrapper로 요청 본문을 캐싱해 로그에 남긴다.', '스프링 시큐리티가 DelegatingFilterProxy를 통해 필터 단계에서 인증을 처리한다.'],
      myth: [['Filter는 스프링 빈을 쓸 수 없다.', '스프링 부트에서는 Filter를 @Component나 FilterRegistrationBean으로 빈으로 등록하므로 다른 빈을 주입받아 쓸 수 있다.']],
      fq: [['OncePerRequestFilter를 쓰는 이유는 무엇인가요?', '포워드나 에러 디스패치처럼 한 요청 안에서 서블릿이 다시 호출될 때 일반 Filter는 여러 번 실행될 수 있습니다. OncePerRequestFilter는 요청당 한 번만 실행되도록 보장합니다.'], ['Filter 순서는 어떻게 지정하나요?', 'FilterRegistrationBean의 setOrder()나 @Order로 지정합니다. 숫자가 작을수록 먼저 실행되며, 스프링 시큐리티 필터보다 앞이나 뒤에 둘지 고려해야 합니다.'], ['Filter에서 발생한 예외는 어떻게 처리하나요?', '@ControllerAdvice가 잡지 못하므로 필터 안에서 try-catch로 직접 응답을 쓰거나, 예외 처리 전용 필터를 앞에 두어 공통 에러 응답을 만듭니다.']]
    },
    'Interceptor': {
      ans: 'Interceptor는 스프링 MVC 안에서 컨트롤러 실행 전(preHandle), 후(postHandle), 요청 완료(afterCompletion) 시점에 끼어드는 기능입니다. 실행될 핸들러 정보를 알 수 있어 특정 애너테이션이 붙은 API만 로그인 체크를 하는 식의 처리에 적합합니다. preHandle에서 false를 반환하면 컨트롤러가 실행되지 않습니다.',
      ana: '사무실 층마다 있는 출입 관리자입니다. 정문을 통과한 사람이 어느 방에 들어가려는지 보고 권한을 확인합니다.',
      flow: ['HandlerMapping이 체인 반환', 'preHandle 실행', '컨트롤러 실행', 'postHandle 실행', '뷰 렌더링', 'afterCompletion 실행'],
      use: ['@LoginRequired가 붙은 컨트롤러 메서드만 세션을 확인해 401을 반환한다.', 'afterCompletion에서 요청 처리 시간과 상태 코드를 기록한다.'],
      myth: [['postHandle은 예외가 나도 항상 실행된다.', 'postHandle은 컨트롤러가 정상 반환했을 때만 실행된다. 예외가 나도 실행되는 것은 afterCompletion이다.']],
      fq: [['Interceptor에서 스프링 빈을 주입받을 수 있나요?', 'Interceptor를 빈으로 등록하고 WebMvcConfigurer에서 그 빈을 addInterceptor로 넘기면 됩니다. new로 직접 만들면 주입이 되지 않습니다.'], ['Filter 대신 Interceptor로 인증을 하면 어떤 차이가 있나요?', 'Interceptor는 DispatcherServlet 안이라 정적 리소스나 다른 서블릿 요청은 보호하지 못하지만, 핸들러 정보를 쓸 수 있고 예외를 @ControllerAdvice로 처리할 수 있습니다. 전체 보안 정책은 보통 시큐리티 필터로 처리합니다.']]
    },
    '@RequestParam': {
      why: '쿼리 스트링 값을 직접 꺼내 형변환하는 반복 코드를 없애고, 필수 여부와 기본값을 선언적으로 다루기 위해서다.',
      ans: '@RequestParam은 쿼리 스트링이나 폼 데이터의 값 하나를 메서드 파라미터로 받는 애너테이션입니다. 문자열은 ConversionService가 숫자, 날짜, enum으로 변환하고, 기본이 필수라 값이 없으면 400이 됩니다. required = false나 defaultValue로 선택 값으로 만들 수 있습니다.',
      use: ['목록 API에서 ?status=PAID&page=2 같은 필터·페이지 조건을 받는다.'],
      myth: [['@RequestParam은 JSON 본문의 필드도 읽는다.', '쿼리 스트링과 폼 데이터만 읽는다. JSON 본문은 @RequestBody로 받는다.']],
      fq: [['필수 파라미터가 없으면 어떤 예외가 나나요?', 'MissingServletRequestParameterException이 발생하고 기본적으로 400 응답이 됩니다.']]
    },
    '@PathVariable': {
      why: 'URL 경로에 담긴 자원 식별자를 파싱 코드 없이 타입에 맞게 받아 REST 스타일 API를 만들기 위해서다.',
      ans: '@PathVariable은 URL 경로 안의 변수 값을 받는 애너테이션입니다. /users/{id}처럼 자원을 식별하는 값은 경로에 두는 것이 REST 관례이고, 타입 변환에 실패하면 400이 됩니다.',
      use: ['GET /orders/{orderId}로 특정 주문을 조회한다.'],
      fq: [['식별자는 @PathVariable, 조건은 @RequestParam으로 나누는 이유는?', '경로는 자원 자체를 식별하고 쿼리 스트링은 그 자원 목록을 거르거나 정렬하는 조건이라는 REST 관례 때문입니다. 이렇게 나누면 URL만 보고 의미를 알기 쉽습니다.']]
    },
    '@ModelAttribute': {
      why: '폼이나 쿼리 파라미터가 많을 때 하나씩 받지 않고 객체 하나로 묶어 바인딩하기 위해서다.',
      ans: '@ModelAttribute는 쿼리 스트링이나 폼 데이터의 여러 파라미터를 객체 필드에 한꺼번에 바인딩합니다. 생성자나 setter로 값을 넣으며 JSON 본문은 읽지 않습니다. 단순 타입이 아닌 객체 파라미터는 애너테이션을 생략해도 이 방식으로 처리됩니다.',
      use: ['검색 화면의 여러 조건을 OrderSearch record 하나로 받는다.'],
      myth: [['@ModelAttribute로 JSON 요청을 받을 수 있다.', 'JSON 본문은 읽지 않아 필드가 모두 null이 된다. JSON은 @RequestBody를 써야 한다.']],
      fq: [['타입 변환에 실패하면 어떻게 되나요?', '오류가 BindingResult에 담깁니다. 파라미터 바로 뒤에 BindingResult를 선언하면 직접 처리할 수 있고, 선언하지 않으면 예외가 나서 400 응답이 됩니다.']]
    },
    '@RequestBody': {
      why: 'JSON 같은 요청 본문을 직접 파싱하지 않고 바로 객체로 받기 위해서다.',
      ans: '@RequestBody는 HTTP 요청 본문을 HttpMessageConverter로 읽어 객체로 바꾸는 애너테이션입니다. JSON은 Jackson이 처리하고, 본문은 스트림이라 한 번만 읽을 수 있어 메서드당 하나만 씁니다. @Valid를 함께 붙이면 변환 후 검증까지 합니다.',
      ana: '택배 상자를 뜯어 내용물을 정리해 주는 직원입니다. 상자 라벨(Content-Type)을 보고 뜯는 방법을 정합니다.',
      use: ['주문 생성 API에서 JSON 요청을 CreateOrderRequest DTO로 받는다.'],
      myth: [['@RequestBody 객체에는 반드시 setter가 필요하다.', 'Jackson은 기본 생성자 + 필드 접근이나 생성자·record로도 객체를 만들 수 있다. setter가 꼭 필요하지 않다.']],
      fq: [['JSON 형식이 잘못되면 어떤 응답이 나가나요?', 'HttpMessageNotReadableException이 발생해 기본적으로 400이 됩니다. Content-Type이 지원되지 않으면 415가 나갑니다.']]
    },
    'ArgumentResolver': {
      why: '컨트롤러 파라미터가 어떻게 채워지는지 알고, 로그인 사용자 주입 같은 반복 작업을 커스텀 리졸버로 없애기 위해서다.',
      ans: 'ArgumentResolver(HandlerMethodArgumentResolver)는 컨트롤러 메서드의 각 파라미터 값을 만들어 주는 전략입니다. 파라미터마다 supportsParameter가 true인 리졸버를 찾아 resolveArgument로 값을 만들며, @RequestParam, @RequestBody, Pageable 모두 리졸버가 처리합니다. 직접 구현하면 @LoginUser 같은 커스텀 파라미터를 만들 수 있습니다.',
      ana: '요리사 옆의 재료 준비 담당입니다. 레시피(파라미터 선언)를 보고 필요한 재료를 손질해 올려 둡니다.',
      use: ['@LoginUser User user 파라미터로 세션의 로그인 사용자를 바로 받아 컨트롤러 중복 코드를 없앤다.'],
      fq: [['커스텀 ArgumentResolver는 어떻게 등록하나요?', 'HandlerMethodArgumentResolver를 구현하고 WebMvcConfigurer의 addArgumentResolvers에 추가합니다. 기본 리졸버보다 뒤에 추가되므로 기본 리졸버가 먼저 처리하는 타입과 겹치지 않게 커스텀 애너테이션을 씁니다.']]
    },
    'HttpMessageConverter': {
      why: '요청 본문과 응답 객체의 직렬화를 콘텐츠 타입에 맞게 자동으로 처리해 컨트롤러가 변환 코드를 갖지 않게 하기 위해서다.',
      ans: 'HttpMessageConverter는 HTTP 본문과 자바 객체 사이를 변환하는 전략입니다. 요청은 Content-Type, 응답은 Accept 헤더와 반환 타입을 보고 컨버터를 고르며, JSON은 Jackson 기반 컨버터가 처리합니다. 스프링 부트는 자동 설정된 ObjectMapper를 쓰므로 spring.jackson 설정으로 형식을 바꿉니다.',
      use: ['spring.jackson.serialization.write-dates-as-timestamps=false로 날짜를 ISO 문자열로 내려준다.'],
      myth: [['@RestController에서 String을 반환해도 JSON 문자열로 나간다.', 'String은 StringHttpMessageConverter가 먼저 선택되어 따옴표 없는 텍스트로 나간다.']],
      fq: [['응답 형식은 어떤 기준으로 정해지나요?', '클라이언트의 Accept 헤더와 컨트롤러의 produces, 반환 타입을 비교해 쓸 수 있는 컨버터와 미디어 타입을 고릅니다. 맞는 것이 없으면 406 Not Acceptable이 됩니다.']]
    },
    '@Valid 검증': {
      why: '컨트롤러마다 if 문으로 입력값을 검사하는 중복을 없애고, 잘못된 요청을 비즈니스 로직 전에 걸러내기 위해서다.',
      ans: '@Valid는 DTO 필드에 붙인 @NotBlank, @Positive 같은 Bean Validation 제약을 바인딩 후 검증하게 합니다. @RequestBody 검증이 실패하면 MethodArgumentNotValidException이 나고, 보통 @RestControllerAdvice에서 필드별 오류 메시지로 바꿔 400으로 응답합니다. spring-boot-starter-validation 의존성이 필요합니다.',
      use: ['회원 가입 요청 DTO에 @Email, @Size를 붙여 서비스 계층에 들어가기 전에 잘못된 입력을 걸러낸다.'],
      myth: [['@Valid만 붙이면 중첩 객체 필드까지 검증된다.', '중첩 객체는 그 필드에도 @Valid를 붙여야 내부 제약이 검증된다.']],
      fq: [['@Valid와 @Validated의 차이는 무엇인가요?', '@Valid는 자바 표준이고, @Validated는 스프링 애너테이션으로 검증 그룹을 지원합니다. 클래스에 @Validated를 붙이면 @RequestParam 같은 단일 파라미터 제약도 메서드 검증으로 처리됩니다.']]
    },
    '@Controller': {
      why: '서버에서 HTML을 렌더링해 응답하는 화면 중심 애플리케이션을 만들기 위해서다.',
      ans: '@Controller는 뷰를 반환하는 전통적인 MVC 컨트롤러를 표시합니다. 메서드가 String을 반환하면 뷰 이름으로 해석되어 ViewResolver가 템플릿을 찾고, Model에 담은 데이터가 뷰에서 쓰입니다. 특정 메서드만 JSON으로 응답하려면 @ResponseBody를 붙입니다.',
      use: ['Thymeleaf로 관리자 페이지를 서버에서 렌더링한다.'],
      fq: [['@Controller와 @Component의 차이는 무엇인가요?', '둘 다 빈으로 등록되지만 @Controller가 붙은 클래스만 RequestMappingHandlerMapping이 요청 매핑 대상으로 인식합니다. 역할을 드러내는 의미도 있습니다.']]
    },
    '@RestController': {
      why: '메서드마다 `@ResponseBody`를 붙이지 않고 반환 객체를 JSON 응답으로 바로 내보내는 API 서버를 만들기 위해서다.',
      ans: '@RestController는 @Controller와 @ResponseBody를 합친 애너테이션으로, 모든 메서드의 반환값이 뷰를 거치지 않고 MessageConverter를 통해 응답 본문에 쓰입니다. REST API 컨트롤러에 쓰며, 엔티티 대신 응답 전용 DTO를 반환하는 것이 원칙입니다.',
      use: ['주문 API에서 OrderResponse DTO를 반환해 JSON으로 응답한다.'],
      myth: [['엔티티를 그대로 반환해도 괜찮다.', '지연 로딩 예외, 양방향 연관관계의 순환 참조, 내부 구조 노출, API 스펙이 엔티티 변경에 묶이는 문제가 생긴다. DTO로 변환해 반환한다.']],
      fq: [['@RestController에서 상태 코드를 바꾸려면 어떻게 하나요?', 'ResponseEntity를 반환해 상태 코드와 헤더를 지정하거나, 항상 같은 코드라면 메서드에 @ResponseStatus를 붙입니다.']]
    },
    'ResponseEntity': {
      why: '항상 200만 내려가는 대신 201, 204, 404처럼 상황에 맞는 상태 코드와 헤더를 응답에 담기 위해서다.',
      ans: 'ResponseEntity는 응답 본문과 함께 HTTP 상태 코드와 헤더까지 표현하는 반환 타입입니다. 생성 시 201과 Location 헤더, 삭제 시 204처럼 상황에 맞는 응답을 정확히 만들 수 있습니다.',
      use: ['주문 생성 API에서 ResponseEntity.created(uri).body(dto)로 201과 Location을 함께 내려준다.'],
      fq: [['모든 API에 ResponseEntity를 써야 하나요?', '필수는 아닙니다. 상태 코드가 상황마다 달라지거나 헤더를 넣어야 할 때 쓰고, 항상 200이면 DTO를 바로 반환해도 됩니다. 팀 컨벤션으로 통일하는 경우가 많습니다.']]
    },
    '@ExceptionHandler': {
      why: '컨트롤러마다 try-catch로 예외를 응답으로 바꾸는 중복 코드를 없애기 위해서다.',
      ans: '@ExceptionHandler는 특정 예외가 발생했을 때 실행할 처리 메서드를 지정합니다. 컨트롤러 안에 두면 그 컨트롤러만, @RestControllerAdvice에 두면 전체에 적용되며, 여러 핸들러가 맞으면 가장 구체적인 예외 타입이 선택됩니다. 상태 코드는 @ResponseStatus나 ResponseEntity로 정합니다.',
      use: ['OrderNotFoundException을 404와 에러 코드 응답으로 바꾼다.'],
      myth: [['@ExceptionHandler만 붙이면 상태 코드가 자동으로 4xx/5xx가 된다.', '상태 코드를 지정하지 않으면 200으로 응답한다. @ResponseStatus나 ResponseEntity로 꼭 지정해야 한다.']],
      fq: [['컨트롤러 안의 핸들러와 Advice의 핸들러가 겹치면?', '컨트롤러 안의 @ExceptionHandler가 우선합니다. 특정 컨트롤러만 예외 응답을 다르게 하고 싶을 때 이 규칙을 이용합니다.']]
    },
    '@RestControllerAdvice': {
      why: '예외 처리를 한곳에 모아 모든 API가 같은 형식의 오류 응답을 내려주게 하기 위해서다.',
      ans: '@RestControllerAdvice는 여러 컨트롤러에 공통으로 적용할 예외 처리를 한 클래스에 모으는 애너테이션입니다. 비즈니스 예외의 공통 부모와 에러 코드를 두고 일관된 에러 응답으로 바꾸며, 예상하지 못한 예외는 500과 로그로 처리합니다. Filter에서 난 예외는 잡지 못합니다.',
      ana: '회사의 고객 불만 처리 창구입니다. 어느 부서에서 문제가 생겨도 같은 형식으로 답변합니다.',
      use: ['BusinessException을 상속한 예외들을 ErrorCode 기반 {code, message} 응답으로 통일한다.', '검증 실패를 필드별 오류 목록으로 바꿔 400으로 내려준다.'],
      fq: [['적용 범위를 일부 컨트롤러로 좁힐 수 있나요?', 'basePackages, assignableTypes, annotations 속성으로 특정 패키지나 컨트롤러에만 적용할 수 있습니다. API용과 화면용 Advice를 나눌 때 씁니다.']]
    },
    'HandlerExceptionResolver': {
      why: '예외가 어떤 순서로 처리되어 응답이 되는지 알아야 의도하지 않은 500 응답이나 처리 누락을 진단할 수 있기 때문이다.',
      ans: 'HandlerExceptionResolver는 컨트롤러 처리 중 발생한 예외를 응답으로 바꾸는 DispatcherServlet의 예외 처리 전략입니다. @ExceptionHandler를 실행하는 리졸버, @ResponseStatus를 적용하는 리졸버, 스프링 내부 예외를 4xx로 바꾸는 리졸버가 순서대로 시도됩니다. 아무도 처리하지 못하면 /error로 넘어가 기본 에러 응답이 만들어집니다.',
      flow: ['컨트롤러에서 예외 발생', 'ExceptionHandler 리졸버', 'ResponseStatus 리졸버', 'Default 리졸버', '미처리 시 /error 재요청'],
      use: ['타입 변환 실패가 왜 500이 아니라 400으로 나가는지 DefaultHandlerExceptionResolver로 설명할 수 있다.'],
      fq: [['처리되지 않은 예외는 최종적으로 어떻게 되나요?', '서블릿 컨테이너까지 올라가고, 스프링 부트는 /error 경로로 다시 요청해 BasicErrorController가 기본 JSON 또는 HTML 에러 응답을 만듭니다.']]
    },
    'ProblemDetail': {
      why: '팀마다 제각각인 오류 응답 형식 대신 표준 형식을 써서 클라이언트가 일관되게 오류를 해석하게 하기 위해서다.',
      ans: 'ProblemDetail은 HTTP API 오류 응답 표준(RFC 9457)을 표현하는 스프링 6의 클래스입니다. type, title, status, detail, instance 필드와 확장 속성을 가지며 application/problem+json으로 응답해, 팀마다 다른 에러 형식 대신 표준을 따를 수 있습니다.',
      use: ['@ExceptionHandler에서 ProblemDetail을 반환하고 setProperty로 서비스 고유 에러 코드를 추가한다.'],
      fq: [['스프링 기본 예외도 ProblemDetail로 응답하게 하려면?', 'spring.mvc.problemdetails.enabled=true를 설정하거나 ResponseEntityExceptionHandler를 상속한 Advice를 등록하면 스프링 MVC 기본 예외가 ProblemDetail 형식으로 응답됩니다.']]
    }
  }
};
