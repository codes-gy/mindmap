import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-3",
  name: "Spring MVC",
  must: [
    "컨트롤러도 싱글톤이라 여러 요청 스레드가 동시에 같은 인스턴스를 실행한다.",
    "`@RequestBody`는 JSON 본문을 Jackson으로 변환하고, `@ModelAttribute`는 쿼리·폼 파라미터를 바인딩한다.",
    "`@Valid`로 검증하고, 실패하면 `MethodArgumentNotValidException`이 발생한다.",
    "Filter에서 던진 예외는 DispatcherServlet 밖이라 `@ControllerAdvice`로 잡히지 않는다."
  ],
  groups: [
    {
      name: "프론트 컨트롤러",
      compare: {
        cols: ["기준", "DispatcherServlet", "요청 처리 흐름"],
        rows: [
          ["무엇인가", "프론트 컨트롤러 서블릿", "요청부터 응답까지의 단계"],
          ["하는 일", "요청 수신, 처리 위임", "각 컴포넌트 호출 순서"],
          ["핵심 구성", "HandlerMapping·Adapter 등", "매핑→인터셉터→컨트롤러→변환"],
          ["REST 응답", "MessageConverter에 위임", "뷰 렌더링 단계 생략"]
        ]
      },
      concepts: [
        {
          id: "spring/dispatcherservlet",
          slug: "dispatcherservlet",
          title: "DispatcherServlet",
          deep: true,
          def: "모든 HTTP 요청을 가장 먼저 받아 알맞은 컨트롤러에 넘기는 스프링 MVC의 프론트 컨트롤러다.",
          why: "서블릿을 URL마다 따로 만들면 인코딩, 예외 처리, 뷰 렌더링 같은 공통 코드가 서블릿마다 반복된다. 요청 입구를 하나로 모아 공통 처리는 한 곳에서 하고, 컨트롤러는 비즈니스 처리에만 집중하게 하려는 것이다.",
          how: [
            "`HttpServlet`을 상속한 서블릿이며 상속 구조는 HttpServlet → HttpServletBean → FrameworkServlet → DispatcherServlet이다. 요청이 오면 `service()` → `processRequest()` → `doService()` → `doDispatch()` 순서로 들어가고, 핵심 로직은 `doDispatch()`에 있다.",
            "- 등록: 스프링 부트는 DispatcherServletAutoConfiguration으로 `/` 경로에 자동 등록한다. 모든 요청이 이 서블릿 하나로 들어온다.",
            "- 초기화: 처음 기동될 때 HandlerMapping, HandlerAdapter, ViewResolver, HandlerExceptionResolver 같은 전략 객체들을 스프링 컨테이너에서 찾아 목록으로 들고 있다.",
            "- 위임: 직접 요청을 처리하지 않고, 이 전략 객체들에게 \"누가 처리할지 찾기\", \"실행하기\", \"뷰 찾기\", \"예외 바꾸기\"를 차례로 맡긴다.",
            "- 확장성: 전략이 모두 인터페이스라 새 HandlerMapping이나 ArgumentResolver를 빈으로 등록하기만 하면 DispatcherServlet 코드를 고치지 않고 기능을 늘릴 수 있다."
          ],
          flow: ["service() 진입", "doDispatch() 호출", "HandlerMapping 조회", "HandlerAdapter 선택", "컨트롤러 실행", "응답 생성·예외 처리"],
          code: "// doDispatch의 핵심 흐름을 단순화한 코드\nprotected void doDispatch(HttpServletRequest req, HttpServletResponse res) {\n    HandlerExecutionChain chain = getHandler(req);       // HandlerMapping\n    HandlerAdapter ha = getHandlerAdapter(chain.getHandler());\n    if (!chain.applyPreHandle(req, res)) return;          // Interceptor\n    ModelAndView mv = ha.handle(req, res, chain.getHandler());\n    chain.applyPostHandle(req, res, mv);\n    processDispatchResult(req, res, chain, mv, exception); // 뷰 렌더링·예외 처리\n}",
          codeLang: "java",
          use: [
            "커스텀 ArgumentResolver나 Interceptor를 빈으로 등록하면 DispatcherServlet 수정 없이 기능이 추가된다.",
            "디버깅 시 doDispatch()에 중단점을 걸어 요청이 어떤 핸들러로 가는지 확인한다."
          ],
          warn: [
            "스프링 MVC 바깥(Filter)에서 난 예외는 DispatcherServlet의 예외 처리 전략을 거치지 않는다.",
            "DispatcherServlet도 서블릿이라 싱글톤 하나가 모든 요청 스레드에서 동시에 실행된다."
          ],
          myth: [["컨트롤러마다 DispatcherServlet이 하나씩 있다.", "스프링 부트에서는 / 경로에 DispatcherServlet 하나만 등록되어 모든 요청을 받는다."]],
          answer: "DispatcherServlet은 모든 HTTP 요청을 가장 먼저 받는 스프링 MVC의 프론트 컨트롤러입니다. 요청을 직접 처리하지 않고 HandlerMapping으로 처리할 컨트롤러를 찾고, HandlerAdapter로 실행한 뒤, MessageConverter나 ViewResolver로 응답을 만듭니다. 공통 처리를 한곳에 모으고 각 단계를 교체 가능한 전략으로 위임하는 구조입니다.",
          analogy: "호텔 프런트 데스크입니다. 모든 손님이 먼저 들르고, 프런트는 요청을 알맞은 부서(컨트롤러)로 연결해 줍니다.",
          qa: [
            "DispatcherServlet은 어떤 역할을 하나요?",
            "모든 요청을 받는 프론트 컨트롤러로, 요청을 직접 처리하지 않고 HandlerMapping으로 컨트롤러를 찾고 HandlerAdapter로 실행한 뒤 ViewResolver나 MessageConverter로 응답을 만듭니다. 공통 처리를 한곳에 모으고, 각 단계를 인터페이스 전략으로 위임해서 확장하기 쉬운 구조입니다."
          ],
          followUps: [
            [
              "프론트 컨트롤러 패턴의 장점은 무엇인가요?",
              "인코딩, 예외 처리, 뷰 렌더링 같은 공통 처리를 한곳에서 하므로 중복이 사라지고, 개별 컨트롤러는 서블릿 API에 의존하지 않고 비즈니스 처리에만 집중할 수 있습니다."
            ],
            [
              "DispatcherServlet은 스레드 안전한가요?",
              "서블릿은 싱글톤 하나가 모든 요청 스레드에서 동시에 실행됩니다. DispatcherServlet은 요청별 상태를 필드에 두지 않고 지역 변수와 요청 객체로 처리하므로 안전합니다."
            ]
          ],
          related: ["spring/yocheong-cheori-heureum", "spring/handlermapping", "spring/handleradapter", "spring/filter"]
        },
        {
          id: "spring/yocheong-cheori-heureum",
          slug: "yocheong-cheori-heureum",
          title: "요청 처리 흐름",
          deep: true,
          def: "HTTP 요청이 들어와 응답이 나갈 때까지 스프링 MVC 안에서 거치는 단계들이다.",
          why: "면접 단골 질문이며, 필터·인터셉터·예외 처리가 어디서 동작하는지 알아야 문제가 생겼을 때 원인을 찾을 수 있다.",
          how: [
            "1) 요청이 톰캣의 Filter 체인을 지나 DispatcherServlet에 도착한다.",
            "2) HandlerMapping이 URL과 HTTP 메서드로 처리할 핸들러(컨트롤러 메서드)와 적용할 Interceptor를 묶은 HandlerExecutionChain을 찾는다.",
            "3) 그 핸들러를 실행할 수 있는 HandlerAdapter를 찾는다. `@RequestMapping` 메서드는 RequestMappingHandlerAdapter가 담당한다.",
            "4) Interceptor의 `preHandle`이 실행된다. false를 반환하면 여기서 멈춘다.",
            "5) HandlerAdapter가 ArgumentResolver로 파라미터를 만들고 컨트롤러 메서드를 호출한다.",
            "6) ReturnValueHandler가 반환값을 처리한다. `@ResponseBody`면 HttpMessageConverter가 JSON으로 바꿔 응답 본문에 바로 쓰고, 뷰 이름이면 ModelAndView를 만든다.",
            "7) Interceptor의 `postHandle`이 실행된다.",
            "8) 뷰가 있으면 ViewResolver가 뷰 객체를 찾아 렌더링한다. 중간에 예외가 났다면 HandlerExceptionResolver가 응답으로 바꾼다.",
            "9) `afterCompletion`이 실행되고 응답이 Filter 체인을 거꾸로 지나 클라이언트로 나간다."
          ],
          flow: [
            "Filter 체인 통과",
            "HandlerMapping 조회",
            "Interceptor preHandle",
            "파라미터 바인딩·실행",
            "반환값 변환(JSON/뷰)",
            "postHandle, 완료 처리"
          ],
          code: "요청\n → Filter 체인 (인코딩, 시큐리티, CORS)\n → DispatcherServlet\n   → HandlerMapping      : GET /orders/1 → OrderController#get\n   → HandlerAdapter      : 파라미터 바인딩 후 호출\n   → Interceptor.preHandle\n   → Controller          : OrderResponse 반환\n   → HttpMessageConverter: 객체 → JSON\n   → Interceptor.postHandle / afterCompletion\n → 응답",
          codeLang: "java",
          use: [
            "요청이 컨트롤러에 도달하지 않을 때 Filter와 Interceptor 중 어디서 막혔는지 흐름 순서로 원인을 좁힌다.",
            "API 응답 공통 포맷은 postHandle이 아니라 ResponseBodyAdvice로 처리한다."
          ],
          warn: [
            "`@ResponseBody` 응답은 컨트롤러가 반환하는 시점에 이미 응답 본문이 쓰이므로 `postHandle`에서 응답을 바꿀 수 없다. 응답 공통 처리는 `ResponseBodyAdvice`를 쓴다.",
            "`afterCompletion`은 예외가 나도 실행되지만, `preHandle`이 true를 반환한 Interceptor에 대해서만 실행된다."
          ],
          myth: [
            [
              "postHandle에서 @ResponseBody 응답 본문을 바꿀 수 있다.",
              "본문은 컨트롤러 반환 직후 MessageConverter가 이미 써 버린다. 본문을 바꾸려면 ResponseBodyAdvice를 써야 한다."
            ]
          ],
          answer: "요청은 Filter 체인을 지나 DispatcherServlet에 도착하고, HandlerMapping이 처리할 컨트롤러와 Interceptor를 찾습니다. HandlerAdapter가 ArgumentResolver로 파라미터를 준비해 컨트롤러를 실행하며, 그 전후로 Interceptor가 동작합니다. 반환값은 @ResponseBody면 MessageConverter가 JSON으로 바꾸고, 아니면 ViewResolver가 뷰를 찾아 렌더링합니다.",
          analogy: "공항 출국 절차와 같습니다. 보안 검색(Filter), 탑승구 안내(HandlerMapping), 탑승 수속(Interceptor), 탑승(컨트롤러) 순서로 지나갑니다.",
          qa: [
            "Spring MVC의 요청 처리 흐름을 설명해 주세요.",
            "요청은 Filter를 지나 DispatcherServlet에 도착하고, HandlerMapping이 처리할 컨트롤러를 찾습니다. HandlerAdapter가 ArgumentResolver로 파라미터를 준비해 컨트롤러를 실행하고, 반환값은 @ResponseBody라면 MessageConverter가 JSON으로, 아니면 ViewResolver가 뷰를 찾아 렌더링합니다. 그 사이 Interceptor의 preHandle, postHandle, afterCompletion이 실행되고 예외는 HandlerExceptionResolver가 처리합니다."
          ],
          followUps: [
            [
              "예외가 나면 흐름이 어떻게 바뀌나요?",
              "컨트롤러나 Interceptor에서 예외가 나면 postHandle은 건너뛰고 HandlerExceptionResolver가 예외를 응답으로 바꿉니다. afterCompletion은 예외 정보와 함께 호출됩니다."
            ],
            [
              "Interceptor가 여러 개면 순서는 어떻게 되나요?",
              "preHandle은 등록 순서대로, postHandle과 afterCompletion은 역순으로 실행됩니다. preHandle이 false를 반환하면 이후 Interceptor와 컨트롤러는 실행되지 않습니다."
            ]
          ],
          related: [
            "spring/dispatcherservlet",
            "spring/handlermapping",
            "spring/interceptor",
            "spring/httpmessageconverter"
          ]
        }
      ]
    },
    {
      name: "핵심 컴포넌트",
      compare: {
        cols: ["기준", "HandlerMapping", "HandlerAdapter", "ViewResolver"],
        rows: [
          ["하는 일", "요청에 맞는 핸들러 찾기", "찾은 핸들러 실제 호출", "뷰 이름을 뷰 객체로 변환"],
          ["호출 순서", "첫 번째", "두 번째", "세 번째 (뷰 반환 시)"],
          ["입력 → 출력", "요청 → 핸들러+인터셉터", "핸들러 → ModelAndView", "뷰 이름 → View"],
          [
            "대표 구현",
            "`RequestMappingHandlerMapping`",
            "`RequestMappingHandlerAdapter`",
            "`ThymeleafViewResolver`"
          ]
        ]
      },
      concepts: [
        {
          id: "spring/handlermapping",
          slug: "handlermapping",
          title: "HandlerMapping",
          deep: false,
          def: "요청 URL과 HTTP 메서드를 보고 어떤 핸들러(컨트롤러 메서드)가 처리할지 찾아 주는 전략이다.",
          why: "들어온 요청을 어떤 컨트롤러 메서드가 처리할지 정하는 과정을 알아야 404나 매핑 충돌을 해결할 수 있기 때문이다.",
          how: [
            "애플리케이션이 시작될 때 `@RequestMapping` 계열 애너테이션을 모두 읽어 \"조건 → 메서드\" 표를 만들어 둔다. 요청이 오면 경로, 메서드, 헤더, `consumes`/`produces` 조건을 비교해 가장 구체적인 핸들러를 고른다.",
            "- RequestMappingHandlerMapping: `@Controller`의 `@RequestMapping` 메서드를 찾는다. 가장 많이 쓴다.",
            "- BeanNameUrlHandlerMapping: 빈 이름을 URL로 쓰는 옛 방식.",
            "- 찾은 핸들러와 그 경로에 적용될 Interceptor를 HandlerExecutionChain으로 묶어 돌려준다.",
            "- 맞는 핸들러가 없으면 정적 리소스 핸들러로 넘어가고, 그것도 없으면 404가 된다."
          ],
          use: ["같은 URL을 HTTP 메서드나 produces 조건으로 나눠 서로 다른 메서드에 매핑한다."],
          answer: "HandlerMapping은 요청 URL과 HTTP 메서드를 보고 처리할 핸들러, 즉 컨트롤러 메서드를 찾아 주는 전략입니다. 애플리케이션 시작 시 @RequestMapping 정보를 모두 읽어 매핑 표를 만들어 두고, 요청이 오면 가장 구체적인 핸들러와 적용할 Interceptor를 묶어 돌려줍니다.",
          analogy: "건물 안내판입니다. 방문 목적(URL)을 보고 몇 층 몇 호(메서드)로 가야 하는지 알려 줍니다.",
          followUps: [
            [
              "매칭되는 핸들러가 둘 이상이면 어떻게 되나요?",
              "경로 패턴이 더 구체적인 쪽(와일드카드가 적은 쪽)이 선택됩니다. 우선순위가 같은 매핑이 겹치면 시작 시점에 모호한 매핑 오류로 기동이 실패합니다."
            ]
          ],
          related: ["spring/handleradapter", "spring/dispatcherservlet", "spring/yocheong-cheori-heureum"]
        },
        {
          id: "spring/handleradapter",
          slug: "handleradapter",
          title: "HandlerAdapter",
          deep: false,
          def: "찾은 핸들러를 실제로 호출하는 어댑터로, 핸들러 종류가 달라도 DispatcherServlet이 같은 방식으로 실행하게 해 준다.",
          why: "형태가 다른 여러 핸들러를 DispatcherServlet이 하나의 방식으로 실행해, 새 핸들러 종류가 생겨도 디스패처를 고치지 않기 위해서다.",
          how: [
            "핸들러는 `@RequestMapping` 메서드, `HttpRequestHandler`, 옛 `Controller` 인터페이스 등 형태가 제각각이다. 어댑터 패턴으로 각 형태를 `handle()`이라는 하나의 인터페이스로 맞춘다.",
            "- RequestMappingHandlerAdapter: `@RequestMapping` 메서드를 실행한다. 파라미터는 ArgumentResolver로 만들고, 반환값은 ReturnValueHandler로 처리한다.",
            "- 그래서 컨트롤러 메서드가 `@RequestBody`, `HttpServletRequest`, `Pageable` 등 원하는 파라미터를 자유롭게 선언할 수 있다.",
            "- 새 핸들러 형태를 지원하려면 어댑터만 추가하면 되고 DispatcherServlet은 바뀌지 않는다(OCP)."
          ],
          use: [
            "컨트롤러 메서드에 Pageable, @AuthenticationPrincipal 같은 다양한 파라미터를 선언할 수 있는 것은 RequestMappingHandlerAdapter 덕분이다."
          ],
          answer: "HandlerAdapter는 찾아낸 핸들러를 실제로 호출하는 어댑터입니다. 핸들러 형태가 제각각이어도 DispatcherServlet은 handle()이라는 하나의 방식으로 실행할 수 있습니다. @RequestMapping 메서드는 RequestMappingHandlerAdapter가 파라미터 바인딩과 반환값 처리까지 맡습니다.",
          analogy: "여행용 멀티 어댑터입니다. 나라마다 콘센트(핸들러) 모양이 달라도 같은 충전기(DispatcherServlet)를 꽂을 수 있게 해 줍니다.",
          followUps: [
            [
              "HandlerMapping과 HandlerAdapter를 왜 나눴나요?",
              "찾는 일과 실행하는 일을 분리해 새로운 핸들러 형태를 지원할 때 어댑터만 추가하면 되도록 하기 위해서입니다. DispatcherServlet 코드를 고치지 않아도 되므로 OCP를 지키는 설계입니다."
            ]
          ],
          related: ["spring/handlermapping", "spring/argumentresolver"]
        },
        {
          id: "spring/viewresolver",
          slug: "viewresolver",
          title: "ViewResolver",
          deep: false,
          def: "컨트롤러가 반환한 뷰 이름을 실제 뷰 객체(템플릿)로 바꿔 주는 전략이다.",
          why: "컨트롤러가 템플릿 기술과 파일 위치를 몰라도 뷰 이름만으로 화면을 렌더링하게 하기 위해서다.",
          how: [
            "`@Controller`가 `\"order/detail\"`을 반환하면 ViewResolver가 이를 `templates/order/detail.html` 같은 실제 템플릿으로 찾아 View 객체를 만들고, View가 모델 데이터를 넣어 HTML을 렌더링한다.",
            "- 스프링 부트는 Thymeleaf 의존성이 있으면 ThymeleafViewResolver를 자동 등록하고, 접두사 `classpath:/templates/`, 접미사 `.html`을 기본으로 쓴다.",
            "- `redirect:/orders`처럼 접두사를 붙이면 리다이렉트 뷰가 만들어진다.",
            "- `@ResponseBody`나 `@RestController` 응답은 ViewResolver를 거치지 않는다."
          ],
          use: [
            "\"order/detail\"을 반환하면 templates/order/detail.html이 렌더링된다.",
            "\"redirect:/orders\"를 반환해 POST 처리 후 목록으로 리다이렉트한다(PRG 패턴)."
          ],
          answer: "ViewResolver는 컨트롤러가 반환한 뷰 이름을 실제 템플릿 뷰 객체로 바꿔 주는 전략입니다. 스프링 부트에서 Thymeleaf를 쓰면 templates 폴더와 .html 접미사를 기본으로 해석합니다. @ResponseBody 응답은 ViewResolver를 거치지 않습니다.",
          followUps: [
            [
              "REST API 서버에서도 ViewResolver가 쓰이나요?",
              "@RestController 응답은 MessageConverter가 본문에 바로 쓰므로 ViewResolver를 거치지 않습니다. 기본 에러 페이지처럼 뷰를 렌더링하는 경우에만 쓰입니다."
            ]
          ],
          related: ["spring/controller", "spring/restcontroller", "spring/yocheong-cheori-heureum"]
        }
      ]
    },
    {
      name: "요청 가로채기",
      compare: {
        cols: ["기준", "Filter", "Interceptor"],
        rows: [
          ["소속", "서블릿 스펙(톰캣)", "스프링 MVC"],
          ["실행 위치", "DispatcherServlet 앞", "DispatcherServlet 안"],
          ["핸들러 정보 접근", "불가", "가능(HandlerMethod)"],
          ["요청·응답 객체 교체", "가능(래퍼)", "불가"],
          ["@ControllerAdvice 처리", "안 됨", "됨"]
        ]
      },
      concepts: [
        {
          id: "spring/filter",
          slug: "filter",
          title: "Filter",
          deep: true,
          def: "서블릿 컨테이너가 DispatcherServlet보다 앞에서 실행하는 서블릿 표준 기능으로, 요청과 응답 자체를 감싸거나 바꿀 수 있다.",
          why: "스프링 MVC에 들어오기 전에 모든 요청에 공통으로 해야 할 일(인코딩, 보안, 로깅, 요청 본문 캐싱)이 있다. 스프링과 무관하게 서블릿 단계에서 처리해야 하는 일을 맡는다.",
          how: [
            "`jakarta.servlet.Filter` 인터페이스의 `doFilter(request, response, chain)`을 구현한다. `chain.doFilter()`를 호출해야 다음 필터나 서블릿으로 넘어가며, 호출하지 않으면 요청이 거기서 끝난다.",
            "1) 톰캣이 요청을 받아 등록된 필터들을 순서대로 실행한다.",
            "2) 각 필터는 `chain.doFilter()` 전에 요청 전처리를, 후에 응답 후처리를 한다.",
            "3) 마지막 필터 다음에 DispatcherServlet이 실행된다.",
            "- 요청·응답 객체를 래퍼로 바꿔 다음 단계에 넘길 수 있다(예: `ContentCachingRequestWrapper`로 본문을 여러 번 읽기).",
            "- 스프링에서는 `OncePerRequestFilter`를 상속하면 포워드·에러 디스패치에서도 요청당 한 번만 실행된다.",
            "- 등록은 `@Component`(모든 URL) 또는 `FilterRegistrationBean`(URL 패턴, 순서 지정)으로 한다.",
            "- 대표 사례: CharacterEncodingFilter, 스프링 시큐리티(DelegatingFilterProxy), CorsFilter, 요청 로깅"
          ],
          flow: [
            "톰캣이 요청 수신",
            "등록 순서대로 Filter 실행",
            "chain.doFilter 전 전처리",
            "DispatcherServlet 실행",
            "chain.doFilter 후 후처리"
          ],
          code: "@Component\npublic class TraceIdFilter extends OncePerRequestFilter {\n    @Override\n    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,\n                                    FilterChain chain) throws ServletException, IOException {\n        MDC.put(\"traceId\", UUID.randomUUID().toString());\n        try {\n            chain.doFilter(req, res);   // 다음 필터 → DispatcherServlet\n        } finally {\n            MDC.clear();\n        }\n    }\n}",
          codeLang: "java",
          use: [
            "요청마다 traceId를 MDC에 넣어 로그로 요청 흐름을 추적한다.",
            "ContentCachingRequestWrapper로 요청 본문을 캐싱해 로그에 남긴다.",
            "스프링 시큐리티가 DelegatingFilterProxy를 통해 필터 단계에서 인증을 처리한다."
          ],
          warn: [
            "Filter에서 던진 예외는 DispatcherServlet 밖이라 `@ControllerAdvice`로 잡히지 않는다. 필터 안에서 직접 응답을 쓰거나 별도 처리가 필요하다.",
            "`chain.doFilter()` 호출을 빠뜨리면 요청이 컨트롤러까지 가지 않는다.",
            "어떤 컨트롤러로 갈지 모르므로 핸들러 정보(애너테이션 등)가 필요한 처리는 Interceptor가 맞다."
          ],
          myth: [
            [
              "Filter는 스프링 빈을 쓸 수 없다.",
              "스프링 부트에서는 Filter를 @Component나 FilterRegistrationBean으로 빈으로 등록하므로 다른 빈을 주입받아 쓸 수 있다."
            ]
          ],
          answer: "Filter는 서블릿 스펙의 기능으로, 톰캣이 DispatcherServlet보다 앞에서 실행합니다. 요청과 응답 객체 자체를 래핑하거나 바꿀 수 있어 인코딩, 보안, CORS, 요청 로깅처럼 모든 요청에 공통으로 필요한 처리에 씁니다. 스프링 MVC 밖이라 Filter에서 난 예외는 @ControllerAdvice로 처리되지 않습니다.",
          analogy: "건물 정문 보안 검색대입니다. 누가 어느 사무실로 가는지는 모르지만 들어오는 모든 사람을 먼저 검사합니다.",
          qa: [
            "Filter와 Interceptor의 차이는 무엇인가요?",
            "Filter는 서블릿 스펙이라 톰캣이 DispatcherServlet 앞에서 실행하고, 요청과 응답 객체 자체를 바꿀 수 있어 인코딩이나 보안, 로깅에 씁니다. Interceptor는 스프링 MVC 기능이라 DispatcherServlet 안에서 컨트롤러 전후에 실행되고 어떤 핸들러가 실행되는지 알 수 있어 인증 체크나 권한 처리에 씁니다. Filter 예외는 ControllerAdvice로 처리되지 않는다는 차이도 있습니다."
          ],
          followUps: [
            [
              "OncePerRequestFilter를 쓰는 이유는 무엇인가요?",
              "포워드나 에러 디스패치처럼 한 요청 안에서 서블릿이 다시 호출될 때 일반 Filter는 여러 번 실행될 수 있습니다. OncePerRequestFilter는 요청당 한 번만 실행되도록 보장합니다."
            ],
            [
              "Filter 순서는 어떻게 지정하나요?",
              "FilterRegistrationBean의 setOrder()나 @Order로 지정합니다. 숫자가 작을수록 먼저 실행되며, 스프링 시큐리티 필터보다 앞이나 뒤에 둘지 고려해야 합니다."
            ],
            [
              "Filter에서 발생한 예외는 어떻게 처리하나요?",
              "@ControllerAdvice가 잡지 못하므로 필터 안에서 try-catch로 직접 응답을 쓰거나, 예외 처리 전용 필터를 앞에 두어 공통 에러 응답을 만듭니다."
            ]
          ],
          related: ["spring/interceptor", "spring/dispatcherservlet", "spring/delegatingfilterproxy"]
        },
        {
          id: "spring/interceptor",
          slug: "interceptor",
          title: "Interceptor",
          deep: true,
          def: "스프링 MVC 안에서 컨트롤러 실행 전후와 요청 완료 시점에 끼어드는 스프링의 기능이다.",
          why: "로그인 확인이나 권한 체크처럼 \"어떤 컨트롤러가 실행되는지\" 알아야 하는 공통 처리를 컨트롤러마다 반복하지 않고 한곳에서 하려는 것이다.",
          how: [
            "`HandlerInterceptor` 인터페이스의 세 메서드를 필요한 것만 구현하고, `WebMvcConfigurer.addInterceptors()`로 경로 패턴과 함께 등록한다.",
            "1) `preHandle(request, response, handler)`: 컨트롤러 호출 전. false를 반환하면 컨트롤러를 실행하지 않고 끝낸다. 로그인 체크에 쓴다.",
            "2) `postHandle(request, response, handler, modelAndView)`: 컨트롤러가 정상 반환한 뒤, 뷰 렌더링 전. 예외가 나면 호출되지 않는다.",
            "3) `afterCompletion(request, response, handler, ex)`: 뷰 렌더링까지 끝난 뒤 항상 호출된다. 예외 정보를 받을 수 있어 정리 작업과 로그에 쓴다.",
            "- `handler` 파라미터가 보통 `HandlerMethod`라서, 실행될 메서드의 애너테이션(`@LoginRequired` 등)을 읽어 조건부로 처리할 수 있다.",
            "- 스프링 빈이므로 다른 빈을 주입받아 쓸 수 있다.",
            "- 여러 Interceptor는 등록 순서대로 `preHandle`이 실행되고, `postHandle`과 `afterCompletion`은 역순으로 실행된다."
          ],
          flow: ["HandlerMapping이 체인 반환", "preHandle 실행", "컨트롤러 실행", "postHandle 실행", "뷰 렌더링", "afterCompletion 실행"],
          code: "public class LoginCheckInterceptor implements HandlerInterceptor {\n    @Override\n    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {\n        if (handler instanceof HandlerMethod hm && hm.hasMethodAnnotation(LoginRequired.class)\n                && req.getSession(false) == null) {\n            res.setStatus(401);\n            return false;               // 컨트롤러 실행 안 함\n        }\n        return true;\n    }\n}\n\n@Configuration\nclass WebConfig implements WebMvcConfigurer {\n    public void addInterceptors(InterceptorRegistry r) {\n        r.addInterceptor(new LoginCheckInterceptor()).addPathPatterns(\"/api/**\");\n    }\n}",
          codeLang: "java",
          use: ["@LoginRequired가 붙은 컨트롤러 메서드만 세션을 확인해 401을 반환한다.", "afterCompletion에서 요청 처리 시간과 상태 코드를 기록한다."],
          warn: [
            "`@ResponseBody` 응답은 컨트롤러 반환 시점에 이미 본문이 쓰여 `postHandle`에서 바꿀 수 없다.",
            "요청·응답 객체 자체를 다른 객체로 바꿔 넘길 수는 없다. 그런 처리는 Filter에서 한다.",
            "Interceptor에서 난 예외는 DispatcherServlet 안이므로 `@ControllerAdvice`로 처리된다."
          ],
          myth: [
            [
              "postHandle은 예외가 나도 항상 실행된다.",
              "postHandle은 컨트롤러가 정상 반환했을 때만 실행된다. 예외가 나도 실행되는 것은 afterCompletion이다."
            ]
          ],
          answer: "Interceptor는 스프링 MVC 안에서 컨트롤러 실행 전(preHandle), 후(postHandle), 요청 완료(afterCompletion) 시점에 끼어드는 기능입니다. 실행될 핸들러 정보를 알 수 있어 특정 애너테이션이 붙은 API만 로그인 체크를 하는 식의 처리에 적합합니다. preHandle에서 false를 반환하면 컨트롤러가 실행되지 않습니다.",
          analogy: "사무실 층마다 있는 출입 관리자입니다. 정문을 통과한 사람이 어느 방에 들어가려는지 보고 권한을 확인합니다.",
          qa: [
            "로그인 체크는 Filter와 Interceptor 중 어디서 하나요?",
            "스프링 시큐리티처럼 전체 요청을 보안 정책으로 다룰 때는 Filter에서 처리합니다. 반면 특정 애너테이션이 붙은 컨트롤러만 확인하는 등 핸들러 정보가 필요하거나 스프링 빈을 활용하는 간단한 인증 체크라면 Interceptor의 preHandle에서 false를 반환해 막는 방식이 편합니다."
          ],
          followUps: [
            [
              "Interceptor에서 스프링 빈을 주입받을 수 있나요?",
              "Interceptor를 빈으로 등록하고 WebMvcConfigurer에서 그 빈을 addInterceptor로 넘기면 됩니다. new로 직접 만들면 주입이 되지 않습니다."
            ],
            [
              "Filter 대신 Interceptor로 인증을 하면 어떤 차이가 있나요?",
              "Interceptor는 DispatcherServlet 안이라 정적 리소스나 다른 서블릿 요청은 보호하지 못하지만, 핸들러 정보를 쓸 수 있고 예외를 @ControllerAdvice로 처리할 수 있습니다. 전체 보안 정책은 보통 시큐리티 필터로 처리합니다."
            ]
          ],
          related: ["spring/filter", "spring/yocheong-cheori-heureum", "spring/handlermapping"]
        }
      ]
    },
    {
      name: "파라미터 바인딩",
      compare: {
        cols: ["기준", "@RequestParam", "@PathVariable", "@ModelAttribute", "@RequestBody"],
        rows: [
          ["값의 위치", "쿼리·폼 값 하나", "URL 경로", "쿼리·폼 여러 값", "HTTP 본문"],
          ["변환 주체", "ConversionService", "ConversionService", "WebDataBinder", "HttpMessageConverter"],
          ["대상 타입", "단순 타입", "단순 타입", "객체", "객체(JSON)"],
          ["실패 시 예외", "MissingServletRequest…", "TypeMismatch", "BindException", "NotReadable(400)"]
        ]
      },
      concepts: [
        {
          id: "spring/requestparam",
          slug: "requestparam",
          title: "@RequestParam",
          deep: false,
          def: "쿼리 스트링이나 폼 데이터의 값 하나를 메서드 파라미터로 받는 애너테이션이다.",
          why: "쿼리 스트링 값을 직접 꺼내 형변환하는 반복 코드를 없애고, 필수 여부와 기본값을 선언적으로 다루기 위해서다.",
          how: [
            "`GET /orders?status=PAID&page=2`에서 `@RequestParam String status`처럼 받는다. 문자열은 ConversionService가 `int`, `LocalDate`, enum 등으로 변환한다.",
            "- `required`(기본 true): 값이 없으면 400 오류. `required = false`나 `defaultValue`로 바꾼다.",
            "- 파라미터 이름이 같으면 이름을 생략할 수 있다. 단, 컴파일 시 `-parameters` 옵션이 필요하다(스프링 부트 Gradle 설정은 기본 포함).",
            "- 단순 타입은 애너테이션을 생략해도 `@RequestParam`으로 처리되지만, 의도를 드러내려면 붙이는 편이 좋다.",
            "- `List<String>`으로 같은 이름의 여러 값을, `Map<String, String>`으로 전체 파라미터를 받을 수 있다."
          ],
          code: "@GetMapping(\"/orders\")\npublic List<OrderDto> list(@RequestParam(defaultValue = \"PAID\") OrderStatus status,\n                           @RequestParam(required = false) LocalDate from) { ... }",
          codeLang: "java",
          use: ["목록 API에서 ?status=PAID&page=2 같은 필터·페이지 조건을 받는다."],
          myth: [["@RequestParam은 JSON 본문의 필드도 읽는다.", "쿼리 스트링과 폼 데이터만 읽는다. JSON 본문은 @RequestBody로 받는다."]],
          answer: "@RequestParam은 쿼리 스트링이나 폼 데이터의 값 하나를 메서드 파라미터로 받는 애너테이션입니다. 문자열은 ConversionService가 숫자, 날짜, enum으로 변환하고, 기본이 필수라 값이 없으면 400이 됩니다. required = false나 defaultValue로 선택 값으로 만들 수 있습니다.",
          followUps: [["필수 파라미터가 없으면 어떤 예외가 나나요?", "MissingServletRequestParameterException이 발생하고 기본적으로 400 응답이 됩니다."]],
          related: ["spring/pathvariable", "spring/modelattribute"]
        },
        {
          id: "spring/pathvariable",
          slug: "pathvariable",
          title: "@PathVariable",
          deep: false,
          def: "URL 경로 안의 변수 값을 메서드 파라미터로 받는 애너테이션이다.",
          why: "URL 경로에 담긴 자원 식별자를 파싱 코드 없이 타입에 맞게 받아 REST 스타일 API를 만들기 위해서다.",
          how: [
            "`@GetMapping(\"/users/{userId}/orders/{orderId}\")`에서 `{userId}` 부분을 `@PathVariable Long userId`로 받는다. 자원을 식별하는 값은 경로에, 필터·정렬 조건은 쿼리 스트링에 두는 것이 REST 관례다.",
            "- 타입 변환에 실패하면(`/users/abc`를 Long으로) `MethodArgumentTypeMismatchException`으로 400이 된다.",
            "- 정규식 제약을 걸 수 있다: `{id:\\d+}`",
            "- 값이 없으면 핸들러 자체가 매칭되지 않으므로 보통 필수다."
          ],
          use: ["GET /orders/{orderId}로 특정 주문을 조회한다."],
          answer: "@PathVariable은 URL 경로 안의 변수 값을 받는 애너테이션입니다. /users/{id}처럼 자원을 식별하는 값은 경로에 두는 것이 REST 관례이고, 타입 변환에 실패하면 400이 됩니다.",
          followUps: [
            [
              "식별자는 @PathVariable, 조건은 @RequestParam으로 나누는 이유는?",
              "경로는 자원 자체를 식별하고 쿼리 스트링은 그 자원 목록을 거르거나 정렬하는 조건이라는 REST 관례 때문입니다. 이렇게 나누면 URL만 보고 의미를 알기 쉽습니다."
            ]
          ],
          related: ["spring/requestparam", "spring/handlermapping"]
        },
        {
          id: "spring/modelattribute",
          slug: "modelattribute",
          title: "@ModelAttribute",
          deep: false,
          def: "여러 요청 파라미터를 객체의 필드에 한꺼번에 바인딩하는 애너테이션이다.",
          why: "폼이나 쿼리 파라미터가 많을 때 하나씩 받지 않고 객체 하나로 묶어 바인딩하기 위해서다.",
          how: [
            "쿼리 스트링이나 폼 데이터(`application/x-www-form-urlencoded`)의 이름과 객체의 프로퍼티 이름을 맞춰 값을 넣는다. 생성자 바인딩(record 포함)이나 setter를 사용한다.",
            "- JSON 본문은 읽지 않는다. JSON은 `@RequestBody`를 쓴다.",
            "- 단순 타입이 아닌 객체 파라미터는 애너테이션을 생략해도 `@ModelAttribute`로 처리된다.",
            "- 타입 변환 실패는 BindingResult에 담기며, BindingResult를 파라미터로 받지 않으면 400 오류가 된다.",
            "- 검색 조건 객체(`OrderSearch`)를 받을 때 많이 쓴다."
          ],
          code: "public record OrderSearch(OrderStatus status, LocalDate from, LocalDate to) {}\n\n@GetMapping(\"/orders\")\npublic Page<OrderDto> search(@ModelAttribute OrderSearch cond, Pageable pageable) { ... }",
          codeLang: "java",
          use: ["검색 화면의 여러 조건을 OrderSearch record 하나로 받는다."],
          myth: [
            [
              "@ModelAttribute로 JSON 요청을 받을 수 있다.",
              "JSON 본문은 읽지 않아 필드가 모두 null이 된다. JSON은 @RequestBody를 써야 한다."
            ]
          ],
          answer: "@ModelAttribute는 쿼리 스트링이나 폼 데이터의 여러 파라미터를 객체 필드에 한꺼번에 바인딩합니다. 생성자나 setter로 값을 넣으며 JSON 본문은 읽지 않습니다. 단순 타입이 아닌 객체 파라미터는 애너테이션을 생략해도 이 방식으로 처리됩니다.",
          followUps: [
            [
              "타입 변환에 실패하면 어떻게 되나요?",
              "오류가 BindingResult에 담깁니다. 파라미터 바로 뒤에 BindingResult를 선언하면 직접 처리할 수 있고, 선언하지 않으면 예외가 나서 400 응답이 됩니다."
            ]
          ],
          related: ["spring/requestbody", "spring/requestparam", "spring/valid-geomjeung"]
        },
        {
          id: "spring/requestbody",
          slug: "requestbody",
          title: "@RequestBody",
          deep: false,
          def: "HTTP 요청 본문(JSON 등)을 HttpMessageConverter로 읽어 객체로 바꾸는 애너테이션이다.",
          why: "JSON 같은 요청 본문을 직접 파싱하지 않고 바로 객체로 받기 위해서다.",
          how: [
            "요청의 `Content-Type`을 보고 맞는 HttpMessageConverter를 고른다. JSON은 Jackson이 처리하며, 기본 생성자 + 필드 접근, 또는 생성자·record로 객체를 만든다.",
            "- 본문은 스트림이라 한 번만 읽을 수 있다. `@RequestBody`는 메서드당 하나만 쓴다.",
            "- JSON 형식이 잘못되면 `HttpMessageNotReadableException`으로 400이 된다.",
            "- `Content-Type`이 지원되지 않으면 415 Unsupported Media Type.",
            "- `@Valid`를 함께 붙이면 변환 후 검증까지 한다."
          ],
          code: "@PostMapping(\"/orders\")\npublic ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) { ... }",
          codeLang: "java",
          use: ["주문 생성 API에서 JSON 요청을 CreateOrderRequest DTO로 받는다."],
          myth: [
            [
              "@RequestBody 객체에는 반드시 setter가 필요하다.",
              "Jackson은 기본 생성자 + 필드 접근이나 생성자·record로도 객체를 만들 수 있다. setter가 꼭 필요하지 않다."
            ]
          ],
          answer: "@RequestBody는 HTTP 요청 본문을 HttpMessageConverter로 읽어 객체로 바꾸는 애너테이션입니다. JSON은 Jackson이 처리하고, 본문은 스트림이라 한 번만 읽을 수 있어 메서드당 하나만 씁니다. @Valid를 함께 붙이면 변환 후 검증까지 합니다.",
          analogy: "택배 상자를 뜯어 내용물을 정리해 주는 직원입니다. 상자 라벨(Content-Type)을 보고 뜯는 방법을 정합니다.",
          followUps: [
            [
              "JSON 형식이 잘못되면 어떤 응답이 나가나요?",
              "HttpMessageNotReadableException이 발생해 기본적으로 400이 됩니다. Content-Type이 지원되지 않으면 415가 나갑니다."
            ]
          ],
          related: ["spring/httpmessageconverter", "spring/modelattribute", "spring/valid-geomjeung"]
        },
        {
          id: "spring/argumentresolver",
          slug: "argumentresolver",
          title: "ArgumentResolver",
          deep: false,
          def: "컨트롤러 메서드의 각 파라미터 값을 만들어 주는 전략 인터페이스다.",
          why: "컨트롤러 파라미터가 어떻게 채워지는지 알고, 로그인 사용자 주입 같은 반복 작업을 커스텀 리졸버로 없애기 위해서다.",
          how: [
            "RequestMappingHandlerAdapter는 메서드를 호출하기 전에 파라미터마다 `supportsParameter()`가 true인 리졸버를 찾아 `resolveArgument()`로 값을 만든다. 스프링에는 30개가 넘는 리졸버가 기본 등록되어 있다.",
            "- `@RequestParam`, `@PathVariable`, `@ModelAttribute`, `@RequestBody`, `HttpServletRequest`, `Pageable`, `@AuthenticationPrincipal` 모두 리졸버가 처리한다.",
            "- 직접 구현해 `WebMvcConfigurer.addArgumentResolvers()`로 등록하면 `@LoginUser User user` 같은 커스텀 파라미터를 만들 수 있다.",
            "- 반환값 쪽은 짝이 되는 HandlerMethodReturnValueHandler가 처리한다."
          ],
          code: "public class LoginUserResolver implements HandlerMethodArgumentResolver {\n    public boolean supportsParameter(MethodParameter p) {\n        return p.hasParameterAnnotation(LoginUser.class);\n    }\n    public Object resolveArgument(MethodParameter p, ModelAndViewContainer mav,\n                                  NativeWebRequest req, WebDataBinderFactory f) {\n        return userRepository.findById(sessionUserId(req)).orElseThrow();\n    }\n}",
          codeLang: "java",
          use: ["@LoginUser User user 파라미터로 세션의 로그인 사용자를 바로 받아 컨트롤러 중복 코드를 없앤다."],
          answer: "ArgumentResolver(HandlerMethodArgumentResolver)는 컨트롤러 메서드의 각 파라미터 값을 만들어 주는 전략입니다. 파라미터마다 supportsParameter가 true인 리졸버를 찾아 resolveArgument로 값을 만들며, @RequestParam, @RequestBody, Pageable 모두 리졸버가 처리합니다. 직접 구현하면 @LoginUser 같은 커스텀 파라미터를 만들 수 있습니다.",
          analogy: "요리사 옆의 재료 준비 담당입니다. 레시피(파라미터 선언)를 보고 필요한 재료를 손질해 올려 둡니다.",
          followUps: [
            [
              "커스텀 ArgumentResolver는 어떻게 등록하나요?",
              "HandlerMethodArgumentResolver를 구현하고 WebMvcConfigurer의 addArgumentResolvers에 추가합니다. 기본 리졸버보다 뒤에 추가되므로 기본 리졸버가 먼저 처리하는 타입과 겹치지 않게 커스텀 애너테이션을 씁니다."
            ]
          ],
          related: ["spring/handleradapter", "spring/httpmessageconverter", "spring/requestparam"]
        },
        {
          id: "spring/httpmessageconverter",
          slug: "httpmessageconverter",
          title: "HttpMessageConverter",
          deep: false,
          def: "HTTP 본문과 자바 객체 사이를 변환하는 전략 인터페이스다.",
          why: "요청 본문과 응답 객체의 직렬화를 콘텐츠 타입에 맞게 자동으로 처리해 컨트롤러가 변환 코드를 갖지 않게 하기 위해서다.",
          how: [
            "요청은 `@RequestBody`, `HttpEntity`일 때, 응답은 `@ResponseBody`, `ResponseEntity`일 때 쓰인다. 요청은 `Content-Type`, 응답은 `Accept` 헤더와 반환 타입을 보고 `canRead()`/`canWrite()`가 true인 컨버터를 고른다.",
            "- ByteArrayHttpMessageConverter: `byte[]`",
            "- StringHttpMessageConverter: `String`을 텍스트 그대로",
            "- MappingJackson2HttpMessageConverter: 객체 ↔ JSON (Jackson ObjectMapper 사용)",
            "스프링 부트는 자동 설정된 ObjectMapper를 쓰므로 `spring.jackson.*` 설정이나 `Jackson2ObjectMapperBuilderCustomizer` 빈으로 날짜 형식, null 처리 등을 바꾼다."
          ],
          use: ["spring.jackson.serialization.write-dates-as-timestamps=false로 날짜를 ISO 문자열로 내려준다."],
          warn: ["String을 반환하면 Jackson이 아니라 StringHttpMessageConverter가 선택되어 JSON 따옴표 없이 그대로 나간다."],
          myth: [
            [
              "@RestController에서 String을 반환해도 JSON 문자열로 나간다.",
              "String은 StringHttpMessageConverter가 먼저 선택되어 따옴표 없는 텍스트로 나간다."
            ]
          ],
          answer: "HttpMessageConverter는 HTTP 본문과 자바 객체 사이를 변환하는 전략입니다. 요청은 Content-Type, 응답은 Accept 헤더와 반환 타입을 보고 컨버터를 고르며, JSON은 Jackson 기반 컨버터가 처리합니다. 스프링 부트는 자동 설정된 ObjectMapper를 쓰므로 spring.jackson 설정으로 형식을 바꿉니다.",
          followUps: [
            [
              "응답 형식은 어떤 기준으로 정해지나요?",
              "클라이언트의 Accept 헤더와 컨트롤러의 produces, 반환 타입을 비교해 쓸 수 있는 컨버터와 미디어 타입을 고릅니다. 맞는 것이 없으면 406 Not Acceptable이 됩니다."
            ]
          ],
          related: ["spring/requestbody", "spring/restcontroller", "spring/argumentresolver"]
        },
        {
          id: "spring/valid-geomjeung",
          slug: "valid-geomjeung",
          title: "@Valid 검증",
          deep: false,
          def: "Bean Validation 애너테이션으로 요청 값을 선언적으로 검증하는 방법이다.",
          why: "컨트롤러마다 if 문으로 입력값을 검사하는 중복을 없애고, 잘못된 요청을 비즈니스 로직 전에 걸러내기 위해서다.",
          how: [
            "DTO 필드에 `@NotBlank`, `@Email`, `@Positive`, `@Size` 같은 제약을 붙이고 파라미터에 `@Valid`(또는 스프링의 `@Validated`)를 붙이면 바인딩 후 Hibernate Validator가 검증한다. `spring-boot-starter-validation` 의존성이 필요하다.",
            "- `@RequestBody` 검증 실패: `MethodArgumentNotValidException` → 기본 400",
            "- `@ModelAttribute` 검증 실패: `BindingResult`로 받거나, 받지 않으면 예외 → 400",
            "- `@Validated`는 그룹 검증을 지원하고, 클래스에 붙이면 `@RequestParam` 같은 단일 파라미터 제약도 검증한다.",
            "- 중첩 객체를 검증하려면 필드에도 `@Valid`를 붙인다.",
            "실패 응답은 보통 `@RestControllerAdvice`에서 필드별 오류 메시지로 바꿔 내려준다."
          ],
          code: "public record CreateOrderRequest(\n    @NotNull Long productId,\n    @Positive int quantity,\n    @NotBlank String address) {}",
          codeLang: "java",
          use: ["회원 가입 요청 DTO에 @Email, @Size를 붙여 서비스 계층에 들어가기 전에 잘못된 입력을 걸러낸다."],
          myth: [["@Valid만 붙이면 중첩 객체 필드까지 검증된다.", "중첩 객체는 그 필드에도 @Valid를 붙여야 내부 제약이 검증된다."]],
          answer: "@Valid는 DTO 필드에 붙인 @NotBlank, @Positive 같은 Bean Validation 제약을 바인딩 후 검증하게 합니다. @RequestBody 검증이 실패하면 MethodArgumentNotValidException이 나고, 보통 @RestControllerAdvice에서 필드별 오류 메시지로 바꿔 400으로 응답합니다. spring-boot-starter-validation 의존성이 필요합니다.",
          followUps: [
            [
              "@Valid와 @Validated의 차이는 무엇인가요?",
              "@Valid는 자바 표준이고, @Validated는 스프링 애너테이션으로 검증 그룹을 지원합니다. 클래스에 @Validated를 붙이면 @RequestParam 같은 단일 파라미터 제약도 메서드 검증으로 처리됩니다."
            ]
          ],
          related: ["spring/requestbody", "spring/restcontrolleradvice", "spring/modelattribute"]
        }
      ]
    },
    {
      name: "컨트롤러 종류",
      compare: {
        cols: ["기준", "@Controller", "@RestController"],
        rows: [
          ["반환값 처리", "뷰 이름 → ViewResolver", "본문 → MessageConverter"],
          ["주요 용도", "서버 렌더링 HTML", "REST API(JSON)"],
          ["@ResponseBody", "메서드마다 필요", "모든 메서드에 기본"],
          ["Model 사용", "자주 사용", "거의 안 씀"]
        ]
      },
      concepts: [
        {
          id: "spring/controller",
          slug: "controller",
          title: "@Controller",
          deep: false,
          def: "뷰(HTML 템플릿)를 반환하는 전통적인 MVC 컨트롤러를 표시하는 애너테이션이다.",
          why: "서버에서 HTML을 렌더링해 응답하는 화면 중심 애플리케이션을 만들기 위해서다.",
          how: [
            "`@Component`를 포함하므로 컴포넌트 스캔으로 빈이 되고, RequestMappingHandlerMapping이 이 클래스의 매핑 메서드를 등록한다.",
            "- 메서드가 String을 반환하면 뷰 이름으로 해석되어 ViewResolver가 템플릿을 찾는다.",
            "- `Model` 파라미터에 데이터를 담으면 뷰에서 사용할 수 있다.",
            "- 메서드에 `@ResponseBody`를 붙이면 그 메서드만 JSON 응답을 한다."
          ],
          code: "@Controller\npublic class OrderPageController {\n    @GetMapping(\"/orders/{id}\")\n    public String detail(@PathVariable Long id, Model model) {\n        model.addAttribute(\"order\", orderService.find(id));\n        return \"order/detail\";        // templates/order/detail.html\n    }\n}",
          codeLang: "java",
          use: ["Thymeleaf로 관리자 페이지를 서버에서 렌더링한다."],
          answer: "@Controller는 뷰를 반환하는 전통적인 MVC 컨트롤러를 표시합니다. 메서드가 String을 반환하면 뷰 이름으로 해석되어 ViewResolver가 템플릿을 찾고, Model에 담은 데이터가 뷰에서 쓰입니다. 특정 메서드만 JSON으로 응답하려면 @ResponseBody를 붙입니다.",
          followUps: [
            [
              "@Controller와 @Component의 차이는 무엇인가요?",
              "둘 다 빈으로 등록되지만 @Controller가 붙은 클래스만 RequestMappingHandlerMapping이 요청 매핑 대상으로 인식합니다. 역할을 드러내는 의미도 있습니다."
            ]
          ],
          related: ["spring/restcontroller", "spring/viewresolver"]
        },
        {
          id: "spring/restcontroller",
          slug: "restcontroller",
          title: "@RestController",
          deep: false,
          def: "`@Controller`와 `@ResponseBody`를 합친 애너테이션으로, 모든 메서드의 반환값을 응답 본문에 직접 쓴다.",
          why: "메서드마다 `@ResponseBody`를 붙이지 않고 반환 객체를 JSON 응답으로 바로 내보내는 API 서버를 만들기 위해서다.",
          how: [
            "반환값이 뷰를 거치지 않고 HttpMessageConverter로 직렬화되어 응답 본문이 된다. 객체는 JSON으로, String은 텍스트 그대로 나간다.",
            "- REST API 서버의 컨트롤러는 대부분 `@RestController`를 쓴다.",
            "- 상태 코드나 헤더까지 정하려면 `ResponseEntity`를 반환한다.",
            "- 엔티티를 그대로 반환하지 말고 응답 전용 DTO로 바꿔 반환한다(지연 로딩 예외, 순환 참조, 내부 구조 노출 방지)."
          ],
          use: ["주문 API에서 OrderResponse DTO를 반환해 JSON으로 응답한다."],
          myth: [
            [
              "엔티티를 그대로 반환해도 괜찮다.",
              "지연 로딩 예외, 양방향 연관관계의 순환 참조, 내부 구조 노출, API 스펙이 엔티티 변경에 묶이는 문제가 생긴다. DTO로 변환해 반환한다."
            ]
          ],
          answer: "@RestController는 @Controller와 @ResponseBody를 합친 애너테이션으로, 모든 메서드의 반환값이 뷰를 거치지 않고 MessageConverter를 통해 응답 본문에 쓰입니다. REST API 컨트롤러에 쓰며, 엔티티 대신 응답 전용 DTO를 반환하는 것이 원칙입니다.",
          followUps: [
            [
              "@RestController에서 상태 코드를 바꾸려면 어떻게 하나요?",
              "ResponseEntity를 반환해 상태 코드와 헤더를 지정하거나, 항상 같은 코드라면 메서드에 @ResponseStatus를 붙입니다."
            ]
          ],
          related: ["spring/controller", "spring/responseentity", "spring/httpmessageconverter"]
        },
        {
          id: "spring/responseentity",
          slug: "responseentity",
          title: "ResponseEntity",
          deep: false,
          def: "응답 본문뿐 아니라 HTTP 상태 코드와 헤더까지 함께 표현하는 반환 타입이다.",
          why: "항상 200만 내려가는 대신 201, 204, 404처럼 상황에 맞는 상태 코드와 헤더를 응답에 담기 위해서다.",
          how: [
            "단순 객체를 반환하면 항상 200이지만, `ResponseEntity`를 쓰면 상황에 맞는 상태 코드를 줄 수 있다.",
            "- 생성: `ResponseEntity.created(uri).body(dto)` → 201과 Location 헤더",
            "- 본문 없음: `ResponseEntity.noContent().build()` → 204",
            "- 헤더 추가: `.header(\"Cache-Control\", \"no-store\")`",
            "항상 같은 상태 코드라면 객체를 반환하고 `@ResponseStatus`를 붙이는 것도 방법이다."
          ],
          code: "@PostMapping(\"/orders\")\npublic ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {\n    OrderResponse res = orderService.create(req);\n    return ResponseEntity.created(URI.create(\"/orders/\" + res.id())).body(res);\n}",
          codeLang: "java",
          use: ["주문 생성 API에서 ResponseEntity.created(uri).body(dto)로 201과 Location을 함께 내려준다."],
          answer: "ResponseEntity는 응답 본문과 함께 HTTP 상태 코드와 헤더까지 표현하는 반환 타입입니다. 생성 시 201과 Location 헤더, 삭제 시 204처럼 상황에 맞는 응답을 정확히 만들 수 있습니다.",
          followUps: [
            [
              "모든 API에 ResponseEntity를 써야 하나요?",
              "필수는 아닙니다. 상태 코드가 상황마다 달라지거나 헤더를 넣어야 할 때 쓰고, 항상 200이면 DTO를 바로 반환해도 됩니다. 팀 컨벤션으로 통일하는 경우가 많습니다."
            ]
          ],
          related: ["spring/restcontroller", "spring/problemdetail"]
        }
      ]
    },
    {
      name: "예외 처리",
      compare: {
        cols: ["개념", "적용 범위", "역할", "예시"],
        rows: [
          ["@ExceptionHandler", "선언된 컨트롤러·Advice", "예외별 처리 메서드 지정", "`@ExceptionHandler(NotFound.class)`"],
          ["@RestControllerAdvice", "여러 컨트롤러 전역", "공통 예외 처리 모음", "`GlobalExceptionHandler`"],
          [
            "HandlerExceptionResolver",
            "DispatcherServlet 수준",
            "예외를 응답으로 변환",
            "`ExceptionHandlerExceptionResolver`"
          ],
          ["ProblemDetail", "오류 응답 본문", "RFC 9457 표준 형식", "`type`, `title`, `status`, `detail`"]
        ]
      },
      concepts: [
        {
          id: "spring/exceptionhandler",
          slug: "exceptionhandler",
          title: "@ExceptionHandler",
          deep: false,
          def: "특정 예외가 발생했을 때 실행할 처리 메서드를 지정하는 애너테이션이다.",
          why: "컨트롤러마다 try-catch로 예외를 응답으로 바꾸는 중복 코드를 없애기 위해서다.",
          how: [
            "컨트롤러 안에 두면 그 컨트롤러에서 난 예외만 처리하고, `@RestControllerAdvice` 클래스에 두면 전체에 적용된다. 컨트롤러 안의 핸들러가 Advice보다 우선한다.",
            "- 처리할 예외 타입은 애너테이션 속성이나 메서드 파라미터로 지정한다. 여러 핸들러가 맞으면 가장 구체적인(하위) 예외 타입의 핸들러가 선택된다.",
            "- 반환값은 일반 컨트롤러처럼 처리되므로 DTO, `ResponseEntity`, `ProblemDetail`을 반환할 수 있다.",
            "- `@ResponseStatus`를 함께 붙여 상태 코드를 정한다. 붙이지 않으면 200이 나가는 실수를 하기 쉽다.",
            "ExceptionHandlerExceptionResolver가 이 메서드를 찾아 실행한다."
          ],
          code: "@ExceptionHandler(OrderNotFoundException.class)\n@ResponseStatus(HttpStatus.NOT_FOUND)\npublic ErrorResponse notFound(OrderNotFoundException e) {\n    return new ErrorResponse(\"ORDER_NOT_FOUND\", e.getMessage());\n}",
          codeLang: "java",
          use: ["OrderNotFoundException을 404와 에러 코드 응답으로 바꾼다."],
          myth: [
            [
              "@ExceptionHandler만 붙이면 상태 코드가 자동으로 4xx/5xx가 된다.",
              "상태 코드를 지정하지 않으면 200으로 응답한다. @ResponseStatus나 ResponseEntity로 꼭 지정해야 한다."
            ]
          ],
          answer: "@ExceptionHandler는 특정 예외가 발생했을 때 실행할 처리 메서드를 지정합니다. 컨트롤러 안에 두면 그 컨트롤러만, @RestControllerAdvice에 두면 전체에 적용되며, 여러 핸들러가 맞으면 가장 구체적인 예외 타입이 선택됩니다. 상태 코드는 @ResponseStatus나 ResponseEntity로 정합니다.",
          followUps: [
            [
              "컨트롤러 안의 핸들러와 Advice의 핸들러가 겹치면?",
              "컨트롤러 안의 @ExceptionHandler가 우선합니다. 특정 컨트롤러만 예외 응답을 다르게 하고 싶을 때 이 규칙을 이용합니다."
            ]
          ],
          related: ["spring/restcontrolleradvice", "spring/handlerexceptionresolver"]
        },
        {
          id: "spring/restcontrolleradvice",
          slug: "restcontrolleradvice",
          title: "@RestControllerAdvice",
          deep: false,
          def: "여러 컨트롤러에 공통으로 적용할 예외 처리를 한 클래스에 모으는 애너테이션이다.",
          why: "예외 처리를 한곳에 모아 모든 API가 같은 형식의 오류 응답을 내려주게 하기 위해서다.",
          how: [
            "`@ControllerAdvice` + `@ResponseBody`다. 이 클래스 안의 `@ExceptionHandler` 메서드가 모든 컨트롤러에서 난 예외를 처리한다.",
            "- 적용 범위를 좁힐 수 있다: `basePackages`, `assignableTypes`, `annotations` 속성",
            "- 실무 패턴: 비즈니스 예외의 공통 부모(`BusinessException`)와 에러 코드 enum을 두고, Advice 하나에서 `{code, message}` 형식의 일관된 응답으로 바꾼다. 예상하지 못한 `Exception`은 500으로 처리하고 로그를 남긴다.",
            "- 검증 실패(`MethodArgumentNotValidException`)를 필드별 오류 목록으로 바꾸는 것도 여기서 한다.",
            "- `ResponseEntityExceptionHandler`를 상속하면 스프링 MVC 기본 예외들이 `ProblemDetail` 형식으로 처리된다."
          ],
          code: "@RestControllerAdvice\npublic class GlobalExceptionHandler {\n    @ExceptionHandler(BusinessException.class)\n    public ResponseEntity<ErrorResponse> business(BusinessException e) {\n        return ResponseEntity.status(e.getCode().status()).body(ErrorResponse.of(e.getCode()));\n    }\n    @ExceptionHandler(Exception.class)\n    public ResponseEntity<ErrorResponse> unknown(Exception e) {\n        log.error(\"unexpected\", e);\n        return ResponseEntity.internalServerError().body(ErrorResponse.of(ErrorCode.INTERNAL));\n    }\n}",
          codeLang: "java",
          use: [
            "BusinessException을 상속한 예외들을 ErrorCode 기반 {code, message} 응답으로 통일한다.",
            "검증 실패를 필드별 오류 목록으로 바꿔 400으로 내려준다."
          ],
          warn: ["Filter에서 난 예외는 DispatcherServlet 밖이라 여기서 잡히지 않는다."],
          answer: "@RestControllerAdvice는 여러 컨트롤러에 공통으로 적용할 예외 처리를 한 클래스에 모으는 애너테이션입니다. 비즈니스 예외의 공통 부모와 에러 코드를 두고 일관된 에러 응답으로 바꾸며, 예상하지 못한 예외는 500과 로그로 처리합니다. Filter에서 난 예외는 잡지 못합니다.",
          analogy: "회사의 고객 불만 처리 창구입니다. 어느 부서에서 문제가 생겨도 같은 형식으로 답변합니다.",
          followUps: [
            [
              "적용 범위를 일부 컨트롤러로 좁힐 수 있나요?",
              "basePackages, assignableTypes, annotations 속성으로 특정 패키지나 컨트롤러에만 적용할 수 있습니다. API용과 화면용 Advice를 나눌 때 씁니다."
            ]
          ],
          related: ["spring/exceptionhandler", "spring/problemdetail", "spring/valid-geomjeung", "spring/filter"]
        },
        {
          id: "spring/handlerexceptionresolver",
          slug: "handlerexceptionresolver",
          title: "HandlerExceptionResolver",
          deep: false,
          def: "컨트롤러 처리 중 발생한 예외를 응답으로 바꾸는 DispatcherServlet의 예외 처리 전략이다.",
          why: "예외가 어떤 순서로 처리되어 응답이 되는지 알아야 의도하지 않은 500 응답이나 처리 누락을 진단할 수 있기 때문이다.",
          how: [
            "예외가 나면 DispatcherServlet이 등록된 리졸버들을 순서대로 호출하고, 처음으로 예외를 처리한 리졸버의 결과를 응답으로 쓴다.",
            "- ExceptionHandlerExceptionResolver: `@ExceptionHandler` 메서드를 실행한다. 가장 먼저 동작한다.",
            "- ResponseStatusExceptionResolver: `@ResponseStatus`가 붙은 예외나 `ResponseStatusException`의 상태 코드를 적용한다.",
            "- DefaultHandlerExceptionResolver: 스프링 내부 예외를 알맞은 4xx/5xx로 바꾼다(타입 변환 실패 → 400, 지원하지 않는 메서드 → 405).",
            "어떤 리졸버도 처리하지 못한 예외는 서블릿 컨테이너까지 올라가고, 스프링 부트는 `/error`로 다시 요청해 BasicErrorController가 기본 에러 응답을 만든다."
          ],
          flow: ["컨트롤러에서 예외 발생", "ExceptionHandler 리졸버", "ResponseStatus 리졸버", "Default 리졸버", "미처리 시 /error 재요청"],
          use: ["타입 변환 실패가 왜 500이 아니라 400으로 나가는지 DefaultHandlerExceptionResolver로 설명할 수 있다."],
          answer: "HandlerExceptionResolver는 컨트롤러 처리 중 발생한 예외를 응답으로 바꾸는 DispatcherServlet의 예외 처리 전략입니다. @ExceptionHandler를 실행하는 리졸버, @ResponseStatus를 적용하는 리졸버, 스프링 내부 예외를 4xx로 바꾸는 리졸버가 순서대로 시도됩니다. 아무도 처리하지 못하면 /error로 넘어가 기본 에러 응답이 만들어집니다.",
          followUps: [
            [
              "처리되지 않은 예외는 최종적으로 어떻게 되나요?",
              "서블릿 컨테이너까지 올라가고, 스프링 부트는 /error 경로로 다시 요청해 BasicErrorController가 기본 JSON 또는 HTML 에러 응답을 만듭니다."
            ]
          ],
          related: ["spring/exceptionhandler", "spring/dispatcherservlet"]
        },
        {
          id: "spring/problemdetail",
          slug: "problemdetail",
          title: "ProblemDetail",
          deep: false,
          def: "HTTP API 오류 응답의 표준 형식(RFC 9457, 이전 RFC 7807)을 표현하는 스프링 6의 클래스다.",
          why: "팀마다 제각각인 오류 응답 형식 대신 표준 형식을 써서 클라이언트가 일관되게 오류를 해석하게 하기 위해서다.",
          how: [
            "`type`, `title`, `status`, `detail`, `instance` 필드와 임의의 확장 속성을 가지며 `application/problem+json`으로 응답한다. 팀마다 다른 에러 형식 대신 표준을 따를 수 있다.",
            "- `@ExceptionHandler`에서 `ProblemDetail`을 반환하면 된다.",
            "- `spring.mvc.problemdetails.enabled=true`로 스프링 MVC 기본 예외도 이 형식으로 응답한다.",
            "- `setProperty(\"code\", \"ORDER_NOT_FOUND\")`로 서비스 고유 에러 코드를 추가할 수 있다."
          ],
          code: "@ExceptionHandler(OrderNotFoundException.class)\npublic ProblemDetail notFound(OrderNotFoundException e) {\n    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());\n    pd.setProperty(\"code\", \"ORDER_NOT_FOUND\");\n    return pd;\n}",
          codeLang: "java",
          use: ["@ExceptionHandler에서 ProblemDetail을 반환하고 setProperty로 서비스 고유 에러 코드를 추가한다."],
          answer: "ProblemDetail은 HTTP API 오류 응답 표준(RFC 9457)을 표현하는 스프링 6의 클래스입니다. type, title, status, detail, instance 필드와 확장 속성을 가지며 application/problem+json으로 응답해, 팀마다 다른 에러 형식 대신 표준을 따를 수 있습니다.",
          followUps: [
            [
              "스프링 기본 예외도 ProblemDetail로 응답하게 하려면?",
              "spring.mvc.problemdetails.enabled=true를 설정하거나 ResponseEntityExceptionHandler를 상속한 Advice를 등록하면 스프링 MVC 기본 예외가 ProblemDetail 형식으로 응답됩니다."
            ]
          ],
          related: ["spring/restcontrolleradvice", "spring/responseentity"]
        }
      ]
    }
  ]
};

export default topic;
